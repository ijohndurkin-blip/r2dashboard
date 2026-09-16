"use client";

import { useState } from "react";
import { CheckIcon, InvoiceIcon, WarningIcon } from "./icons";

/**
 * Ade's tool: hand them an invoice and they read it.
 *
 * The one place in this portal where the client gives a worker something to do rather
 * than watching what they have done. It posts to /api/extract — a Python function that
 * parses the PDF and returns the labelled fields — and shows what came back for checking.
 *
 * Nothing is stored. The extracted fields live in this component's state until the page
 * is left, which matches what the portal is: a window onto work, not a filing cabinet.
 * Registering an invoice is Grace's job, and it is not wired up yet.
 */

/**
 * Vercel caps a function's request body at 4.5MB, and base64 inflates by about a third.
 * 3MB of PDF is the largest that reliably fits, so the file is refused here with a plain
 * sentence rather than allowed through to a 413 the client cannot interpret.
 */
const MAX_BYTES = 3 * 1024 * 1024;

export interface Extracted {
  supplierName: string;
  supplierVat: string;
  supplierAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  netAmount: number | null;
  taxAmount: number | null;
  totalAmount: number | null;
  reviewReasons: string[];
}

/** Money as the rest of the portal writes it; a field Ade could not read says so. */
function amount(value: number | null, currency: string): string {
  if (value === null) return "Could not be read";
  const symbol = currency === "GBP" || currency === "" ? "£" : `${currency} `;
  return `${symbol}${value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function field(value: string): string {
  return value.trim() === "" ? "Could not be read" : value;
}

export function InvoiceUpload({
  personName,
  onRead,
}: {
  personName: string;
  /**
   * Called with each invoice successfully read, so the register above this component's
   * own result can list everything from the session. The upload keeps showing the latest
   * extraction in full; the register summarises them all.
   */
  onRead?: (entry: { fileName: string; data: Extracted }) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Extracted | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function read(file: File) {
    setError(null);
    setResult(null);

    if (file.size > MAX_BYTES) {
      setError(
        `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. ${personName} can read invoices up to 3MB.`,
      );
      return;
    }

    setBusy(true);
    setFileName(file.name);
    try {
      const isText = file.type.startsWith("text/") || file.name.endsWith(".txt");
      const body = isText
        ? { mimeType: "text/plain", textContent: await file.text() }
        : {
            mimeType: file.type || "application/pdf",
            // Chunked rather than spread into fromCharCode: a multi-megabyte spread
            // blows the argument limit and throws on exactly the files this accepts.
            fileBase64: await toBase64(file),
          };

      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();

      if (!payload.success) {
        setError(payload.error ?? "That invoice could not be read.");
        return;
      }
      setResult(payload.data as Extracted);
      onRead?.({ fileName: file.name, data: payload.data as Extracted });
    } catch {
      setError(`${personName} could not be reached. Try again in a moment.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="invoice-upload"
      className="rounded-xl border border-line bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 id="invoice-upload" className="text-[15px] font-semibold text-ink">
            Give {personName} an invoice
          </h2>
          <p className="mt-0.5 text-[12.5px] text-muted">
            A text-based PDF up to 3MB. {personName} reads it and shows you what they found.
          </p>
        </div>

        {/*
         * A label wrapping the input, not a button calling input.click().
         *
         * The input was `sr-only`, which clips it to a 1px box with clip-path; a picker
         * opened from a clipped input greys out files it should accept. The label makes
         * the click native — the input is merely invisible, not clipped out of the
         * layout — and keyboard focus still lands on it because it is a real control.
         *
         * `accept` is PDF and plain text by extension AND media type: Chrome on macOS
         * filters on whichever it can resolve, and a list mixing the two is the shape it
         * handles most reliably.
         */}
        <label
          className={`inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-surface transition-opacity hover:opacity-90 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ${
            busy ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <InvoiceIcon className="h-4 w-4" />
          {busy ? "Reading…" : "Choose a file"}
          <input
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            disabled={busy}
            className="absolute h-px w-px opacity-0"
            onChange={(event) => {
              const file = event.target.files?.[0];
              // Reset so choosing the same file twice still fires a change.
              event.target.value = "";
              if (file) void read(file);
            }}
          />
        </label>
      </div>

      {error ? (
        <p className="flex items-start gap-2.5 px-5 py-4 text-[13px] leading-relaxed text-fault sm:px-6">
          <WarningIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="px-5 py-5 sm:px-6">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted">
            <CheckIcon className="h-3.5 w-3.5 text-signal" />
            {personName} read
            <span className="font-medium text-ink">{fileName}</span>
          </p>

          <dl className="mt-4 grid gap-x-8 gap-y-3 text-[13px] sm:grid-cols-2">
            <Row label="Supplier" value={field(result.supplierName)} />
            <Row label="Invoice number" value={field(result.invoiceNumber)} />
            <Row label="Invoice date" value={field(result.invoiceDate)} />
            <Row label="Due date" value={field(result.dueDate)} />
            <Row label="VAT number" value={field(result.supplierVat)} />
            <Row label="Net" value={amount(result.netAmount, result.currency)} />
            <Row label="VAT" value={amount(result.taxAmount, result.currency)} />
            <Row label="Total" value={amount(result.totalAmount, result.currency)} />
          </dl>

          {/*
           * What Ade was unsure about, in their own words. This is the honest half of the
           * output: a field read wrongly but confidently is worse than one they flag.
           */}
          {result.reviewReasons.length > 0 ? (
            <div className="mt-5 border-t border-line pt-4">
              <h3 className="text-[12.5px] font-semibold text-ink">
                What to check before this goes on
              </h3>
              <ul className="mt-2 space-y-1.5">
                {result.reviewReasons.map((reason) => (
                  <li
                    key={reason}
                    className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted"
                  >
                    <WarningIcon className="mt-[3px] h-3.5 w-3.5 shrink-0 text-flag" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const unread = value === "Could not be read";
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2.5 last:border-b-0">
      <dt className="shrink-0 text-subtle">{label}</dt>
      <dd className={`text-right ${unread ? "text-flag" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

/** FileReader rather than a spread over the byte array, which throws on large files. */
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const url = String(reader.result);
      resolve(url.slice(url.indexOf(",") + 1));
    };
    reader.readAsDataURL(file);
  });
}
