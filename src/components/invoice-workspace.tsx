"use client";

import { useId, useState } from "react";
import { InvoiceExport } from "./invoice-export";
import { InvoiceRegister } from "./invoice-register";
import { InvoiceReviewQueue } from "./invoice-review-queue";
import { InvoiceSuppliers } from "./invoice-suppliers";
import { InvoiceUpload, type Extracted } from "./invoice-upload";

/**
 * Ade's tool, whole: give him an invoice, then see what he has read.
 *
 * Three tabs, the same three the Rare² Invoice Processor has — Invoices & Dashboard,
 * Needs Review Queue, Suppliers — reusing the tablist the approvals page uses so there is
 * one tab idiom in the portal. In-page tabs rather than rail rows, at the client's
 * direction.
 *
 * The upload sits ABOVE the tabs rather than inside one. It is how work enters, not one
 * of three views of work already done: putting it inside "Invoices & Dashboard" would
 * hide the way in whenever you were looking at the review queue.
 *
 * The session's extractions live here rather than inside the upload, because four things
 * need them — the upload shows the latest in full, the register lists them all, the queue
 * filters the flagged ones, and suppliers are derived from them. One owner, passed down,
 * so they cannot disagree.
 *
 * Nothing is persisted. Leaving the page clears all of it, which each panel says plainly
 * rather than implying a filing cabinet that does not exist. Wiring this to real storage
 * means replacing this component's state with a fetch; nothing below it changes.
 */

type Tab = "invoices" | "review" | "suppliers";

export function InvoiceWorkspace({ personName }: { personName: string }) {
  const [invoices, setInvoices] = useState<{ fileName: string; data: Extracted }[]>([]);
  const [tab, setTab] = useState<Tab>("invoices");
  const panelId = useId();

  /* Ade attaches a standing "check against the original" note to everything he reads, so
   * a flag is anything beyond it. Same rule the register and the queue both use. */
  const flaggedCount = invoices.filter((entry) => entry.data.reviewReasons.length > 1)
    .length;
  const supplierCount = new Set(
    invoices
      .map((entry) => entry.data.supplierName.trim())
      .filter((name) => name !== ""),
  ).size;

  const tabs = [
    { id: "invoices" as Tab, label: "Invoices & Dashboard", count: invoices.length },
    { id: "review" as Tab, label: "Needs Review Queue", count: flaggedCount, flag: true },
    { id: "suppliers" as Tab, label: "Suppliers", count: supplierCount },
  ];

  return (
    <div className="flex flex-col gap-4">
      <InvoiceUpload
        personName={personName}
        onRead={(entry) => setInvoices((current) => [entry, ...current])}
      />

      {/*
       * The export sits beside the tabs rather than inside one: it exports everything
       * read this session, not whichever view happens to be open.
       */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line">
        <div
          role="tablist"
          aria-label={`${personName}'s pages`}
          className="flex flex-wrap gap-1"
        >
        {tabs.map((item) => {
          const selected = tab === item.id;
          /* A count only earns amber when there is something in it to act on. */
          const flagged = item.flag === true && item.count > 0;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${panelId}-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`-mb-px grid min-h-10 items-center border-b-2 px-3 text-[13.5px] transition-colors ${
                selected
                  ? "border-ink font-medium text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {/*
               * Both states occupy the bold width, so selecting a tab cannot resize it.
               * Same reasoning as the approvals tablist, and it matters more here: this
               * list is flex-wrap with long labels, so the old ~1.5px growth per tab could
               * tip the last one onto a second row rather than merely nudge it sideways.
               *
               * The twin mirrors the count's flagged styling too — the amber pill carries
               * its own font-semibold and px-1.5, so a twin that skipped it would reserve
               * the wrong width on the one tab that most needs to hold still.
               */}
              <span
                aria-hidden
                className="invisible col-start-1 row-start-1 flex items-center gap-2 font-medium"
              >
                {item.label}
                <span
                  className={`tabular text-[12.5px] ${
                    flagged ? "rounded-full px-1.5 font-semibold" : ""
                  }`}
                >
                  {item.count}
                </span>
              </span>
              <span className="col-start-1 row-start-1 flex items-center gap-2">
                {item.label}
                <span
                  className={`tabular text-[12.5px] ${
                    flagged
                      ? "rounded-full bg-flag px-1.5 font-semibold text-surface"
                      : "text-subtle"
                  }`}
                >
                  {item.count}
                </span>
              </span>
            </button>
          );
        })}
        </div>

        <div className="pb-2">
          <InvoiceExport personName={personName} invoices={invoices} />
        </div>
      </div>

      <div
        role="tabpanel"
        id={`${panelId}-${tab}`}
        aria-labelledby={`tab-${tab}`}
      >
        {tab === "invoices" ? (
          <InvoiceRegister personName={personName} invoices={invoices} />
        ) : tab === "review" ? (
          <InvoiceReviewQueue personName={personName} invoices={invoices} />
        ) : (
          <InvoiceSuppliers personName={personName} invoices={invoices} />
        )}
      </div>
    </div>
  );
}
