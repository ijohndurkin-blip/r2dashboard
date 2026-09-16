import { PageHeader } from "@/components/page-header";
import { SettingsView } from "@/components/settings-view";

export const metadata = {
  title: "Settings — Raresquared Labs",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Your account, your company details and the services Raresquared connects to."
      />
      <SettingsView />
    </div>
  );
}
