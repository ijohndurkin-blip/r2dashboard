"use client";

import Link from "next/link";
import { WorkerAvatar } from "./worker-avatar";
import type { ExternalReviewItem } from "@/lib/types";

/** Bob's own page — where the embedded iframe lives. */
const BOB_PAGE_HREF = "/systems/mod-bob-invoice-processor";

/**
 * Bob's flagged invoices, read live from his own application rather than seed data.
 *
 * Deliberately a plainer, shorter card than ApprovalCard: there's no reason, no requested
 * action and no context grid to show, because there's nothing to decide from inside this
 * portal — the real record, and the only place to act on it, is the invoice processor
 * itself. A single "View" opens it, on Bob's own page, at the exact invoice (?review=<id>),
 * rather than the two-button Approve/Reject frame that implies a decision made here.
 */
export function ExternalReviewList({ items }: { items: ExternalReviewItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface px-5 py-3.5 sm:px-6"
        >
          <span className="relative mt-0.5 shrink-0">
            <WorkerAvatar moduleId="mod-bob-invoice-processor" size={36} />
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 -right-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-flag ring-2 ring-surface"
            />
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-ink">
              {item.invoiceNumber}
              <span className="font-normal text-muted"> · {item.supplierName}</span>
            </p>
            <p className="mt-0.5 text-[12.5px] text-subtle">
              {typeof item.totalAmount === "number" ? `£${item.totalAmount.toFixed(2)} · ` : ""}
              Needs review
            </p>
          </div>

          <Link
            href={`${BOB_PAGE_HREF}?review=${encodeURIComponent(item.id)}`}
            className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg bg-ink px-4 text-[13px] font-medium text-surface transition-opacity hover:opacity-90"
          >
            View
          </Link>
        </article>
      ))}
    </div>
  );
}
