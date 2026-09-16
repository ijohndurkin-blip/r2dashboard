"use client";

import { useEffect, useState } from "react";

/**
 * Bob's tool: the actual Rare² Invoice Processor, running in its own repository and
 * deployment, mounted here through an iframe.
 *
 * Unlike Ade's page (mod-invoice-capture), which is a seed-data mockup of the same idea,
 * this is the real working app — its upload, review queue and supplier list are exactly
 * what you'd see visiting it directly, just framed inside the portal.
 *
 * Served from the app's own custom domain rather than a *.vercel.app URL: Vercel applies
 * an anti-clickjacking policy to its shared vercel.app domain that blocks framing outright,
 * regardless of what headers the app itself sends. A custom domain isn't subject to it. It
 * also puts both apps on the same registrable domain (raresquaredlabs.co.uk), which is what
 * lets the invoice processor's own session cookie survive inside the frame at all — a
 * cross-site iframe can't hold onto a `SameSite=strict` cookie.
 */
const INVOICE_PROCESSOR_URL = "https://invoices.raresquaredlabs.co.uk/";
const INVOICE_PROCESSOR_ORIGIN = "https://invoices.raresquaredlabs.co.uk";

/**
 * A fixed iframe height is always wrong for a page whose content varies with how many
 * invoices are on it. The app posts its own document height on load and on resize; we
 * just listen and match it, so there's one scrollbar (the portal's) instead of two.
 */
function useEmbeddedHeight(fallback: number): number {
  const [height, setHeight] = useState(fallback);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== INVOICE_PROCESSOR_ORIGIN) return;
      const data = event.data as { type?: string; height?: number } | null;
      if (data?.type === "rare2-invoice-processor:height" && typeof data.height === "number") {
        setHeight(Math.max(data.height, fallback));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [fallback]);

  return height;
}

export function InvoiceProcessorEmbed() {
  const height = useEmbeddedHeight(600);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <iframe
        src={INVOICE_PROCESSOR_URL}
        title="Rare² Invoice Processor"
        style={{ height }}
        className="block w-full"
      />
    </div>
  );
}
