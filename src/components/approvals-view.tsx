"use client";

import { useState } from "react";
import { ApprovalCard } from "./approval-card";
import { EmptyState } from "./empty-state";
import { ExternalReviewList } from "./external-review-list";
import { CheckIcon } from "./icons";
import { usePortal } from "./portal-provider";

/**
 * Pending and completed approvals. Pending is the default, because it is the only tab
 * that represents outstanding work.
 */
type Tab = "pending" | "completed";

export function ApprovalsView() {
  const { pendingApprovals, completedApprovals, bobReviewItems } = usePortal();
  const [tab, setTab] = useState<Tab>("pending");

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "pending", label: "Pending", count: pendingApprovals.length },
    { id: "completed", label: "Completed", count: completedApprovals.length },
  ];

  const shown = tab === "pending" ? pendingApprovals : completedApprovals;

  return (
    /*
     * Capped at 860px rather than running the full 1097px column.
     *
     * The cards' content stops well short of the card edge: the data grid is 736px and
     * starts 46px in (32px status icon + 14px gap), plus 24px of card padding each side —
     * 830px of actual content inside a 1097px card, leaving ~266px of dead white.
     *
     * 860 rather than the 830 floor: measured, 840 leaves 9px of slack and 860 leaves 29,
     * which is the margin a longer supplier name or title needs in real data. Sizing to
     * the demo content exactly would be brittle.
     *
     * The cap sits on the whole view, not on the card list, so the tablist's bottom border
     * ends where the cards end. Capping only the list left the tabs running to 1385 while
     * the cards stopped at 1148 — the same ragged-edge problem the card's own three
     * different measures had.
     *
     * mx-auto centres the column in the content area rather than leaving all the slack on
     * the right. This page is a single column of decisions with nothing beside it, so
     * there is no left edge for it to share — unlike Settings or Your systems, where a
     * centred block would break the page's one left edge.
     */
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-8">
      {/*
       * Bob's flagged invoices, separate from the tabbed list below: they aren't seed
       * approvals you can act on here, they're a live read of his own application. Hidden
       * entirely once there's nothing to show, rather than an empty state every visit.
       */}
      {bobReviewItems.length > 0 ? (
        <section aria-labelledby="bob-review" className="flex flex-col gap-3">
          <h2 id="bob-review" className="flex items-baseline gap-2 text-[15px] font-semibold text-ink">
            Needs review in Bob · Invoice Processor
            <span className="tabular text-[13px] font-normal text-muted">
              {bobReviewItems.length}
            </span>
          </h2>
          <ExternalReviewList items={bobReviewItems} />
        </section>
      ) : null}

      <div className="flex flex-col gap-5">
        <div role="tablist" aria-label="Approvals" className="flex gap-1 border-b border-line">
          {tabs.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={selected}
                aria-controls={`panel-${item.id}`}
                onClick={() => setTab(item.id)}
                className={`-mb-px grid min-h-10 items-center border-b-2 px-3 text-[13.5px] transition-colors ${
                  selected
                    ? "border-ink font-medium text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {/*
                 * Selecting a tab swaps it to font-medium, and bold text is wider: measured,
                 * Pending went 86.89px -> 88.34px and Completed 103.58px -> 105.34px on
                 * click. That ~1.5px growth shoved the neighbouring tab sideways every time
                 * you switched.
                 *
                 * So both states occupy the bold width. The invisible twin below is always
                 * font-medium and dictates the column; the visible row sits in the same grid
                 * cell and changes weight inside a box that no longer moves. The twin
                 * duplicates the label *and* the count because the count span sets size and
                 * colour but not weight, so it inherited the 400/500 swap too — tabular-nums
                 * equalises digit widths within a weight, not across two.
                 */}
                <span aria-hidden className="invisible col-start-1 row-start-1 flex items-center gap-2 font-medium">
                  {item.label}
                  <span className="tabular text-[12.5px]">{item.count}</span>
                </span>
                <span className="col-start-1 row-start-1 flex items-center gap-2">
                  {item.label}
                  <span className="tabular text-[12.5px] text-subtle">{item.count}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          className="flex flex-col gap-4"
        >
          {/*
           * The cards are h3. Without this the outline jumped h1 -> h3, which reads as a
           * missing level to a screen reader. Visually redundant with the tab, hence sr-only.
           */}
          <h2 className="sr-only">
            {tab === "pending" ? "Pending approvals" : "Completed approvals"}
          </h2>
          {shown.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface">
              <EmptyState
                icon={<CheckIcon className="h-5 w-5" />}
                title={
                  tab === "pending"
                    ? "No approvals waiting. You're all caught up."
                    : "Nothing completed yet"
                }
                description={
                  tab === "pending"
                    ? "Raresquared will ask here whenever something needs your confirmation."
                    : "Approvals you have actioned will be listed here."
                }
              />
            </div>
          ) : (
            shown.map((approval) => <ApprovalCard key={approval.id} approval={approval} />)
          )}
        </div>
      </div>
    </div>
  );
}
