"use client";

import { useState } from "react";
import { EmptyState } from "./empty-state";
import { ContactIcon } from "./icons";
import type { Extracted } from "./invoice-upload";

/**
 * Who has invoiced you, derived from what Ade has read.
 *
 * A re-skin of the Rare² Invoice Processor's supplier list, with its columns: name, VAT
 * number, invoice count and total spend. John's also carries an address, a default
 * payment method and an edit dialog — the address only when an invoice states one, and
 * the payment method and editing both need supplier records that outlive a session, so
 * they are named as absent rather than faked.
 *
 * Suppliers are DERIVED, not stored: each distinct supplier name across the invoices read
 * this session, with their invoices counted and their totals summed. That is exactly how
 * John's works on first run too — a supplier record is created the first time one of
 * their invoices is confirmed — the difference being that his survives a reload.
 */
export function InvoiceSuppliers({
  personName,
  invoices,
}: {
  personName: string;
  invoices: { fileName: string; data: Extracted }[];
}) {
  const [query, setQuery] = useState("");

  /* Group by supplier name, since that is the only identifier every invoice carries. */
  const byName = new Map<
    string,
    { name: string; vat: string; count: number; spend: number }
  >();

  for (const { data } of invoices) {
    const name = data.supplierName.trim();
    if (name === "") continue; // An invoice with no supplier read is not a supplier.
    const existing = byName.get(name);
    if (existing) {
      existing.count += 1;
      existing.spend += data.totalAmount ?? 0;
      // Keep the first VAT number seen; a later blank should not erase it.
      if (existing.vat === "" && data.supplierVat.trim() !== "") {
        existing.vat = data.supplierVat.trim();
      }
    } else {
      byName.set(name, {
        name,
        vat: data.supplierVat.trim(),
        count: 1,
        spend: data.totalAmount ?? 0,
      });
    }
  }

  const suppliers = [...byName.values()].sort((a, b) => b.spend - a.spend);
  const shown = suppliers.filter((supplier) => {
    const haystack = `${supplier.name} ${supplier.vat}`.toLowerCase();
    return query.trim() === "" || haystack.includes(query.trim().toLowerCase());
  });

  const unnamed = invoices.filter((entry) => entry.data.supplierName.trim() === "").length;

  if (suppliers.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface">
        <EmptyState
          icon={<ContactIcon className="h-5 w-5" />}
          title="No suppliers yet."
          description={
            unnamed > 0
              ? `${personName} has read ${unnamed} ${unnamed === 1 ? "invoice" : "invoices"} without a readable supplier name, so there is nobody to list yet.`
              : `A supplier appears here the first time ${personName} reads one of their invoices.`
          }
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h3 className="flex items-baseline gap-2 text-[15px] font-semibold text-ink">
            Suppliers
            <span className="tabular text-[13px] font-normal text-muted">
              {shown.length} of {suppliers.length}
            </span>
          </h3>
          <p className="mt-0.5 text-[12.5px] text-muted">
            Built from the invoices {personName} has read this session.
          </p>
        </div>

        <label className="min-w-0 shrink-0">
          <span className="sr-only">Search suppliers</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search supplier, VAT…"
            className="min-h-9 w-full rounded-lg border border-line-strong bg-surface px-3 text-[13px] text-ink placeholder:text-subtle focus:border-ink focus:outline-none sm:w-56"
          />
        </label>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          compact
          icon={<ContactIcon className="h-5 w-5" />}
          title="Nothing matches that search."
          description="Clear it to see every supplier."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead>
              <tr className="border-b border-line text-[11.5px] font-semibold tracking-wide text-subtle">
                <th className="px-5 py-3">Supplier</th>
                <th className="px-5 py-3">VAT number</th>
                <th className="px-5 py-3 text-center">Invoices</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map((supplier) => (
                <tr key={supplier.name}>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-ink">
                    {supplier.name}
                  </td>
                  <td className="px-5 py-3.5 text-[12.5px] text-muted">
                    {supplier.vat === "" ? (
                      <span className="text-flag">Not read</span>
                    ) : (
                      supplier.vat
                    )}
                  </td>
                  <td className="tabular px-5 py-3.5 text-center text-[13px] text-ink">
                    {supplier.count}
                  </td>
                  <td className="tabular px-5 py-3.5 text-right text-[13px] font-medium text-ink">
                    £
                    {supplier.spend.toLocaleString("en-GB", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/*
       * John's list carries a default payment method per supplier and an edit dialog.
       * Both need a supplier record that outlives the session, so they are named here
       * rather than shipped as controls that cannot persist what you set.
       */}
      <p className="border-t border-line px-5 py-3 text-[12.5px] text-muted">
        Payment methods and addresses need stored supplier records, which is not wired up
        yet.
      </p>
    </div>
  );
}
