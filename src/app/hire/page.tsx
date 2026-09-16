import { PageHeader } from "@/components/page-header";
import { HireView } from "@/components/hire-view";

export const metadata = {
  title: "Hire workers — Raresquared Labs",
};

/**
 * Who else Raresquared could put on this account.
 *
 * Its own destination rather than a section under /systems: that page answers "are my
 * people working?", asked daily, and this one answers "who else could I have?", asked
 * occasionally. Stacking them made the second look like an afterthought of the first.
 *
 * The path is /hire, named for what the page does. It was briefly /workforce, which read
 * oddly beside /systems: the page you own had the legacy path while the page you browse
 * carried the new vocabulary.
 *
 * Unrelated: `public/workforce/` is the avatar asset directory and keeps its name. A path
 * rename that sweeps it up breaks every worker's face.
 */
export default function HirePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Hire workers"
        description="Everyone Raresquared can put on your account. Each one starts the moment you take them on."
      />
      <HireView />
    </div>
  );
}
