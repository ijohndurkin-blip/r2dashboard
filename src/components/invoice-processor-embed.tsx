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
 * regardless of what headers the app itself sends. A custom domain isn't subject to it.
 */
const INVOICE_PROCESSOR_URL = "https://invoices.raresquaredlabs.co.uk/";

export function InvoiceProcessorEmbed() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <iframe
        src={INVOICE_PROCESSOR_URL}
        title="Rare² Invoice Processor"
        className="h-[80vh] w-full"
      />
    </div>
  );
}
