import { ActivitySummary } from "@/components/activity-summary";
import { ActivityTimeline } from "@/components/activity-timeline";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Activity — Raresquared Labs",
};

/**
 * The audit history, as runs rather than a log table.
 *
 * Runs are grouped by day. Lane numbers were removed — a bare 1 or 2 needed a sentence
 * above the list to decode, and overlapping start times already show concurrency.
 */
export default function ActivityPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Activity"
        description="A complete record of work carried out by your Raresquared workforce."
      />

      {/*
       * The timeline was capped at 736px, leaving ~660px of empty page to its right.
       * Today's totals fill it with the one thing a run-by-run list cannot show: the shape
       * of the day. Derived from the same runs, so the two can never disagree.
       *
       * Paired at xl (1280), not lg (1024): Home taught this the hard way — at 1024 the
       * rail leaves 672px, and splitting that two ways broke run summaries over four lines.
       * Below xl the summary sits under the timeline, where it still reads fine.
       */}
      <div className="grid items-start gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <ActivityTimeline />
        </div>
        <div className="xl:col-span-4">
          <ActivitySummary />
        </div>
      </div>
    </div>
  );
}
