import { PageHeader } from "@/components/page-header";
import { ApprovalsView } from "@/components/approvals-view";

export const metadata = {
  title: "Approvals — Raresquared Labs",
};

/**
 * The page where the client actually decides things, so it stays free of anything that
 * competes with the decision itself.
 */
export default function ApprovalsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Approvals"
        description="Review actions that need your confirmation before Raresquared continues."
      />
      <ApprovalsView />
    </div>
  );
}
