"use client";

import { useState } from "react";
import { EmptyState } from "./empty-state";
import {
  ClockIcon,
  DocumentIcon,
  InvoiceIcon,
  RefreshIcon,
  WarningIcon,
} from "./icons";
import type { Extracted } from "./invoice-upload";

/**
 * Ade's register: what he has read, and what it adds up to.
 *
 * A re-skin of the Rare² Invoice Processor's dashboard and invoice list — the same
 * figures, the same filters, the same columns — in this portal's own idiom rather than
 * his. His version leans on a blue/emerald/amber/rose palette and slate greys; here the
 * figures are ink on paper with hairline borders, and amber or red appear ONLY when a
 * count is above zero, which is the rule this portal holds everywhere else. That is not
 * a change of meaning: his cards tint conditionally too.
 *
 * Every figure is zero and the register is empty, because nothing is stored. An
 * extraction lives in React state on this page and is gone when you leave it. Rather than
 * invent rows, the register shows what will appear and how it gets there — and an
 * invoice Ade has just read appears immediately, so the table is real as soon as there is
 * anything real to put in it.
 */

type StatusFilter = "all" | "valid" | "needs_review";
type MethodFilter = "all" | "manual" | "automatic";
type PayFilter = "all" | "unpaid" | "paid" | "scheduled";

