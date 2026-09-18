"use client";

import { Card, CardHeader } from "./card";
import { SupportCard } from "./support-card";
import { StatusIndicator } from "./status-indicator";
import { usePortal } from "./portal-provider";
import { ServiceIcon } from "./icons";
import { account, activeSessions, company } from "@/lib/data";
import type { NotificationPreferences } from "@/lib/types";

/**
 * Settings, in the order a client thinks about them: who I am, who we are, what I get
 * told about, how the account is protected, and what it is plugged into.
 *
 * No secrets or API keys are shown anywhere — integrations report only whether they work.
 */
export function SettingsView() {
  return (
    /*
     * Two columns at xl (1280), not lg (1024).
     *
     * The settings cards are capped at 736px so each control stays near its label, which
     * left ~376px of empty page to their right. The support card uses it.
     *
     * xl, because at 1024 the rail leaves only 672px of content: Home and Activity both
     * broke text badly when split two-up at that width. Below xl the support card simply
     * follows the settings cards down the page.
     *
     * items-start: these two columns are very different heights and stretching the shorter
     * one would leave a tall empty card.
     */
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,46rem)_minmax(0,1fr)]">
      {/*
       * No band headings. There were two — "Your details" over the account and company
       * cards, and "Preferences and connections" over the rest — to explain why five
       * cards of identical texture belonged in two groups. Both groupings have since
       * dissolved: the identity cards merged into one card that names itself, and Security
       * moved to the right column, leaving Notifications and Integrations, which need no
       * label to say what they are. Each card's own header does that work.
       *
       * gap-6 throughout, so the three cards are evenly spaced. It was gap-10 while this
       * held two bands that needed separating from each other.
       */}
      {/*
       * Integrations above Notifications: it is the card that can need something from the
       * client — a connection expires and invoices queue until it is restored — whereas
       * notification preferences are set once and left. The one that can demand action
       * sits higher.
       */}
      <div className="flex flex-col gap-6">
        <YourDetailsSection />
        <IntegrationsSection />
        <NotificationsSection />
      </div>

      {/*
       * The right column: how to reach a person, then the account's own security.
       *
       * Security sits here rather than in the left column because its rows are short —
       * a label and a control — and at the full 736px justify-between pushed "Change
       * password" 398px from "Password" and the two-step status 373px from its label.
       * In this narrower column those collapse to a few dozen pixels, so each control
       * sits beside the thing it controls.
       *
       * Notifications and Integrations stay full width: Integrations rows carry an icon,
       * a name, a purpose, an account and sometimes a warning, which is more than this
       * column holds.
       */}
      <div className="flex flex-col gap-6">
        <SupportCard />
        <SecuritySection />
      </div>
    </div>
  );
}

/**
 * A labelled read-only field. Editing is deliberately out of scope for the portal.
 *
 * dt/dd rather than two paragraphs: these sit inside a dl on Account and Company, where
 * each label genuinely describes the value beneath it, and a dl of bare <p>s is neither
 * valid nor readable to a screen reader.
 */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12.5px] text-subtle">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value}</dd>
    </div>
  );
}

/**
 * The client and the company they belong to, side by side in one card.
 *
 * Person left, company right. Stacked, the six fields ran the full height of the card and
 * left its right half empty; paired, the card uses its own width and the two groups read
 * as what they are — who you are, and who you are here on behalf of.
 *
 * Each group keeps its own dl, so a screen reader still hears two lists rather than one
 * six-item list mixing a person's email with a company's industry.
 *
 * Only the person carries an avatar. The company tile was a second 56px monogram doing no
 * work: it repeated the name sitting directly beside it, and with the two groups now side
 * by side it read as a competing identity rather than a detail of this one. Its `monogram`
 * field is dropped from Company along with it, since nothing else rendered it.
 */
function YourDetailsSection() {
  return (
    <Card measured>
      <CardHeader title="Your details" />

      <div className="grid gap-x-8 gap-y-6 px-5 py-5 sm:grid-cols-2">
        <div className="flex items-start gap-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-base font-medium text-surface">
            {account.initials}
          </span>
          <dl className="flex min-w-0 flex-1 flex-col gap-4">
            <Field label="Name" value={account.name} />
            <Field label="Email" value={account.email} />
            <Field label="Role" value={account.role} />
          </dl>
        </div>

        {/*
         * A hairline on the left edge at wide widths only: it divides the two groups the
         * way the border-t used to when they were stacked, and disappears when they are.
         */}
        <dl className="flex min-w-0 flex-col gap-4 sm:border-l sm:border-line sm:pl-8">
          <Field label="Company name" value={company.name} />
          <Field label="Industry" value={company.industry} />
          <Field label="Plan" value={company.plan} />
        </dl>
      </div>
    </Card>
  );
}

const preferenceCopy: {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}[] = [
  {
    key: "emailNotifications",
    label: "Email notifications",
    description: "Send portal updates to your email address.",
  },
  {
    key: "approvalNotifications",
    label: "Approval notifications",
    description: "Tell me as soon as something needs my confirmation.",
  },
  {
    key: "failedAutomationAlerts",
    label: "Failed automation alerts",
    description: "Tell me when an automation cannot finish its work.",
  },
  {
    key: "weeklySummary",
    label: "Weekly summary",
    description: "A Monday morning digest of everything completed last week.",
  },
];

