"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ActivityRun } from "./activity-run";
import { ApprovalCard } from "./approval-card";
import { EmptyState } from "./empty-state";
import { ExternalReviewList } from "./external-review-list";
import { PageHeader } from "./page-header";
import { WorkerAvatar } from "./worker-avatar";
import { CheckIcon, HistoryIcon, ServiceIcon } from "./icons";
import { usePortal } from "./portal-provider";

/**
 * One module's dashboard: is it working, what needs me, what has it been doing.
 *
 * A client view rather than a server page because everything here is scoped to the
 * modules on the account, and that filtering lives in the provider. Reading the seed
 * data directly would report work for systems the client does not have — the failure
 * DESIGN.md calls out as the kind of thing that destroys trust in the portal.
 *
 * The body is a SLOT. Some modules will eventually be backed by a real application
 * rather than seed data — an invoice processor with its own upload, review queue and
 * supplier list — and when one is, it mounts through `children` while the shell above
 * (back link, title, status band) stays portal-owned. That keeps one page furniture and
 * one set of page mechanics whatever is running underneath.
 */
export function ModuleView({
  moduleId,
  children,
  tools,
}: {
  moduleId: string;
  /** Replaces the default seed-data dashboard entirely. */
  children?: ReactNode;
  /**
   * Rendered between the status band and the default body, so a worker backed by a real
   * application gets their tool WITHOUT losing the decisions and run history below it.
   *
   * `children` replaces everything and is the wrong shape for that: a worker who can be
   * given a document still has approvals waiting and runs to show.
   */
  tools?: ReactNode;
}) {
  const {
    modules,
    activeModules,
    automations,
    runs,
    pendingApprovals,
    bobReviewItems,
    bobRunsToday,
    googleDriveConnector,
  } = usePortal();

  const moduleEntry = modules.find((entry) => entry.id === moduleId);
  const isActive = activeModules.some((entry) => entry.id === moduleId);

  // The id was validated against the seed list on the server, so this is unreachable in
  // practice; it keeps the component total rather than asserting non-null.
  if (!moduleEntry) return null;

  /*
   * A module that is real but not on the account. Reached by typing the URL, or by
   * following a stale link. It explains itself and points at the place to add it,
   * rather than 404ing something the client can legitimately buy.
   */
  if (!isActive) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title={moduleEntry.name} description={moduleEntry.description} />
        <div className="rounded-2xl border border-line bg-surface px-5 py-5 sm:px-6">
          <p className="max-w-prose text-sm leading-relaxed text-muted">
            This system is not on your account yet, so there is nothing to report on it.
            You can take them on from Hire workers — they start straight away.
          </p>
          <Link
            href="/hire"
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-ink px-4 text-sm font-medium text-surface transition-opacity hover:opacity-90"
          >
            See what they do
          </Link>
        </div>
      </div>
    );
  }

  const moduleAutomations = automations.filter((automation) =>
    moduleEntry.unlocks.includes(automation.id),
  );
  const moduleRuns = runs.filter((run) => moduleEntry.unlocks.includes(run.automationId));
  const moduleApprovals = pendingApprovals.filter((approval) =>
    moduleEntry.unlocks.includes(approval.automationId),
  );

  /*
   * Bob isn't backed by seed automations at all (`unlocks` is empty), so his own status
   * band and "Waiting on you" count come from his live application instead — otherwise
   * this page would say "Running normally" right above an embedded app showing the
   * opposite, which is exactly the kind of disagreeing-numbers failure DESIGN.md warns
   * against elsewhere on this page.
   */
  const isBob = moduleId === "mod-bob-invoice-processor";
  const waitingCount = isBob ? bobReviewItems.length : moduleApprovals.length;

  const needsAttention = moduleAutomations.some((a) => a.status === "needs-attention");
  const runsToday = isBob
    ? bobRunsToday
    : moduleAutomations.reduce((total, a) => total + a.runsToday, 0);
  const lastRun = moduleAutomations[0]?.lastRun;

  /*
   * One sentence naming what needs doing, in the shape Home's status band uses. Four
   * stat tiles were the other candidate and were rejected: on a module with a single
   * automation they read "1 run today · 0 waiting · 100%", which is dashboard theatre,
   * and DESIGN.md reserves colour for status rather than decoration.
   *
   * No averaged success rate. Purchase Ledger runs two automations, and the unweighted
   * mean of two percentages is a number that describes nothing. Each automation shows
   * its own rate further down, where it is attributable.
   */
  const headline =
    waitingCount === 0
      ? needsAttention
        ? "Needs attention"
        : "Running normally"
      : isBob
        ? `${waitingCount} ${waitingCount === 1 ? "invoice needs" : "invoices need"} review`
        : `${waitingCount} ${waitingCount === 1 ? "approval" : "approvals"} waiting on you`;

  return (
    <div className="flex flex-col gap-8">
      {/*
       * No back link. This is a destination in its own right — it has its own row in the
       * rail, so it is reached directly rather than by descending from /systems, and a
       * "back to Your systems" crumb framed it as a subpage of somewhere else.
       */}
      {/*
       * The person leads, their job follows in the description: "Marcus", then "Goods In
       * — Checks every delivery…". The client asked for these to read as a workforce
       * rather than software they own, and this says who is doing the work without
       * hiding what the work is.
       *
       * The description is used verbatim rather than lowercased into the sentence — it
       * is written as its own sentence in the data, and an em dash carries the join
       * without needing a helper to recase the first letter.
       */}
      {/*
       * The worker's face beside their own title. This page is ABOUT that person, and it
       * was the one surface without a face once the cards, the rail and the dialog all
       * had one — the page you land on from the rail looked like a different thing from
       * the row you clicked.
       *
       * 52px: larger than the dialog's 44 because a page header carries more weight than
       * a dialog's, and the title beside it is 26–28px rather than 15.5.
       */}
      <div className="flex items-start gap-4">
        <WorkerAvatar
          moduleId={moduleEntry.id}
          size={52}
          className="mt-1"
        />
        <PageHeader
          title={moduleEntry.personName}
          description={`${moduleEntry.name} — ${moduleEntry.description}`}
        />
      </div>

      {/* The status band, in Home's shape: the answer first, the metadata quiet beside it. */}
      <section
        aria-label={`${moduleEntry.personName} status`}
        className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
      >
        <p className="flex items-center gap-2.5 text-[18px] font-semibold tracking-[-0.01em] text-ink">
          <span
            aria-hidden="true"
            className={`relative flex h-2.5 w-2.5 shrink-0 rounded-full ${
              waitingCount > 0 || needsAttention ? "bg-flag" : "bg-signal"
            }`}
          >
            <span
              className={`absolute inset-0 animate-ping rounded-full opacity-50 motion-reduce:animate-none ${
                waitingCount > 0 || needsAttention ? "bg-flag" : "bg-signal"
              }`}
            />
          </span>
          {headline}
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-muted">
          <span>
            <span className="tabular text-ink">{runsToday}</span>{" "}
            {runsToday === 1 ? "run" : "runs"} today
          </span>
          {lastRun ? <span>Last run {lastRun.toLowerCase()}</span> : null}
          <span className="tabular">£{moduleEntry.monthlyPrice}/month</span>
          {isBob && googleDriveConnector?.connected ? (
            <span className="inline-flex items-center gap-1">
              <ServiceIcon id="google-drive" className="h-3.5 w-3.5" />
              Synced to Google Drive
            </span>
          ) : null}
        </div>
      </section>

      {/*
       * A worker's tool, if they have one — rendered above their decisions and history
       * rather than instead of them.
       */}
      {tools}

      {/*
       * Everything below is the replaceable body. A module backed by a real application
       * passes its own; the default is the seed-data dashboard.
       */}
      {children ?? (
        <>
          {/* What it handles, in the client's words. */}
          {/*
           * No "What this system covers" either.
           *
           * It listed module.includes, which the module's card on /systems already shows
           * — the same three lines, same tick glyphs. Together with "How it works" that
           * was two thirds of this page restating the systems page.
           *
           * What remains is only what /systems does NOT tell you: whether this system
           * needs a decision from you right now, and what it has actually been doing.
           * The description under the title still says what it covers, in a sentence.
           */}

          {/*
           * Decisions waiting on this worker, actionable HERE.
           *
           * This used to list each approval and then send you to /approvals to act on
           * it, which made the worker's page a summary of a decision you had to go
           * somewhere else to make. It renders the same ApprovalCard the approvals page
           * does, so Approve and Reject work in place and the two surfaces cannot drift
           * — the card carries its own buttons and calls the provider itself.
           *
           * Resolving one here updates this list, the worker's badge in the rail, the
           * "All approvals" count and the bell together, because all of them read the
           * same provider state.
           *
           * The cards are stacked bare rather than wrapped in a Card: ApprovalCard is
           * already a bordered card, and nesting would double the border. Same framing
           * the approvals page uses.
           */}
          <section aria-labelledby="module-approvals" className="flex flex-col gap-4">
            <h2
              id="module-approvals"
              className="flex items-baseline gap-2 text-[15px] font-semibold text-ink"
            >
              Waiting on you
              {waitingCount > 0 ? (
                <span className="tabular text-[13px] font-normal text-muted">
                  {waitingCount}
                </span>
              ) : null}
            </h2>

            {isBob ? (
              bobReviewItems.length === 0 ? (
                <div className="rounded-2xl border border-line bg-surface">
                  <EmptyState
                    compact
                    icon={<CheckIcon className="h-5 w-5" />}
                    title="Nothing waiting on you."
                    description={`${moduleEntry.personName} has no decisions outstanding.`}
                  />
                </div>
              ) : (
                <ExternalReviewList items={bobReviewItems} />
              )
            ) : moduleApprovals.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface">
                <EmptyState
                  compact
                  icon={<CheckIcon className="h-5 w-5" />}
                  title="Nothing waiting on you."
                  description={`${moduleEntry.personName} has no decisions outstanding.`}
                />
              </div>
            ) : (
              moduleApprovals.map((approval) => (
                <ApprovalCard key={approval.id} approval={approval} />
              ))
            )}
          </section>

          {/*
           * "Latest runs", deliberately uncounted.
           *
           * The status band above says "12 runs today" from the automation's own figure,
           * while the seed data holds four run records. Heading this list with a count
           * would print two numbers a client can compare and find disagreeing — the exact
           * failure DESIGN.md records for "4 items need your attention". The list shows
           * the most recent work and does not claim to be the whole day.
           */}
          <section aria-labelledby="module-runs">
            <h2
              id="module-runs"
              className="mb-2.5 text-[13px] font-semibold text-muted"
            >
              Latest runs
            </h2>
            {moduleRuns.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface">
                <EmptyState
                  icon={<HistoryIcon className="h-5 w-5" />}
                  title="No runs recorded yet"
                  description={`Work carried out by ${moduleEntry.personName} will be recorded here.`}
                />
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                {moduleRuns.map((run) => (
                  <ActivityRun key={run.id} run={run} />
                ))}
              </div>
            )}
          </section>

          {/*
           * No "How it works" section here.
           *
           * It rendered the same ModuleDetail the card's "View details" dialog on
           * /systems already shows — the setup, flow and configuration of each
           * automation, verbatim. Two surfaces describing the same thing is the failure
           * the client corrected when modules and automations were separate pages, and
           * this page had reintroduced it. The dialog keeps that reference material;
           * this page answers "is it working and does it need me".
           */}
        </>
      )}
    </div>
  );
}
