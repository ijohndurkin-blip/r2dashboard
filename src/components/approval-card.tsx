"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { usePortal } from "./portal-provider";
import { CheckIcon, ClockIcon, WarningIcon } from "./icons";
import { WorkerAvatar } from "./worker-avatar";
import type { Approval } from "@/lib/types";

/**
 * One action awaiting confirmation.
 *
 * Structured as the three questions a client actually asks: what does it want to do, why,
 * and what is it based on. The supporting facts are a plain label/value list — never raw
 * JSON, never a log excerpt.
 */
export function ApprovalCard({ approval }: { approval: Approval }) {
  const { approveRequest, rejectRequest, activeModules } = usePortal();
  const pathname = usePathname();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  /*
   * Who raised this, and a way to reach them.
   *
   * Approvals carry an automationId; the worker lives on the module that unlocks it, so
   * the name comes from a lookup rather than from the approval itself — the same
   * relationship the rail's per-worker badges use.
   *
   * The link is suppressed when the card is already ON that worker's page: linking Grace
   * to Grace from her own list is a link to where you are standing. There the name still
   * shows, as plain text, so the meta line reads the same on both surfaces.
   */
  const raisedBy = activeModules.find((module) =>
    module.unlocks.includes(approval.automationId),
  );
  const workerHref = raisedBy ? `/systems/${raisedBy.id}` : null;
  const onTheirPage = workerHref !== null && pathname === workerHref;

  const resolved = approval.resolution;

  function act(outcome: "approve" | "reject") {
    setBusy(outcome);
    // Brief pause so the change registers visually rather than snapping away.
    setTimeout(() => {
      if (outcome === "approve") approveRequest(approval.id);
      else rejectRequest(approval.id);
      setBusy(null);
    }, 260);
  }

  /*
   * Defined once and placed twice — floated beside the title at sm and up, stacked under
   * the meta line below that. Rendering the same JSX in two positions beats duplicating
   * the button markup and letting the two copies drift.
   */
  const actions = resolved ? null : (
    <>
      <button
        type="button"
        onClick={() => act("approve")}
        disabled={busy !== null}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-signal px-4 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-60 sm:min-h-10"
      >
        {busy === "approve" ? "Approving…" : "Approve"}
      </button>
      {/*
       * Outlined red, not filled. Reject is destructive and used far less often than
       * Approve; two solid blocks side by side would compete, and a filled red would pull
       * the eye to the action a client takes least. The border and label carry the meaning.
       */}
      <button
        type="button"
        onClick={() => act("reject")}
        disabled={busy !== null}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-fault/40 bg-surface px-4 text-sm font-medium text-fault transition-colors hover:bg-fault-soft disabled:opacity-60 sm:min-h-10"
      >
        {busy === "reject" ? "Rejecting…" : "Reject"}
      </button>
    </>
  );

  return (
    <article className="rounded-2xl border border-line bg-surface">
      <div className="px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3.5">
          {/*
           * The worker's face, with the status as a badge on it, rather than a status
           * glyph alone. An approval is a person asking for something, and their name was
           * already the first thing on the meta line — the face puts who is asking and
           * what they want in one place.
           *
           * The badge, not the face, carries pending-vs-resolved. That distinction is why
           * the icon was here, and it has to survive at a glance: amber while it waits,
           * green once it is dealt with. It sits on the circle's lower-right, ringed in
           * the card's own surface colour so it reads as a separate mark rather than part
           * of the photograph.
           *
           * Colour alone on the pending badge, no glyph. A warning triangle inside a 15px
           * circle renders about 10px across, and at that size its stroke and centre dot
           * blur into an unreadable smudge — the shape needs more room than the badge has.
           * The check survives the same reduction because it is two strokes with nothing
           * inside them, and it is worth keeping: it is the difference between "dealt
           * with" and "still waiting", which colour alone would leave to hue perception.
           *
           * The full-size glyph is not lost — the meta line and the buttons say what state
           * the card is in, and a resolved card carries its outcome in words below.
           *
           * No face where the worker cannot be resolved — an approval whose module has
           * been removed still renders, so the glyph stays as the fallback.
           */}
          {raisedBy ? (
            <span className="relative mt-0.5 shrink-0">
              <WorkerAvatar moduleId={raisedBy.id} size={36} />
              <span
                aria-hidden="true"
                className={`absolute -bottom-0.5 -right-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full ring-2 ring-surface ${
                  resolved ? "bg-signal text-surface" : "bg-flag"
                }`}
              >
                {resolved ? <CheckIcon className="h-2.5 w-2.5" /> : null}
              </span>
            </span>
          ) : (
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                resolved ? "bg-paper text-subtle" : "bg-flag-soft text-flag"
              }`}
            >
              {resolved ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <WarningIcon className="h-4 w-4" />
              )}
            </span>
          )}

          <div className="min-w-0 flex-1">
            {/* Desktop: the pair sits at the card's top right, beside the title. */}
            {!resolved ? (
              <div className="float-right ml-4 hidden gap-2.5 sm:flex">{actions}</div>
            ) : null}

            {/*
             * The same mark Home shows, so the two surfaces agree on which approvals
             * lead and why. Only on a pending one: once it is resolved, how urgent it was
             * is history, and the card's outcome is what matters.
             */}
            <h3 className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[15.5px] font-semibold leading-snug text-ink">
              {approval.title}
              {approval.urgent && !resolved ? (
                <span className="rounded bg-flag-soft px-1.5 py-0.5 text-[11.5px] font-medium text-flag">
                  Urgent
                </span>
              ) : null}
            </h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px] text-subtle">
              {/*
               * The worker leads the meta line, because "who is asking" is the first
               * thing a client wants from it. The job follows, then the time.
               */}
              {raisedBy ? (
                <>
                  {workerHref && !onTheirPage ? (
                    <Link
                      href={workerHref}
                      className="font-medium text-muted underline-offset-2 transition-colors hover:text-ink hover:underline"
                    >
                      {raisedBy.personName}
                    </Link>
                  ) : (
                    <span className="font-medium text-muted">{raisedBy.personName}</span>
                  )}
                  <span aria-hidden="true">·</span>
                </>
              ) : null}
              <span>{approval.automationName}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" />
                {approval.submitted}
              </span>
            </p>

            {/*
             * Buttons in the header, level with the title, at the client's explicit
             * request — asked for twice, after the alternative was put to them.
             *
             * The trade, recorded rather than hidden: this puts the commit control above
             * the evidence. Measured, Approve sits level with the title and 182px above the
             * data grid, so a client can approve a £3,180 invoice before the value, the
             * supplier and the difference have entered their eyeline. The footer position
             * kept 296px of reading between the title and the button.
             *
             * Mobile keeps them below the meta line rather than squeezed beside it: at
             * 375px a title plus two buttons on one row leaves nothing readable.
             */}
            <div className="mt-4 flex flex-col gap-2.5 sm:hidden">{actions}</div>

            {/*
             * One shared measure for everything in this column, not a cap per element.
             *
             * These three blocks used to carry two different caps set at different times:
             * 72ch on the prose and on the action box, row-measure on the grid below. Same
             * intent, three different results — measured at 1440 they ended at x=942, 1025
             * and 1095, stair-stepping down the card. A single right edge reads as
             * deliberate where three read as unfinished.
             *
             * row-measure (736px) is the one that wins because the grid needs it most: it
             * is label-against-value, and wider than this each pair stopped reading as one
             * fact. The prose and action box are comfortable at the same width.
             */}
            <p className="row-measure mt-3 text-sm leading-relaxed text-muted">
              {approval.reason}
            </p>

            <div className="row-measure mt-4 rounded-lg border border-line bg-paper px-4 py-3">
              <p className="text-[12.5px] text-subtle">Requested action</p>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                {approval.requestedAction}
              </p>
            </div>

            {/*
             * row-measure (736px), not max-w-4xl: at 4xl each label/value pair spanned
             * ~440px, leaving 280–323px between a label and its own value, so the pair
             * stopped reading as one fact. Shared with the prose and action box above —
             * see the note there.
             *
             * Left-aligned, not centred. Centring only this grid would step it inward from
             * the blocks that share the card's left edge; the whole column reads as one.
             */}
            <dl className="row-measure mt-4 grid w-full gap-x-10 gap-y-2.5 sm:grid-cols-2">
              {approval.context.map((entry) => (
                <div key={entry.label} className="flex justify-between gap-3 text-[13px]">
                  <dt className="text-subtle">{entry.label}</dt>
                  <dd className="tabular text-right font-medium text-ink">{entry.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/*
       * The footer only exists for a resolved card now. While pending it would be an empty
       * bordered strip, since the buttons moved into the header.
       */}
      {resolved ? (
        <div className="border-t border-line px-5 py-3.5 sm:px-6">
          <p className="flex items-center gap-2 text-[13px] text-muted">
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${
                resolved.outcome === "approved" ? "bg-signal" : "bg-subtle"
              }`}
            />
            {resolved.outcome === "approved" ? "Approved" : "Rejected"} {resolved.when}
          </p>
        </div>
      ) : null}
    </article>
  );
}
