/**
 * Bob's tool: the actual Rare² Invoice Processor, running in its own repository and
 * deployment, mounted here through an iframe.
 *
 * Unlike Ade's page (mod-invoice-capture), which is a seed-data mockup of the same idea,
 * this is the real working app — its upload, review queue and supplier list are exactly
 * what you'd see visiting it directly, just framed inside the portal.
 *
 * Points at a specific Vercel deployment URL for now. That kind of URL is tied to one
 * build and changes on every deploy — swap it for the project's stable production domain
 * (Vercel project settings → Domains) once that's set up, so this doesn't go stale.
 */
const INVOICE_PROCESSOR_URL = "https://rare2-invoice-processor-38bvx7xlm-jdurkin.vercel.app/";

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
