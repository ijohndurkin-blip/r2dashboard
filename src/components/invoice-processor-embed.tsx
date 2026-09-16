/**
 * Bob's tool: the actual Rare² Invoice Processor, running in its own repository and
 * deployment, mounted here through an iframe.
 *
 * Unlike Ade's page (mod-invoice-capture), which is a seed-data mockup of the same idea,
 * this is the real working app — its upload, review queue and supplier list are exactly
 * what you'd see visiting it directly, just framed inside the portal.
 *
 * TODO: replace with the app's real deployed URL once it's known. Everything else here
 * (the module entry, the sidebar row, this page) already works — only this constant needs
 * updating.
 */
const INVOICE_PROCESSOR_URL = "https://REPLACE-WITH-INVOICE-PROCESSOR-URL.vercel.app";

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
