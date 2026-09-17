"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ModuleDetail } from "./module-detail";
import { StatusIndicator } from "./status-indicator";
import { WorkerAvatar } from "./worker-avatar";
import { WorkerFigure, hasFigure } from "./worker-figure";
import { CheckIcon, CloseIcon, ClockIcon, PlusIcon } from "./icons";
import { usePortal } from "./portal-provider";
import { useDialog } from "./use-dialog";
import type { Automation, Module, Run } from "@/lib/types";

/**
 * One system the client has: the module they pay for, and the work it actually does.
 *
 * Modules and automations used to live on separate pages, which meant a client saw
 * "Goods In" in one place and "Goods Receipt Review" in another and had to work out that
 * they were the same thing. One card now answers both questions: what am I paying for,
 * and is it working.
 */
export function SystemCard({
  module,
  automations,
  runs,
}: {
  module: Module;
  /** Automations this module switches on. */
  automations: Automation[];
  /** Runs belonging to those automations, newest first. */
  runs: Run[];
}) {
  const { removeModule, bobReviewItems, bobRunsToday } = usePortal();
  const { open, openDialog, close, panelRef, triggerRef } = useDialog<HTMLDivElement>();
  const titleId = `system-${module.id}-title`;
  const [removing, setRemoving] = useState(false);
  const isBob = module.id === "mod-bob-invoice-processor";

  const runsToday = isBob
    ? bobRunsToday
    : automations.reduce((total, a) => total + a.runsToday, 0);
  const needsAttention = isBob
    ? bobReviewItems.length > 0
    : automations.some((a) => a.status === "needs-attention");
  const lastRun = automations[0]?.lastRun;

  return (
    /*
     * No col-span any more. The detail used to expand inside the card, which forced the
     * card to span both grid columns so its flow diagram had room — and left the three
     * remaining collapsed cards unable to fill two columns, so one sat alone on its row.
     * The detail is a dialog now, so it gets its own guaranteed width and the grid stays
     * an even 2×2 whatever is open.
     */
    <article className="flex h-full flex-col rounded-2xl border border-line bg-surface">
      {/*
       * The figure is a column of the card, not an item in the header row. Inside the
       * header it only had that row's height, which made a whole person either a smudge
       * or — once it was tall enough to read — something that squeezed the description
       * into a narrow gutter and stretched the card past its neighbour. As a column it
       * stands alongside the heading and the checklist together, and the text keeps its
       * width.
       *
       * `items-end` stands the figure on the checklist's baseline rather than floating it
       * against the heading, so it reads as someone standing on the card.
       */}
      <div className="flex flex-1 items-start gap-3 px-5 py-5 sm:px-6">
        {/*
         * A full-length render where there is one, the head crop otherwise. Only some
         * workers have been rendered full length yet, and a missing file would show as a
         * broken image rather than nothing, so the choice is gated on the asset existing.
         *
         * The head-avatar fallback stays in the header row where it has always been: it is
         * 40px and belongs beside the name, not standing in a column of its own.
         *
         * The figure is a column of the card rather than an item in the header row, so it
         * stands alongside the heading and the checklist together instead of being capped
         * at one row's height. Anchored top-left: `items-start` on the row rather than
         * `items-end`, so the worker hangs from the card's top edge rather than standing
         * on the checklist's baseline.
         *
         * Lifted so the head sits on the name's line rather than starting below it. The
         * render has empty space above the hair, so the lift is smaller than the head's
         * own height: the card's top padding is 20px and pulling much past it puts the
         * figure outside the card, where it is clipped away entirely.
         *
         * `-ml-4`/`sm:-ml-5` pulls the figure back through the card's own left padding so
         * it sits close to the edge, which buys the description the width it needs to stop
         * wrapping every few words. The 2:3 box is mostly empty either side of a standing
         * figure, so the visible body still clears the card's border.
         */}
        {hasFigure(module.id) ? (
          <WorkerFigure
            moduleId={module.id}
            height={260}
            className="-ml-4 -mt-4 sm:-ml-5"
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="flex min-w-0 items-start gap-3.5">
              {hasFigure(module.id) ? null : (
                <WorkerAvatar moduleId={module.id} size={40} className="mt-0.5" />
              )}
              <div className="min-w-0">
                {/*
                 * No id here. titleId belongs to the dialog's own heading, which is what
                 * aria-labelledby points at; carrying it on both would emit a duplicate id
                 * and the dialog's accessible name would resolve to this card instead.
                 */}
                {/* Name first, job beside it — as the rail and the worker's own page read. */}
                <h3 className="text-[15.5px] font-semibold leading-snug text-ink">
                  {module.personName}
                  <span className="font-normal text-muted">{` · ${module.name}`}</span>
                </h3>
                <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted">
                  {module.description}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-1.5">
              <StatusIndicator
                status={needsAttention ? "needs-attention" : "running"}
                colored
              />
              <span className="tabular text-[12.5px] text-muted">
                {`${runsToday} ${runsToday === 1 ? "run" : "runs"} today`}
              </span>
            </div>
          </div>

          {/* What it handles, in the client's words. */}
          <ul className="mt-4 space-y-1.5">
            {module.includes.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] text-ink">
                <CheckIcon className="mt-[3px] h-3.5 w-3.5 shrink-0 text-signal" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 sm:px-6">
        {removing ? (
          /*
           * Swaps the whole footer for a confirmation, the same inline pattern
           * AvailableSystemCard uses for "Take X on" — one row, no separate dialog for
           * what is a single reversible toggle.
           */
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] leading-relaxed text-ink">
              Remove {module.personName} from your account? They&rsquo;ll move back to Hire
              workers, ready to take on again.
            </p>
            <div className="flex shrink-0 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  removeModule(module.id);
                  setRemoving(false);
                }}
                className="inline-flex min-h-9 items-center justify-center rounded-lg bg-fault px-3.5 text-[13px] font-medium text-surface transition-opacity hover:opacity-90"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={() => setRemoving(false)}
                className="inline-flex min-h-9 items-center justify-center rounded-lg border border-line-strong bg-surface px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted">
              <ClockIcon className="h-3.5 w-3.5 text-subtle" />
              {lastRun ? `Last run ${lastRun.toLowerCase()}` : "Ready and waiting"}
              <span aria-hidden="true" className="text-subtle">
                ·
              </span>
              <span className="tabular">£{module.monthlyPrice}/month</span>
              {/* Since-when was recorded in the data but never shown. */}
              {module.addedOn ? (
                <>
                  <span aria-hidden="true" className="text-subtle">
                    ·
                  </span>
                  <span>Added {module.addedOn}</span>
                </>
              ) : null}
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRemoving(true)}
                className="inline-flex min-h-9 items-center rounded-lg border border-fault/40 bg-surface px-3 text-[13px] font-medium text-fault transition-colors hover:bg-fault-soft"
              >
                Remove
              </button>
              {/*
               * aria-haspopup="dialog", not aria-expanded: the button no longer controls
               * an inline region that grows below it, so "expanded" would describe
               * nothing.
               *
               * No chevron. The original pointed down to signal a panel unfolding in
               * place; a right-pointing one replaced it when this became a dialog, but it
               * was decoration — the label already says what the button does, and
               * haspopup tells assistive tech a dialog is coming.
               */}
              <button
                ref={triggerRef}
                type="button"
                onClick={openDialog}
                aria-haspopup="dialog"
                className="flex min-h-9 items-center rounded-lg px-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper"
              >
                View {module.personName}
              </button>
            </div>
          </>
        )}
      </div>

      {open
        ? createPortal(
            /*
             * Portalled to the body, not rendered in place. Inside the card it would
             * inherit the grid cell's stacking and be clipped by any ancestor overflow;
             * at the body it sits above everything, including the rail's z-50 popovers.
             *
             * The overlay closes on click, which is why it carries the handler rather
             * than a separate backdrop element: one surface, one job.
             */
            <div
              /*
               * lg:left-[248px] matches the layout's own rail offset, so the overlay spans
               * the content area rather than the whole viewport. Without it justify-center
               * centres against the window and the 248px rail drags the dialog left of the
               * content it belongs to.
               *
               * inset-0 still sets the other three edges; the later `left` simply wins at
               * lg and up. Below lg the rail is a drawer rather than a fixed column, so
               * full-viewport is correct there.
               *
               * Consequence worth knowing: this element is also the click-to-close surface,
               * so clicking the rail no longer dismisses the dialog. That follows from the
               * rail being outside the dialog's context; Escape and the close button are
               * unaffected.
               */
              className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/40 p-4 sm:items-center sm:p-6 lg:left-[248px]"
              onClick={close}
            >
              {/*
               * The measure is guaranteed here rather than contingent on the grid. When
               * this was an inline panel its width came from the card, which is why the
               * card had to span both columns — uncapped the flow diagram spread its four
               * nodes over ~1050px with 226px rules and read as four unrelated icons, and
               * at 548px each node compressed to ~120px under a 12px label. A dialog is
               * sized by its own max-width, so neither failure is reachable.
               *
               * stopPropagation so a click on the content does not close through to the
               * overlay behind it.
               */}
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                onClick={(event) => event.stopPropagation()}
                className="row-measure my-auto w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-lg outline-none"
              >
                <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
                  <div className="flex min-w-0 items-center gap-3.5">
                    {/*
                     * The worker's face, arriving as their dialog opens. The initials
                     * disc still sits underneath it inside WorkerAvatar, so a module
                     * without artwork degrades to the portal's own person idiom rather
                     * than a broken image.
                     */}
                    <WorkerAvatar
                      moduleId={module.id}
                      size={44}
                      className="avatar-in"
                    />
                    <div className="min-w-0">
                      <h3
                        id={titleId}
                        className="text-[15.5px] font-semibold leading-snug text-ink"
                      >
                        {module.personName}
                        <span className="font-normal text-muted">{` · ${module.name}`}</span>
                      </h3>
                      <p className="mt-0.5 text-[12.5px] text-muted">
                        How {module.personName} is set up and what they have been doing
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close details"
                    className="-mr-1.5 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-ink"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>

                {/*
                 * The body is shared with the module's own page at /systems/[moduleId],
                 * so the two surfaces cannot drift. Only the chrome around it — overlay,
                 * heading, close button — belongs to the dialog.
                 */}
                <div className="flex max-h-[min(70vh,44rem)] flex-col gap-6 overflow-y-auto bg-paper px-5 py-5 sm:px-6">
                  <ModuleDetail automations={automations} runs={runs} />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </article>
  );
}

