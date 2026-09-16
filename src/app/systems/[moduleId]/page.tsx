import { notFound } from "next/navigation";
import { modules } from "@/lib/data";
import { EmailWorkspace } from "@/components/email-workspace";
import { InvoiceProcessorEmbed } from "@/components/invoice-processor-embed";
import { InvoiceWorkspace } from "@/components/invoice-workspace";
import { ModuleView } from "@/components/module-view";

/**
 * One module's own page.
 *
 * Thin, like every other page here: it validates the id and sets the title, then hands
 * off to a client view. Everything shown is scoped to the modules on the account, and
 * that scoping lives in the portal provider, so the content cannot be read on the server.
 *
 * Validation is against the SEED module list, not the client's active set. A module the
 * client adds during a session becomes reachable immediately; checking "is it active"
 * here would 404 the page they just bought until a reload.
 */

/** Prerender the seven known modules; ids outside the set fall through to notFound. */
export function generateStaticParams() {
  return modules.map((entry) => ({ moduleId: entry.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  // Not `module` — Next's lint rules reserve that identifier.
  const moduleEntry = modules.find((entry) => entry.id === moduleId);

  // Matches the page's own heading, which leads with the person rather than the system.
  return {
    title: moduleEntry
      ? `${moduleEntry.personName} · ${moduleEntry.name} — Raresquared Labs`
      : "Not found — Raresquared Labs",
  };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const moduleEntry = modules.find((entry) => entry.id === moduleId);

  if (!moduleEntry) {
    notFound();
  }

  /*
   * Ade is the one worker you can hand something to, so he is the one with a tool. It
   * goes in the `tools` slot rather than `children`, which would replace his approvals
   * and run history — he has both, like everyone else.
   *
   * Keyed on the module id rather than a flag in the data: a tool is a real component
   * with its own behaviour, not something a seed record can describe.
   */
  /*
   * A worker's tool, where they have one. Keyed on the module id rather than a flag in
   * the data: a tool is a real component with its own behaviour, not something a seed
   * record can describe.
   *
   * Ade's and Sam's are deliberately different shapes. Ade reads documents, so his is an
   * upload and a register of figures; Sam handles a stream of conversations with a triage
   * decision, so his is a split and a conversation list. Giving Sam four money tiles
   * would have left him showing £0.00 forever.
   */
  const tools =
    moduleId === "mod-invoice-capture" ? (
      <InvoiceWorkspace personName={moduleEntry.personName} />
    ) : moduleId === "mod-customer-email" ? (
      <EmailWorkspace
        personName={moduleEntry.personName}
        automationIds={moduleEntry.unlocks}
      />
    ) : moduleId === "mod-bob-invoice-processor" ? (
      <InvoiceProcessorEmbed />
    ) : undefined;

  return <ModuleView moduleId={moduleId} tools={tools} />;
}
