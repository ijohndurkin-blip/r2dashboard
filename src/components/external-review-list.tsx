"use client";

import Link from "next/link";
import { ChevronRightIcon } from "./icons";
import type { ExternalReviewItem } from "@/lib/types";

/** Bob's own page — where the embedded iframe lives. */
const BOB_PAGE_HREF = "/systems/mod-bob-invoice-processor";

/**
 * Bob's flagged invoices, read live from his own application rather than seed data.
 *
 * Plain links rather than ApprovalCard: there's nothing to approve or reject from inside
 * this portal — the real record, and the only place to act on it, is the invoice
 * processor itself. Each row navigates to Bob's page with ?review=<id>, which the
 * embedded iframe there reads and deep-links into, rather than opening the app in a
 * separate tab away from the dashboard.
 */
export function ExternalReviewList({ items }: { items: ExternalReviewItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`${BOB_PAGE_HREF}?review=${encodeURIComponent(item.id)}`}
            className="group flex items-center justify-between gap-4 px-5 py-3.5 text-sm transition-colors hover:bg-paper sm:px-6"
          >
            <span className="min-w-0">
              <span className="font-medium text-ink">{item.invoiceNumber}</span>
              <span className="text-muted"> · {item.supplierName}</span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              {typeof item.totalAmount === "number" ? (
                <span className="tabular text-muted">£{item.totalAmount.toFixed(2)}</span>
              ) : null}
              <ChevronRightIcon className="h-3.5 w-3.5 text-subtle transition-colors group-hover:text-ink" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
