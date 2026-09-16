import { ExternalLinkIcon } from "./icons";
import type { ExternalReviewItem } from "@/lib/types";

/** Where Bob's real application lives — see invoice-processor-embed.tsx for the same URL. */
const INVOICE_PROCESSOR_ORIGIN = "https://invoices.raresquaredlabs.co.uk";

/**
 * Bob's flagged invoices, read live from his own application rather than seed data.
 *
 * Plain links rather than ApprovalCard: there's nothing to approve or reject from inside
 * this portal — the real record, and the only place to act on it, is the invoice
 * processor itself. Each row opens straight to that invoice's review screen in a new tab
 * (?review=<id>), rather than just the app's front page.
 */
export function ExternalReviewList({ items }: { items: ExternalReviewItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`${INVOICE_PROCESSOR_ORIGIN}/?review=${encodeURIComponent(item.id)}`}
            target="_blank"
            rel="noopener noreferrer"
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
              <ExternalLinkIcon className="h-3.5 w-3.5 text-subtle transition-colors group-hover:text-ink" />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
