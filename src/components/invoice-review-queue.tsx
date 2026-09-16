"use client";

import { EmptyState } from "./empty-state";
import { CheckIcon, WarningIcon } from "./icons";
import type { Extracted } from "./invoice-upload";

/**
 * Invoices Ade could not read with full confidence.
 *
 * A re-skin of the Rare² Invoice Processor's Needs Review Queue: each invoice with the
 * reasons it was held, so the client can see what to check rather than being told only
 * that something is wrong.
 *
 * The rule matches the register's — more than one review reason. Ade attaches "check
 * extracted fields against the original invoice before approval" to everything he reads,
 * so that one alone is not a flag; anything beyond it is.
 *
 * John's version has an "Open original document" button and an approve-with-warnings
 * flow. Neither is here yet: the document is not retained after extraction, and approving
 * an invoice into a ledger needs the persistence this portal does not have. Naming both
 * absences beats shipping buttons that do nothing.
 */
export function InvoiceReviewQueue({
  personName,
  invoices,
}: {
  personName: string;
  invoices: { fileName: string; data: Extracted }[];
}) {
  const STANDING_NOTE_COUNT = 1;
  const flagged = invoices.filter(
    (entry) => entry.data.reviewReasons.length > STANDING_NOTE_COUNT,
  );

  if (flagged.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface">
        <EmptyState
          icon={<CheckIcon className="h-5 w-5" />}
          title={
            invoices.length === 0
              ? "Nothing to review."
              : "Everything read cleanly."
          }
          description={
            invoices.length === 0
              ? `An invoice lands here when ${personName} cannot read a field with confidence, or when the figures do not add up.`
              : `${personName} read every invoice in this session without needing you.`
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] leading-relaxed text-muted">
        {flagged.length === 1 ? "One invoice needs" : `${flagged.length} invoices need`} a
        look before {personName} passes {flagged.length === 1 ? "it" : "them"} to Grace for
        matching.
      </p>

      {flagged.map((entry, index) => {
        const d = entry.data;
        /* The standing note is dropped: it applies to everything and says nothing here. */
        const reasons = d.reviewReasons.slice(STANDING_NOTE_COUNT);
        return (
          <article
            key={`${entry.fileName}-${index}`}
            className="rounded-xl border border-flag/30 bg-surface"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <h4 className="text-[14.5px] font-semibold leading-snug text-ink">
                  {d.supplierName || "Supplier not read"}
                  <span className="font-normal text-muted">
                    {d.invoiceNumber ? ` · ${d.invoiceNumber}` : ""}
                  </span>
                </h4>
                <p className="mt-0.5 max-w-[40ch] truncate text-[12.5px] text-subtle">
                  {entry.fileName}
                </p>
              </div>
              <p className="tabular shrink-0 text-right">
                <span className="text-[15px] font-semibold text-ink">
                  {d.totalAmount === null
                    ? "Total not read"
                    : `£${d.totalAmount.toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </span>
                <span className="mt-0.5 block text-[12px] text-subtle">
                  {d.invoiceDate || "No date read"}
                </span>
              </p>
            </div>

            <div className="px-5 py-4">
              <h5 className="text-[12px] font-semibold tracking-wide text-flag">
                What to check
              </h5>
              <ul className="mt-2 space-y-1.5">
                {reasons.map((reason) => (
                  <li
                    key={reason}
                    className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted"
                  >
                    <WarningIcon className="mt-[3px] h-3.5 w-3.5 shrink-0 text-flag" />
                    {reason}
                  </li>
                ))}
              </ul>

              {/*
               * No "approve with warnings" button. John's has one, and it writes the
               * invoice into his register; here there is nowhere for it to go until
               * invoices are stored. A button that silently does nothing is worse than
               * its absence being explained.
               */}
              <p className="mt-4 border-t border-line pt-3 text-[12.5px] text-muted">
                Confirming an invoice into the ledger needs stored invoices, which is not
                wired up yet.
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