/** A system the client could add. Explains what it would do, and what it costs. */
export function AvailableSystemCard({ module }: { module: Module }) {
  const { purchaseModule } = usePortal();
  const [confirming, setConfirming] = useState(false);
  const [adding, setAdding] = useState(false);

  function confirm() {
    setAdding(true);
    // Brief pause so the change reads as an action taking effect, not a flicker.
    setTimeout(() => {
      purchaseModule(module.id);
      setAdding(false);
      setConfirming(false);
    }, 320);
  }

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-surface">
      {/*
       * Someone you could hire, shown the way someone you already have is shown on
       * /systems: a full-length figure in its own column, anchored top-left with its head
       * on the name's line, and the head crop as the fallback where there is no figure.
       * A worker should not change shape between the page where you take them on and the
       * page where you see them working.
       */}
      <div className="flex flex-1 items-start gap-3 px-5 py-5 sm:px-6">
        {hasFigure(module.id) ? (
          <WorkerFigure
            moduleId={module.id}
            height={260}
            className="-ml-4 -mt-4 sm:-ml-5"
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-start gap-3.5">
            {hasFigure(module.id) ? null : (
              <WorkerAvatar moduleId={module.id} size={40} className="mt-0.5" />
            )}
            <div className="min-w-0">
              {/* Name first, job beside it — the same phrasing the rail and worker pages use. */}
              <h3 className="text-[15.5px] font-semibold leading-snug text-ink">
                {module.personName}
                <span className="font-normal text-muted">{` · ${module.name}`}</span>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{module.description}</p>
            </div>
          </div>

          <ul className="mt-4 space-y-1.5">
            {module.includes.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] text-ink">
                <CheckIcon className="mt-[3px] h-3.5 w-3.5 shrink-0 text-signal" />
                {item}
              </li>
            ))}
          </ul>

          {module.typicalImpact ? (
            <p className="mt-4 border-l-2 border-line-strong pl-3 text-[13px] leading-relaxed text-muted">
              {module.typicalImpact}
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-line px-5 py-3.5">
        {confirming ? (
          <div className="flex flex-col gap-3">
            <p className="text-[13px] leading-relaxed text-ink">
              Take {module.personName} on for £{module.monthlyPrice} a month? It goes on
              your next invoice and they start straight away.
            </p>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={confirm}
                disabled={adding}
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-ink px-4 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {adding ? "Taking them on…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={adding}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line-strong bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-paper disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="tabular text-[13px] text-ink">
              £{module.monthlyPrice}
              <span className="text-muted">/month</span>
            </p>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Take {module.personName} on
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