function money(value: number): string {
  return `£${value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** One KPI tile. `tone` carries status, and only when the count warrants it. */
function Tile({
  label,
  value,
  meta,
  metaCount,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  meta: string;
  metaCount: number;
  icon: React.ReactNode;
  tone?: "neutral" | "flag" | "fault";
}) {
  const active = metaCount > 0 && tone !== "neutral";
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 ${
        active
          ? tone === "flag"
            ? "border-flag/30 bg-flag-soft"
            : "border-fault/30 bg-fault-soft"
          : "border-line bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11.5px] font-semibold tracking-wide text-subtle">
          {label}
        </span>
        <span
          className={`shrink-0 ${
            active ? (tone === "flag" ? "text-flag" : "text-fault") : "text-subtle"
          }`}
        >
          {icon}
        </span>
      </div>
      <p className="tabular mt-2 text-[19px] font-semibold tracking-[-0.01em] text-ink">
        {value}
      </p>
      <p className="mt-1 text-[12.5px] text-muted">
        <span
          className={`tabular font-medium ${
            active ? (tone === "flag" ? "text-flag" : "text-fault") : "text-ink"
          }`}
        >
          {metaCount}
        </span>{" "}
        {meta}
      </p>
    </div>
  );
}

/** A filter chip. Selected reads through its surface, as the rail's active row does. */
function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-8 rounded-lg border px-2.5 text-[12.5px] transition-colors ${
        selected
          ? "border-ink bg-ink font-medium text-surface"
          : "border-line-strong bg-surface text-nav hover:bg-paper hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function InvoiceRegister({
  personName,
  invoices,
}: {
  personName: string;
  /** Invoices read this session. Nothing is stored, so this empties when you leave. */
  invoices: { fileName: string; data: Extracted }[];
}) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [method, setMethod] = useState<MethodFilter>("all");
  const [pay, setPay] = useState<PayFilter>("all");
  const [query, setQuery] = useState("");

  /*
   * An invoice needs review when Ade flagged something beyond the standing "check this
   * against the original" note he attaches to everything.
   */
  const needsReview = (entry: { data: Extracted }) =>
    entry.data.reviewReasons.length > 1;

  const shown = invoices.filter((entry) => {
    if (status === "valid" && needsReview(entry)) return false;
    if (status === "needs_review" && !needsReview(entry)) return false;
    // Payment method and status are not known until an invoice is registered, which
    // needs persistence; these chips filter nothing yet and say so below.
    const haystack =
      `${entry.fileName} ${entry.data.supplierName} ${entry.data.invoiceNumber} ${entry.data.supplierVat}`.toLowerCase();
    return query.trim() === "" || haystack.includes(query.trim().toLowerCase());
  });

  const reviewCount = invoices.filter(needsReview).length;
  const total = invoices.reduce((sum, e) => sum + (e.data.totalAmount ?? 0), 0);

  const clearable = status !== "all" || method !== "all" || pay !== "all" || query !== "";

  return (
    <div className="flex flex-col gap-4">
      {/* The four figures, in the order John's dashboard puts them. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          label="Due this month"
          value={money(total)}
          meta="outstanding by due date"
          metaCount={invoices.length}
          icon={<DocumentIcon className="h-4 w-4" />}
        />
        <Tile
          label="Needs review queue"
          value={String(reviewCount)}
          meta="invoices awaiting review"
          metaCount={reviewCount}
          tone="flag"
          icon={<WarningIcon className="h-4 w-4" />}
        />
        <Tile
          label="Unpaid overdue"
          value={money(0)}
          meta="past due date"
          metaCount={0}
          tone="fault"
          icon={<ClockIcon className="h-4 w-4" />}
        />
        <Tile
          label="Upcoming due (14d)"
          value={money(0)}
          meta="due in next 14 days"
          metaCount={0}
          icon={<RefreshIcon className="h-4 w-4" />}
        />
      </div>

      {/*
       * Payment methods. John's note — "Status tracking only · No bank connection" — is
       * kept word for word, because it is the honest thing on the panel: nothing here
       * moves money, and a client should not assume otherwise.
       */}
      <section
        aria-labelledby="payment-methods"
        className="rounded-xl border border-line bg-surface px-5 py-4"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 id="payment-methods" className="text-[15px] font-semibold text-ink">
            Payment methods
          </h3>
          <p className="text-[12.5px] text-subtle">
            Status tracking only · no bank connection
          </p>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {[
            { name: "Manual payments", detail: "BACS / transfer / cheque" },
            { name: "Automatic payments", detail: "Direct debit / standing order" },
          ].map((entry) => (
            <div key={entry.name} className="rounded-lg border border-line bg-paper px-4 py-3">
              <p className="text-[13.5px] font-medium text-ink">{entry.name}</p>
              <p className="mt-0.5 text-[12.5px] text-muted">{entry.detail}</p>
              <p className="mt-2 flex flex-wrap items-baseline gap-2">
                <span className="tabular text-[17px] font-semibold text-ink">
                  {money(0)}
                </span>
                <span className="text-[12.5px] text-muted">(0 invoices)</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* The register itself. */}
      <section
        aria-labelledby="invoice-register"
        className="rounded-xl border border-line bg-surface"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h3
              id="invoice-register"
              className="flex items-baseline gap-2 text-[15px] font-semibold text-ink"
            >
              Invoice register
              <span className="tabular text-[13px] font-normal text-muted">
                {shown.length} of {invoices.length}
              </span>
            </h3>
            <p className="mt-0.5 text-[12.5px] text-muted">
              What {personName} has read this session, with payment status tracked by hand.
            </p>
          </div>

          <label className="min-w-0 shrink-0">
            <span className="sr-only">Search invoices</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search invoice, supplier, VAT…"
              className="min-h-9 w-full rounded-lg border border-line-strong bg-surface px-3 text-[13px] text-ink placeholder:text-subtle focus:border-ink focus:outline-none sm:w-64"
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 border-b border-line bg-paper px-5 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] text-muted">
              <span className="font-medium text-ink">Filters</span>{" "}
              <span aria-live="polite">
                {shown.length} of {invoices.length} shown
              </span>
            </p>
            <button
              type="button"
              disabled={!clearable}
              onClick={() => {
                setStatus("all");
                setMethod("all");
                setPay("all");
                setQuery("");
              }}
              className="min-h-8 rounded-lg border border-line-strong bg-surface px-2.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-paper disabled:opacity-40"
            >
              Clear filters
            </button>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <fieldset className="min-w-0">
              <legend className="mb-1.5 text-[11.5px] font-medium text-subtle">
                Invoice status
              </legend>
              <div className="flex flex-wrap gap-1.5">
                <Chip selected={status === "all"} onClick={() => setStatus("all")}>
                  All
                </Chip>
                <Chip selected={status === "valid"} onClick={() => setStatus("valid")}>
                  Valid only
                </Chip>
                <Chip
                  selected={status === "needs_review"}
                  onClick={() => setStatus("needs_review")}
                >
                  Needs review
                </Chip>
              </div>
            </fieldset>

            <fieldset className="min-w-0">
              <legend className="mb-1.5 text-[11.5px] font-medium text-subtle">
                Payment method
              </legend>
              <div className="flex flex-wrap gap-1.5">
                <Chip selected={method === "all"} onClick={() => setMethod("all")}>
                  All
                </Chip>
                <Chip selected={method === "manual"} onClick={() => setMethod("manual")}>
                  Manual
                </Chip>
                <Chip
                  selected={method === "automatic"}
                  onClick={() => setMethod("automatic")}
                >
                  Automatic
                </Chip>
              </div>
            </fieldset>

            <fieldset className="min-w-0">
              <legend className="mb-1.5 text-[11.5px] font-medium text-subtle">
                Payment status
              </legend>
              <div className="flex flex-wrap gap-1.5">
                <Chip selected={pay === "all"} onClick={() => setPay("all")}>
                  All
                </Chip>
                <Chip selected={pay === "unpaid"} onClick={() => setPay("unpaid")}>
                  Unpaid
                </Chip>
                <Chip selected={pay === "paid"} onClick={() => setPay("paid")}>
                  Paid
                </Chip>
                <Chip selected={pay === "scheduled"} onClick={() => setPay("scheduled")}>
                  Scheduled
                </Chip>
              </div>
            </fieldset>
          </div>
        </div>

        {invoices.length === 0 ? (
          <EmptyState
            icon={<InvoiceIcon className="h-5 w-5" />}
            title="Nothing read yet."
            description={`Give ${personName} an invoice above and it appears here. Nothing is stored yet, so the register clears when you leave this page.`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-line text-[11.5px] font-semibold tracking-wide text-subtle">
                  <th className="px-5 py-3">Invoice / file</th>
                  <th className="px-5 py-3">Supplier &amp; VAT</th>
                  <th className="px-5 py-3">Dates</th>
                  <th className="px-5 py-3 text-right">Total amount</th>
                  <th className="px-5 py-3">Extraction status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((entry, index) => {
                  const flagged = needsReview(entry);
                  const d = entry.data;
                  return (
                    <tr key={`${entry.fileName}-${index}`} className="align-top">
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-medium text-ink">
                          {d.invoiceNumber || "No number read"}
                        </p>
                        <p className="mt-0.5 max-w-[22ch] truncate text-[12px] text-subtle">
                          {entry.fileName}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] text-ink">
                          {d.supplierName || "Not read"}
                        </p>
                        <p className="mt-0.5 text-[12px] text-subtle">
                          {d.supplierVat || "No VAT number"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] text-muted">
                        <p>Inv: {d.invoiceDate || "not read"}</p>
                        <p className="mt-0.5">Due: {d.dueDate || "not provided"}</p>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <p className="tabular text-[13px] font-medium text-ink">
                          {d.totalAmount === null
                            ? "Not read"
                            : money(d.totalAmount)}
                        </p>
                        <p className="tabular mt-0.5 text-[12px] text-subtle">
                          Net {d.netAmount === null ? "—" : money(d.netAmount)} · VAT{" "}
                          {d.taxAmount === null ? "—" : money(d.taxAmount)}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium ${
                            flagged
                              ? "bg-flag-soft text-flag"
                              : "bg-signal-soft text-signal"
                          }`}
                        >
                          {flagged ? "Needs review" : "Read cleanly"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
