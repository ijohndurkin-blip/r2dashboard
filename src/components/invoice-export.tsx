"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, DocumentIcon } from "./icons";
import { useDialog } from "./use-dialog";
import type { Extracted } from "./invoice-upload";

/**
 * Export what Ade has read, as CSV.
 *
 * A port of the Rare² Invoice Processor's export — the same two files, the same column
 * headers, so a spreadsheet built against his output still opens ours.
 *
 * CSV is the only route that actually works, and that is true in his app too: the Google
 * Sheets and OneDrive adapters there are interface stubs returning "not configured"
 * rather than live integrations. Rather than ship two buttons that do nothing, they are
 * named as what they are — the next thing to wire, with the adapter that would do it.
 *
 * Everything exported comes from this session. Nothing is stored, so an export is a
 * snapshot of what you have just read, not a ledger.
 */

/** RFC 4180: quote anything containing a comma, quote or newline, and double the quotes. */
function csvField(value: unknown): string {
  const text =
    value === null || value === undefined
      ? ""
      : typeof value === "number"
        ? String(value)
        : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function download(content: string, fileName: string) {
  // A BOM so Excel on Windows reads the £ signs as UTF-8 rather than mojibake.
  const blob = new Blob([`﻿${content}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const today = () => new Date().toISOString().split("T")[0];

/** John's invoice columns, in his order. Fields we cannot know are written empty. */
function invoicesCsv(invoices: { fileName: string; data: Extracted }[]): string {
  const headers = [
    "Invoice Number",
    "Invoice Date",
    "Due Date",
    "Supplier Name",
    "Supplier VAT Number",
    "Supplier Address",
    "Currency",
    "Net Amount",
    "VAT Amount",
    "Total Amount",
    "Status",
    "Review Reasons",
    "Payment Status",
    "File Name",
  ];

  const rows = invoices.map(({ fileName, data }) => [
    data.invoiceNumber,
    data.invoiceDate,
    data.dueDate,
    data.supplierName,
    data.supplierVat,
    data.supplierAddress,
    data.currency,
    data.netAmount,
    data.taxAmount,
    data.totalAmount,
    data.reviewReasons.length > 1 ? "Needs review" : "Read cleanly",
    data.reviewReasons.join("; "),
    // Payment status needs stored invoices; empty rather than a guess.
    "",
    fileName,
  ]);

  return [headers, ...rows]
    .map((row) => row.map(csvField).join(","))
    .join("\r\n");
}

/** John's supplier columns, minus the ones that need stored records. */
function suppliersCsv(invoices: { fileName: string; data: Extracted }[]): string {
  const headers = [
    "Supplier Name",
    "VAT Number",
    "Address",
    "Invoices Count",
    "Total Spend (£)",
  ];

  const byName = new Map<
    string,
    { name: string; vat: string; address: string; count: number; spend: number }
  >();

  for (const { data } of invoices) {
    const name = data.supplierName.trim();
    if (name === "") continue;
    const found = byName.get(name);
    if (found) {
      found.count += 1;
      found.spend += data.totalAmount ?? 0;
      if (found.vat === "") found.vat = data.supplierVat.trim();
      if (found.address === "") found.address = data.supplierAddress.trim();
    } else {
      byName.set(name, {
        name,
        vat: data.supplierVat.trim(),
        address: data.supplierAddress.trim(),
        count: 1,
        spend: data.totalAmount ?? 0,
      });
    }
  }

  const rows = [...byName.values()]
    .sort((a, b) => b.spend - a.spend)
    .map((s) => [s.name, s.vat, s.address, s.count, s.spend.toFixed(2)]);

  return [headers, ...rows]
    .map((row) => row.map(csvField).join(","))
    .join("\r\n");
}

export function InvoiceExport({
  personName,
  invoices,
}: {
  personName: string;
  invoices: { fileName: string; data: Extracted }[];
}) {
  const { open, openDialog, close, panelRef, triggerRef } = useDialog<HTMLDivElement>();
  const [done, setDone] = useState<string | null>(null);

  const supplierCount = new Set(
    invoices.map((e) => e.data.supplierName.trim()).filter((n) => n !== ""),
  ).size;

  function exportInvoices() {
    download(invoicesCsv(invoices), `invoices_${today()}.csv`);
    setDone(`${invoices.length} ${invoices.length === 1 ? "invoice" : "invoices"} exported`);
  }

  function exportSuppliers() {
    download(suppliersCsv(invoices), `suppliers_${today()}.csv`);
    setDone(
      `${supplierCount} ${supplierCount === 1 ? "supplier" : "suppliers"} exported`,
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setDone(null);
          openDialog();
        }}
        disabled={invoices.length === 0}
        aria-haspopup="dialog"
        className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper disabled:opacity-40"
      >
        <DocumentIcon className="h-3.5 w-3.5" />
        Export
      </button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/40 p-4 sm:items-center sm:p-6 lg:left-[248px]"
              onClick={close}
            >
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="export-title"
                tabIndex={-1}
                onClick={(event) => event.stopPropagation()}
                className="row-measure my-auto w-full overflow-hidden rounded-xl border border-line bg-surface shadow-lg outline-none"
              >
                <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <h3
                      id="export-title"
                      className="text-[15.5px] font-semibold leading-snug text-ink"
                    >
                      Export what {personName} has read
                    </h3>
                    <p className="mt-0.5 text-[12.5px] text-muted">
                      This session only — nothing is stored, so an export is a snapshot.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close export"
                    className="-mr-1.5 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-ink"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-4 bg-paper px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={exportInvoices}
                      className="flex-1 rounded-lg border border-line bg-surface px-4 py-3 text-left transition-colors hover:border-line-strong"
                    >
                      <span className="block text-[13.5px] font-medium text-ink">
                        Invoices
                      </span>
                      <span className="tabular mt-0.5 block text-[12.5px] text-muted">
                        {invoices.length} {invoices.length === 1 ? "row" : "rows"} · CSV
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={exportSuppliers}
                      disabled={supplierCount === 0}
                      className="flex-1 rounded-lg border border-line bg-surface px-4 py-3 text-left transition-colors hover:border-line-strong disabled:opacity-50"
                    >
                      <span className="block text-[13.5px] font-medium text-ink">
                        Suppliers
                      </span>
                      <span className="tabular mt-0.5 block text-[12.5px] text-muted">
                        {supplierCount} {supplierCount === 1 ? "row" : "rows"} · CSV
                      </span>
                    </button>
                  </div>

                  {done ? (
                    <p className="text-[13px] font-medium text-signal" role="status">
                      {done}. Check your downloads.
                    </p>
                  ) : null}

                  {/*
                   * Named, not shipped. These are interface stubs in the original too —
                   * adapter classes that return "not configured" — so two live-looking
                   * buttons here would promise integrations neither app has.
                   */}
                  <div className="border-t border-line pt-4">
                    <h4 className="text-[12.5px] font-semibold text-ink">
                      Not wired up yet
                    </h4>
                    <ul className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-muted">
                      <li>
                        <span className="font-medium text-ink">Google Sheets</span> — a
                        Sheets adapter would write these rows straight to a spreadsheet.
                      </li>
                      <li>
                        <span className="font-medium text-ink">OneDrive / Excel</span> — a
                        Microsoft Graph adapter would append them to a workbook table.
                      </li>
                    </ul>
                    <p className="mt-2 text-[12.5px] text-subtle">
                      Both are stubs in the invoice processor as well; CSV is the route
                      that works today.
                    </p>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
