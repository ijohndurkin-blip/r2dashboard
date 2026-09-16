import { PageHeader } from "@/components/page-header";
import { SystemsView } from "@/components/systems-view";

export const metadata = {
  title: "Your workforce — Raresquared Labs",
};

/**
 * Who Raresquared runs for this client, and who else it could put on.
 *
 * Modules and automations were separate pages until a client pointed out they described
 * the same things twice. One page now answers both: who am I paying for, and are they working.
 *
 * The route stays /systems. The URL is live and the vocabulary change is to what the
 * client reads, not to the model underneath it.
 */
export default function SystemsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Your workforce"
        description="The people Raresquared runs for you, and what they have been doing."
      />
      <SystemsView />
    </div>
  );
}
