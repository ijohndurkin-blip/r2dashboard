"use client";

import { useId, useState } from "react";
import { Icon, ChevronDownIcon } from "./icons";
import { StatusIndicator } from "./status-indicator";
import { WorkerAvatar } from "./worker-avatar";
import { usePortal } from "./portal-provider";
import type { IconKey, Run } from "@/lib/types";

/**
 * Only OUTCOMES carry colour. "An email arrived" is not a status, so the working steps
 * stay neutral — an earlier version tinted them brand blue, which made a four-step run
 * look like a row of coloured beads and buried the one step that actually mattered.
 */
function stepTone(icon: IconKey): string {
  switch (icon) {
    case "check":
      return "border-signal/40 bg-surface text-signal";
    case "warning":
      return "border-fault/40 bg-surface text-fault";
    case "refresh":
      return "border-flag/40 bg-surface text-flag";
    default:
      return "border-line bg-surface text-subtle";
  }
}

/**
 * One run in the activity history, expandable into its sequence of steps.
 *
 * When something fails the client sees a plain explanation of what it means for them.
 * The underlying technical detail stays behind a disclosure, because "HTTP 503 on PATCH
 * /crm/v3/objects" is not information a business owner can act on.
 *
 * Runs used to carry a "lane" number and stub of line to signal concurrency. The client
 * asked what they meant, which was the answer: a bare 1 or 2 explained nothing and needed
 * a sentence above the list to decode it. Overlapping start times and a live "In progress"
 * status already show that work runs in parallel, without anything to learn.
 */
export function ActivityRun({ run }: { run: Run }) {
  const { activeModules } = usePortal();
  const [open, setOpen] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);
  const panelId = useId();

  /*
   * Who did this run. Through `unlocks` rather than the automation's `handledBy` name, so
   * the face cannot be resolved to the wrong worker when two share a first name.
   */
  const worker = activeModules.find((module) =>
    module.unlocks.includes(run.automationId),
  );

  return (
    <article className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        /*
         * A failed run gets a left edge in the fault colour, so it is findable while
         * scanning eight near-identical rows instead of being marked only by a small dot
         * and the word "Failed".
         */
        className={`flex w-full items-start gap-3.5 border-l-2 px-4 py-4 text-left transition-colors hover:bg-paper sm:px-5 ${
          run.status === "failed"
            ? "border-l-fault/60"
            : run.status === "awaiting-approval"
              ? "border-l-flag/50"
              : "border-l-transparent"
        }`}
      >
        <span className="tabular mt-0.5 hidden w-12 shrink-0 text-[12.5px] text-subtle sm:block">
          {run.startedAt}
        </span>

        {/*
         * The worker beside the job. Every other surface names the person against the
         * work; this list gave the job name alone.
         *
         * 26px, and outside the text column rather than inline with the title: the title
         * row wraps its status pill, and an avatar inside a flex-wrap row moves when the
         * pill drops to a second line.
         */}
        {worker ? (
          <WorkerAvatar moduleId={worker.id} size={26} className="mt-0.5 shrink-0" />
        ) : null}

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-sm font-medium text-ink">{run.automationName}</span>
            {/* A status, not a glyph — it carries meaning, so it stays readable. */}
            {run.involvedApproval ? (
              <span className="rounded bg-flag-soft px-1.5 py-0.5 text-[12.5px] font-medium text-flag">
                Approval involved
              </span>
            ) : null}
          </span>
          {/* Capped: unconstrained these ran the full content width, ~170 chars a line. */}
          <span className="mt-1 block max-w-[78ch] text-[13px] leading-snug text-muted">
            {run.summary}
          </span>

          <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <StatusIndicator status={run.status} />
            <span className="tabular text-[12.5px] text-subtle">
              {run.duration ? `Took ${run.duration}` : "In progress"}
            </span>
            <span className="tabular text-[12.5px] text-subtle sm:hidden">
              {run.relativeTime}
            </span>
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-3">
          <span className="tabular hidden text-[12.5px] text-subtle sm:block">
            {run.relativeTime}
          </span>
          <ChevronDownIcon
            className={`mt-0.5 h-4 w-4 text-subtle transition-transform duration-150 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {open ? (
        /*
         * Indented to clear the time column so the steps read as nested inside their run,
         * and with no background fill. The fill was `bg-paper` against the card's white —
         * a ~1.5% luminance difference, too faint to read as a deliberate surface but
         * just visible enough to look like a stray highlight. It was also full-bleed
         * while its content is indented to 104px, so the empty left portion showed as a
         * grey band. The nesting is carried by the indent and the step rail instead,
         * matching the portal's language: structure from spacing and hairlines, not fills.
         */
        <div id={panelId} className="px-4 pb-5 pt-1 sm:px-5 sm:pl-[104px]">
          {run.clientMessage ? (
            <div className="mb-4 rounded-lg border border-line bg-surface px-4 py-3">
              <p className="text-[13px] leading-relaxed text-ink">{run.clientMessage}</p>
              {run.technicalDetail ? (
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => setShowTechnical((value) => !value)}
                    aria-expanded={showTechnical}
                    className="text-[12.5px] text-muted underline decoration-line-strong underline-offset-2 transition-colors hover:text-ink"
                  >
                    {showTechnical ? "Hide technical details" : "View technical details"}
                  </button>
                  {showTechnical ? (
                    <p className="mt-2 rounded border border-line bg-paper px-3 py-2 font-mono text-[12px] leading-relaxed text-muted">
                      {run.technicalDetail}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {/*
           * Each step draws its own rail segment rather than the list carrying one
           * continuous `border-l`: with a single border the line ran behind the icons
           * (their bg-surface fill did not match this panel's bg-paper, so it showed
           * through) and the nodes sat 26px outside the line instead of on it.
           *
           * Now the segment spans from the top of the row to the icon, and stops. The
           * last step draws no segment below it, so the rail ends at the final node.
           */}
          <ol className="ml-1 space-y-3.5">
            {run.steps.map((step, index) => (
              <li key={`${step.time}-${index}`} className="flex gap-3">
                <span className="relative flex w-5 shrink-0 justify-center">
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-[calc(100%-2px)] top-[-16px] w-px bg-line"
                    />
                  ) : null}
                  {/*
                   * Tinted by what the step means, so a run is scannable without
                   * reading: a failure catches the eye, a completion reads as done,
                   * and the intermediate work stays quiet.
                   */}
                  {/*
                   * The mask colour must match the panel behind it, or the rail line cuts
                   * straight through each node. It was bg-paper when the panel was tinted;
                   * now the panel is white, so stepTone() fills with bg-surface.
                   */}
                  <span
                    className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full border ${stepTone(step.icon)}`}
                  >
                    <Icon name={step.icon} className="h-3 w-3" />
                  </span>
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5 pt-0.5">
                  <span className="tabular text-[12.5px] text-subtle">{step.time}</span>
                  <span className="text-[13px] leading-snug text-ink">{step.description}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </article>
  );
}
