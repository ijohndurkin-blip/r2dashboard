"use client";

import Link from "next/link";
import { Card, CardHeader } from "./card";
import { EmptyState } from "./empty-state";
import { BoxIcon, CheckIcon, ChevronRightIcon, Icon, PauseIcon } from "./icons";
import { usePortal } from "./portal-provider";
import { StatusIndicator } from "./status-indicator";
import { WorkerAvatar } from "./worker-avatar";
import type { Module } from "@/lib/types";

/**
 * The parts of Home that read live state.
 *
 * These are client components because approving something on /approvals has to change the
 * counts here too. Home itself stays a server component and mounts these three.
 */

/**
 * The worker an automation belongs to.
 *
 * Resolved through `unlocks` rather than by matching `handledBy` against `personName`:
 * the name is what the row prints, and two workers sharing a first name would both
 * match it, where the id relationship cannot be ambiguous. Same lookup the approval
 * card uses.
 */
function workerFor(modules: Module[], automationId: string) {
  return modules.find((module) => module.unlocks.includes(automationId));
}

/**
 * The single line that answers "is everything healthy?".
 *
 * Deliberately not a card: the brief asks for a very simple status, not a large panel.
 * This is the boldest element on the page, and everything around it stays quiet.
 */
export function SystemStatusBand() {
  const { allHealthy, pendingApprovals, automations, bobReviewItems } = usePortal();
  const running = automations.filter((automation) => automation.status !== "paused").length;
  const runsToday = automations.reduce((total, automation) => total + automation.runsToday, 0);

  /*
   * Approvals and unhealthy systems ask different things of the client: one is a decision
   * only they can make, the other is something Raresquared is already handling. So they
   * are named separately, and approvals lead — that is the part that waits on a person.
   *
   * They used to share the headline, joined by a "·". That read as one sentence and gave
   * two unlike things equal weight, so the half the client had to act on sat level with
   * the half being handled for them. The job count is status now and lives with the other
   * status numbers below; only what waits on a person is the headline.
   */
  const needsAttention = automations.filter(
    (automation) => automation.status === "needs-attention",
  ).length;

  /*
   * Bob's flagged invoices are exactly the same kind of thing as a pending approval — a
   * decision only the client can make — so they join this count rather than getting a
   * second headline. The card and the rail already agree on this same total (see
   * AttentionList and app-sidebar.tsx).
   */
  const waitingOnClient = pendingApprovals.length + bobReviewItems.length;
  const approvalPhrase = `${waitingOnClient} ${
    waitingOnClient === 1 ? "approval" : "approvals"
  } waiting on you`;
  /*
   * These count AUTOMATIONS, not people. Four workers run eight automations between
   * them, so phrasing this as "1 worker needs attention" would print a number that
   * disagrees with the four rows in the rail — the same failure as the old "4 items need
   * your attention". The band stays about the work; the rail names who does it.
   */
  const systemPhrase = `${needsAttention} ${
    needsAttention === 1 ? "job needs" : "jobs need"
  } attention`;

  /*
   * The headline names WHAT needs doing rather than counting "items". The count used to
   * be attentionCount — approvals plus unhealthy systems — so the largest text on the
   * page read "4 items need your attention" while the list below it, the card heading and
   * the sidebar badge all said 3. The 4 was arithmetically right and still failed the
   * five-second read: a client counts the list, gets three, and cannot tell what the
   * fourth thing is. Two unlike things were being summed into one number.
   */
  const attentionHeadline = allHealthy
    ? "Everything running normally"
    : waitingOnClient > 0
      ? approvalPhrase
      : systemPhrase;

  return (
    <section
      aria-labelledby="status-band-heading"
      className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
    >
      {/*
       * A real heading, visually hidden.
       *
       * This was aria-label="Status" on the section, which named the landmark but put
       * nothing in the document outline — so the band, the loudest thing on the page, was
       * the one region a screen reader could not jump to by heading. The visible headline
       * cannot serve as the heading itself: it changes with the state ("3 approvals
       * waiting on you", "Everything running normally"), and a heading that renames
       * itself is not a stable landmark to navigate by.
       */}
      <h2 id="status-band-heading" className="sr-only">
        Status
      </h2>
      {/*
       * 18px semibold, not 15px medium. This sentence is the answer to "is everything
       * OK?" — the whole reason the band exists — and at 15px it carried the same weight
       * as the metadata beside it, so the band read as a toolbar rather than a headline.
       *
       * The dot does not pulse. An `animate-ping` on it pulled the eye to a 10px
       * decoration and away from the link that actually does something, and it did so in
       * both states — a green dot throbbing at a client whose systems are all fine is
       * motion with nothing to report. The colour carries the state on its own.
       */}
      <p className="flex items-center gap-2.5 text-[18px] font-semibold tracking-[-0.01em] text-ink">
        <span
          aria-hidden="true"
          className={`flex h-2.5 w-2.5 shrink-0 rounded-full ${
            allHealthy ? "bg-signal" : "bg-flag"
          }`}
        />
        {attentionHeadline}
      </p>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-muted">
        <span>
          <span className="tabular text-ink">{running}</span> jobs running
        </span>
        <span>
          <span className="tabular text-ink">{runsToday}</span> runs today
        </span>
        {/*
         * Demoted from the headline. A job needing attention is something Raresquared is
         * already on, so it belongs with the status numbers rather than level with the
         * part that waits on a person. Amber so it is still findable among them.
         */}
        {needsAttention > 0 ? <span className="text-flag">{systemPhrase}</span> : null}
        {/*
         * "Review approvals", not the count again. This said "3 waiting on you" while the
         * headline said "3 approvals waiting on you" — the same fact twice, 900px apart.
         * The count stays in the headline; this says what to do about it.
         *
         * The Link stays rather than moving the action onto the headline: it carries the
         * only adequate tap target in the band (min-h-9), where an 18px line of text is
         * not one.
         */}
        {waitingOnClient > 0 ? (
          <Link
            href="/approvals"
            className="-my-1.5 flex min-h-9 items-center gap-1 rounded-lg px-2 font-medium text-flag transition-colors hover:bg-flag-soft hover:text-flag"
          >
            Review approvals
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Pending approvals, shown prominently. A few items at most, each with a way to act.
 *
 * Bob's flagged invoices join this same list rather than getting a card of their own:
 * they're the same kind of thing — a decision only the client can make — and Home's job
 * is gathering that across every worker, not just the ones with seed automations behind
 * them. Uncapped rather than sliced to 3 like the approvals: this is one worker's queue
 * rather than portal-wide demo data, and in practice never runs deep enough to need it.
 */
export function AttentionList() {
  const { pendingApprovals, activeModules, bobReviewItems } = usePortal();
  const shown = pendingApprovals.slice(0, 3);
  const remaining = pendingApprovals.length - shown.length;
  const totalWaiting = pendingApprovals.length + bobReviewItems.length;

  return (
    /* h-full: shares the height of Your systems beside it. */
    <Card className="h-full">
      <CardHeader
        title="Needs your attention"
        count={
          totalWaiting > 0
            ? `${totalWaiting} ${totalWaiting === 1 ? "approval waiting" : "approvals waiting"}`
            : undefined
        }
      />

      {totalWaiting === 0 ? (
        <EmptyState
          compact
          icon={<CheckIcon className="h-5 w-5" />}
          title="You're all caught up."
          description="Nothing needs your approval right now."
        />
      ) : (
        <>
          <ul className="divide-y divide-line">
            {bobReviewItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <WorkerAvatar moduleId="mod-bob-invoice-processor" size={32} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug text-ink">
                      {item.invoiceNumber}
                      <span className="font-normal text-muted"> · {item.supplierName}</span>
                    </p>
                    <p className="mt-1.5 text-[12.5px] text-subtle">
                      Bob · Invoice Processor
                      {typeof item.totalAmount === "number"
                        ? ` · £${item.totalAmount.toFixed(2)}`
                        : ""}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/systems/mod-bob-invoice-processor?review=${encodeURIComponent(item.id)}`}
                  className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-surface px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper"
                >
                  View
                </Link>
              </li>
            ))}
            {shown.map((approval) => {
              const worker = workerFor(activeModules, approval.automationId);
              return (
              <li
                key={approval.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
              >
                {/*
                 * The face and the request together, as on /approvals — an approval is
                 * someone asking for something. No status badge on it here: every row in
                 * this list is pending by definition, so a "waiting" mark on each one
                 * would say nothing the card's own heading does not.
                 *
                 * The worker's name goes on the meta line beneath, which named only the
                 * automation. A face with no name attached is a decoration.
                 */}
                <div className="flex min-w-0 items-start gap-3">
                  {worker ? (
                    <WorkerAvatar moduleId={worker.id} size={32} className="mt-0.5" />
                  ) : null}
                  <div className="min-w-0">
                    {/*
                     * The mark is what makes the sort legible. Ordering the list without
                     * it just moves rows around for no reason a client can see.
                     *
                     * Beside the title rather than on the meta line below, because the
                     * meta line is where the quiet supporting detail lives and this is
                     * the reason the row is first.
                     */}
                    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="text-sm font-medium leading-snug text-ink">
                        {approval.title}
                      </span>
                      {approval.urgent ? (
                        <span className="rounded bg-flag-soft px-1.5 py-0.5 text-[11.5px] font-medium text-flag">
                          Urgent
                        </span>
                      ) : null}
                    </p>
                    {/* Capped so the reason stays inside a comfortable reading measure. */}
                    <p className="mt-1 max-w-[62ch] text-[13px] leading-relaxed text-muted">
                      {approval.reason}
                    </p>
                    <p className="mt-1.5 text-[12.5px] text-subtle">
                      {worker ? `${worker.personName} · ` : ""}
                      {approval.automationName} · {approval.submitted}
                    </p>
                  </div>
                </div>
                <Link
                  href="/approvals"
                  className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-surface px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper"
                >
                  Review
                </Link>
              </li>
              );
            })}
          </ul>
          {remaining > 0 ? (
            <div className="border-t border-line px-5 py-3">
              <Link
                href="/approvals"
                className="flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-ink"
              >
                {remaining} more waiting
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : null}
        </>
      )}
    </Card>
  );
}

/** Completed work, scoped to the modules on the client's account. */
export function RecentWorkList() {
  const { recentWork } = usePortal();
  const items = recentWork.slice(0, 6);

  if (items.length === 0) {
    return (
      <EmptyState
        compact
        icon={<CheckIcon className="h-5 w-5" />}
        title="No work recorded yet"
        description="Completed work will appear here as your workforce runs."
      />
    );
  }

  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3.5 px-5 py-3.5 sm:items-center">
          {/*
           * Status shows in the glyph and its border, not a filled pastel tile: every row
           * having a coloured block made the list look like a sticker sheet. The tile
           * stays white; only the outline and the mark itself carry the state.
           */}
          <span
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-surface sm:mt-0 ${
              item.status === "awaiting-approval"
                ? "border-flag/40 text-flag"
                : item.status === "failed"
                  ? "border-fault/40 text-fault"
                  : "border-line-strong text-muted"
            }`}
          >
            <Icon name={item.icon} className="h-4 w-4" />
          </span>

          {/*
           * The measure lives on the card (see page.tsx), not here. Capping the row
           * closed the gap but left a dead region inside a full-width card; capping the
           * card shrinks the frame to its content instead.
           */}
          <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="text-sm leading-snug text-ink">{item.description}</p>
              <p className="mt-0.5 text-[12.5px] text-muted">{item.automationName}</p>
            </div>

            <div className="mt-1.5 flex items-center gap-4 sm:mt-0 sm:shrink-0">
              <StatusIndicator status={item.status} />
              <span className="tabular text-[12.5px] text-subtle sm:w-24 sm:text-right">
                {item.relativeTime}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Each automation, its health, and how much it has done today — one line each. */
export function AutomationSnapshotList() {
  const { automations, activeModules, bobReviewItems, bobRunsToday } = usePortal();
  const bobIsActive = activeModules.some((module) => module.id === "mod-bob-invoice-processor");

  if (automations.length === 0 && !bobIsActive) {
    return (
      <EmptyState
        compact
        icon={<BoxIcon className="h-5 w-5" />}
        title="Nobody working yet"
        description="Take someone on from Hire workers and their activity shows up here."
      />
    );
  }

  return (
    <ul className="divide-y divide-line">
      {/*
       * Bob's real activity, not a seed automation — there's no fabricated flow diagram
       * or success rate behind him to reuse the row below for, so this is hand-built from
       * the same real numbers his sidebar badge and Home's attention list already use.
       */}
      {bobIsActive ? (
        <li className="px-5 py-3.5">
          <Link
            href="/systems/mod-bob-invoice-processor"
            className="group flex items-center justify-between gap-4"
          >
            <WorkerAvatar
              moduleId="mod-bob-invoice-processor"
              size={28}
              className="mt-0.5 shrink-0"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">
                Invoice Processing
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted">
                <span className="shrink-0">Bob</span>
                <span aria-hidden="true" className="text-subtle">
                  ·
                </span>
                <StatusIndicator status={bobReviewItems.length > 0 ? "needs-attention" : "running"} />
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="tabular block text-[12.5px] text-muted">
                {bobRunsToday} {bobRunsToday === 1 ? "invoice" : "invoices"} today
              </span>
              {bobReviewItems.length > 0 ? (
                <span className="mt-0.5 block text-[12.5px] font-medium text-flag">
                  {bobReviewItems.length} {bobReviewItems.length === 1 ? "approval" : "approvals"}{" "}
                  pending
                </span>
              ) : null}
            </span>
          </Link>
        </li>
      ) : null}
      {automations.slice(0, bobIsActive ? 4 : 5).map((automation) => {
        const worker = workerFor(activeModules, automation.id);
        return (
        <li key={automation.id} className="px-5 py-3.5">
          <Link
            href="/systems"
            className="group flex items-center justify-between gap-4"
          >
            {/*
             * The face leads the row, because this list already named the worker and a
             * name beside a job reads as a person's line rather than a system's. 28px:
             * the row is two lines of small type, so the avatar spans them without
             * setting the row's height itself.
             */}
            {worker ? (
              <WorkerAvatar moduleId={worker.id} size={28} className="mt-0.5 shrink-0" />
            ) : null}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">
                {automation.name}
              </span>
              {/*
               * Who did it, beside the status.
               *
               * This card listed job names alone while every other surface — the rail,
               * the cards, the run history — names the person. `handledBy` already holds
               * the worker's first name, so the list can say "Marcus · Running normally"
               * rather than leaving Home the one place still speaking of systems.
               *
               * The name leads and the status follows it, matching the phrasing used
               * everywhere else ("Marcus · Goods In").
               */}
              <span className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted">
                <span className="shrink-0">{automation.handledBy}</span>
                <span aria-hidden="true" className="text-subtle">
                  ·
                </span>
                <StatusIndicator status={automation.status} />
              </span>
            </span>

            <span className="shrink-0 text-right">
              {automation.status === "paused" ? (
                /* StatusIndicator already says "Paused"; don't repeat the word here. */
                <PauseIcon className="ml-auto h-3.5 w-3.5 text-subtle" />
              ) : (
                <span className="tabular block text-[12.5px] text-muted">
                  {automation.runsToday} runs today
                </span>
              )}
              {automation.requiresApproval && automation.status === "needs-attention" ? (
                /* The most action-relevant line here — it should not be the smallest. */
                <span className="mt-0.5 block text-[12.5px] font-medium text-flag">
                  1 approval pending
                </span>
              ) : null}
            </span>
          </Link>
        </li>
        );
      })}
    </ul>
  );
}