/** An accessible switch: a real checkbox, styled. */
function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6 px-5 py-4">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">
          {description}
        </span>
      </span>

      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="block h-6 w-10 rounded-full bg-line-strong transition-colors peer-checked:bg-signal peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
        />
        <span
          aria-hidden="true"
          className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-xs transition-transform peer-checked:translate-x-4"
        />
      </span>
    </label>
  );
}

function NotificationsSection() {
  const { preferences, setPreference } = usePortal();

  return (
    <Card measured>
      <CardHeader title="Notifications" />
      <div className="divide-y divide-line">
        {preferenceCopy.map((item) => (
          <Toggle
            key={item.key}
            checked={preferences[item.key]}
            onChange={(value) => setPreference(item.key, value)}
            label={item.label}
            description={item.description}
          />
        ))}
      </div>
    </Card>
  );
}

function SecuritySection() {
  return (
    <Card measured>
      <CardHeader title="Security" />
      <div className="divide-y divide-line">
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Password</p>
            <p className="mt-0.5 text-[13px] text-muted">Last changed in March 2026.</p>
          </div>
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line-strong bg-surface px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper"
          >
            Change password
          </button>
        </div>

        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Two-step verification</p>
            <p className="mt-0.5 text-[13px] text-muted">
              Protects your account with a code from your phone.
            </p>
          </div>
          <StatusIndicator status="connected" label="On" colored />
        </div>

        <div className="px-5 py-4">
          <p className="text-sm font-medium text-ink">Active sessions</p>
          {/*
           * Each row is stacked, never sm:flex-row. This card lives in a ~337px column, so
           * spreading device against location+timestamp squeezed the device name into
           * roughly 100px and broke "Chrome on macOS" over two lines. Removing the "This
           * device" pill did not fix that — the pill aggravated it, the justify-between
           * caused it. One line for the device, its details beneath.
           */}
          <ul className="mt-3 space-y-3">
            {activeSessions.map((session) => (
              <li key={session.id} className="flex flex-col gap-0.5">
                {/*
                 * No "This device" pill. In the narrow right column it pushed the device
                 * name onto a second line and landed mid-wrap, and the current session is
                 * already identifiable from its location and "Active now" timestamp.
                 */}
                <span className="text-[13px] text-ink">{session.device}</span>
                <span className="flex items-center gap-3 text-[12.5px] text-muted">
                  <span>{session.location}</span>
                  <span className="tabular text-subtle">{session.lastActive}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

function IntegrationsSection() {
  const { integrations, googleDriveConnector } = usePortal();

  return (
    <Card measured>
      <CardHeader title="Integrations" />
      <ul className="divide-y divide-line">
        {/*
         * The one integration here that's real. It sits above the rest — same row shape,
         * so it reads as one list rather than calling attention to which entries work —
         * but it's sourced live from Bob's backend (see portal-provider.tsx), not seed
         * data, and its Connect/Manage links actually do something.
         */}
        <li className="px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="flex min-w-0 items-start gap-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface">
                <ServiceIcon id="google-drive" className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">Google Drive</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                  Keeps an invoice spreadsheet in your Drive automatically up to date.
                </p>
                {googleDriveConnector?.connected && googleDriveConnector.folderName ? (
                  <p className="mt-1 text-[12.5px] text-subtle">
                    Syncing to {googleDriveConnector.folderName}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 pl-12 sm:pl-0">
              <StatusIndicator
                status={googleDriveConnector?.connected ? "connected" : "not-connected"}
                colored
              />
              {googleDriveConnector?.connected ? (
                <a
                  href="https://invoices.raresquaredlabs.co.uk/?openExport=sheets"
                  className="inline-flex min-h-9 items-center justify-center rounded-lg border border-line-strong bg-surface px-3 text-[12.5px] font-medium text-ink transition-colors hover:bg-paper"
                >
                  Manage
                </a>
              ) : (
                <a
                  href="https://invoices.raresquaredlabs.co.uk/api/connectors/google/start"
                  className="inline-flex min-h-9 items-center justify-center rounded-lg border border-line-strong bg-surface px-3 text-[12.5px] font-medium text-ink transition-colors hover:bg-paper"
                >
                  Connect
                </a>
              )}
            </div>
          </div>
        </li>

        {integrations.map((integration) => (
          <li key={integration.id} className="px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="flex min-w-0 items-start gap-3.5">
                {/* White tile, not bg-paper: brand colours read truest on white. */}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface">
                  <ServiceIcon id={integration.id} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{integration.name}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                    {integration.purpose}
                  </p>
                  {integration.account ? (
                    <p className="mt-1 text-[12.5px] text-subtle">{integration.account}</p>
                  ) : null}
                  {integration.attentionReason ? (
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-flag">
                      {integration.attentionReason}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 pl-12 sm:pl-0">
                <StatusIndicator status={integration.status} colored />
                {integration.status !== "connected" ? (
                  <button
                    type="button"
                    className="inline-flex min-h-9 items-center justify-center rounded-lg border border-line-strong bg-surface px-3 text-[12.5px] font-medium text-ink transition-colors hover:bg-paper"
                  >
                    {integration.status === "needs-attention" ? "Reconnect" : "Connect"}
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
