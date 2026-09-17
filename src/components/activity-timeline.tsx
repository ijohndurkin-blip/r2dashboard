"use client";

import { ActivityRun } from "./activity-run";
import { EmptyState } from "./empty-state";
import { HistoryIcon } from "./icons";
import { usePortal } from "./portal-provider";

/**
 * The run history, scoped to the modules on the client's account so nothing appears for
 * an automation they do not have.
 */
export function ActivityTimeline() {
  const { runs } = usePortal();

  const earlierPattern = /yesterday|monday|friday/i;
  const today = runs.filter((run) => !earlierPattern.test(run.relativeTime));
  const earlier = runs.filter((run) => earlierPattern.test(run.relativeTime));

  const groups = [
    { label: "Today", items: today },
    { label: "Earlier", items: earlier },
  ].filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface">
        <EmptyState
          icon={<HistoryIcon className="h-5 w-5" />}
          title="No activity yet"
          description="Work carried out by your workforce will be recorded here."
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <section key={group.label}>
            <h2 className="mb-2.5 text-[13px] font-semibold text-muted">{group.label}</h2>
            {/*
             * No row-measure any more. The 736px cap kept timestamps near their runs when
             * the timeline spanned the full page; it now sits in a column narrower than
             * that, so the cap can never bind and would only mislead the next reader.
             */}
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              {group.items.map((run) => (
                <ActivityRun key={run.id} run={run} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
