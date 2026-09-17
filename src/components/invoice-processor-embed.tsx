"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Bob's tool: the actual Rare² Invoice Processor, running in its own repository and
 * deployment, mounted here through an iframe. Its upload, review queue and supplier list
 * are exactly what you'd see visiting it directly, just framed inside the portal.
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /*
   * A link elsewhere in the portal (the Approvals page, or this same page's own "Waiting
   * on you" list) can send someone here with ?review=<id> to open one invoice directly,
   * instead of just the app's front page.
   *
   * Kept as state rather than read fresh from searchParams on every render: once the
   * iframe has loaded the review URL, changing its `src` back to the bare URL would
   * reload it and throw away whatever the deep link just opened. Stripping the query
   * param from OUR OWN address bar (in the effect below) must not do that.
   *
   * Updated during render, not inside an effect — this is the "adjusting state when a
   * value changes" pattern React itself recommends over an effect+setState for exactly
   * this shape: derive a new value, compare it to what we've already captured, and if it
   * differs, set it right here rather than scheduling a second render to do it.
   */
  const incomingReviewId = searchParams.get("review");
  const [reviewId, setReviewId] = useState<string | null>(null);
  if (incomingReviewId && incomingReviewId !== reviewId) {
    setReviewId(incomingReviewId);
  }

  useEffect(() => {
    if (reviewId) router.replace(pathname);
  }, [reviewId, router, pathname]);

  const src = reviewId
    ? `${INVOICE_PROCESSOR_URL}?review=${encodeURIComponent(reviewId)}`
    : INVOICE_PROCESSOR_URL;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <iframe src={src} title="Rare² Invoice Processor" style={{ height }} className="block w-full" />
    </div>
  );
}
