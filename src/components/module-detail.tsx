import { FlowDiagram } from "./flow-diagram";
import type { Automation, Run } from "@/lib/types";

/**
 * What a module's automations are and what they have been doing.
 *
 * This is the body only — no dialog chrome, no page header. It is rendered in two places:
 * the "View details" dialog on a system card, and the module's own page at
 * /systems/[moduleId]. Extracting it was the point: the dialog markup used to be the only
 * copy, and a second one written for the page would have drifted from it within a change
 * or two. One component, two mounts.
 *
 * A server component — it takes everything as props and holds no state, so the page can
 * render it directly while the card renders it inside a client dialog.
 */
export function ModuleDetail({
  automations,
  runs,
}: {
  /** Automations this module switches on. */
  automations: Automation[];
  /** Runs belonging to those automations, newest first. */
  runs: Run[];
}) {
  return (
    <>
      {automations.map((automation) => {
        const automationRuns = runs.filter((run) => run.automationId === automation.id);
        return (
          <section key={automation.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h4 className="text-[13.5px] font-semibold text-ink">{automation.name}</h4>
              <span className="tabular text-[12.5px] text-subtle">
                {automation.successRate}% successful · {automation.runsToday} today
              </span>
            </div>

            {/*
             * No outlined box. A full-width border around the flow made it read as
             * a form field; the diagram now sits directly on the panel with its own
             * vertical breathing room.
             */}
            <div className="mt-4 pb-1">
              <FlowDiagram steps={automation.flow.map((node) => ({ node }))} />
            </div>

            {/* Measure inherited from whichever surface mounts this. */}
            <dl className="mt-3 grid gap-x-8 gap-y-2.5 text-[13px] sm:grid-cols-2">
              <div>
                <dt className="text-subtle">Starts when</dt>
                <dd className="mt-0.5 text-ink">{automation.trigger}</dd>
              </div>
              <div>
                <dt className="text-subtle">Works with</dt>
                <dd className="mt-0.5 text-ink">{automation.tools.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-subtle">Your approval</dt>
                <dd className="mt-0.5 text-ink">
                  {automation.requiresApproval
                    ? "Needed for important actions"
                    : "Not needed"}
                </dd>
              </div>
              <div>
                <dt className="text-subtle">Recent runs</dt>
                <dd className="mt-0.5 text-ink">
                  {automationRuns.length > 0
                    ? automationRuns[0].summary
                    : "Nothing recorded yet"}
                </dd>
              </div>
            </dl>

            {/*
             * The configuration summary. The brief listed this as part of the
             * workflow detail view and the data has carried it all along; it was
             * lost when this component replaced WorkflowCard during the modules
             * merge, leaving four entries per automation unrendered.
             */}
            {automation.configuration.length > 0 ? (
              <div className="mt-5 border-t border-line pt-4">
                <h5 className="text-[12.5px] font-semibold text-ink">How it is set up</h5>
                <dl className="mt-2.5 grid gap-x-8 gap-y-2 text-[13px] sm:grid-cols-2">
                  {automation.configuration.map((entry) => (
                    <div key={entry.label} className="flex justify-between gap-4">
                      <dt className="text-subtle">{entry.label}</dt>
                      <dd className="text-right text-ink">{entry.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </section>
        );
      })}
    </>
  );
}
