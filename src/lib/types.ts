/**
 * Domain model for the Raresquared Labs client portal.
 *
 * Naming rule: these types are read by people building client-facing UI, so they use the
 * client's vocabulary (automation, work, approval) rather than implementation vocabulary
 * (workflow engine, node, tool call). Nothing here should leak into the interface as jargon.
 */

/** Health of an automation, as a client would describe it. */
export type AutomationStatus = "running" | "needs-attention" | "paused";

/** Outcome of a single run. */
export type RunStatus = "completed" | "running" | "awaiting-approval" | "failed";

/** Whether a connected service is usable right now. */
export type IntegrationStatus = "connected" | "needs-attention" | "not-connected";

/** The four explanatory stages shown in the flow diagram. */
export type FlowStage = "trigger" | "agent" | "tools" | "approval";

/** Icon keys, so data never hardcodes a component. */
export type IconKey =
  | "document"
  | "mail"
  | "invoice"
  | "contact"
  | "check"
  | "warning"
  | "box"
  | "link"
  | "refresh";

/** One node in an automation's static flow diagram. */
export interface FlowNode {
  /** Client-facing label, e.g. "Email received". */
  label: string;
  stage: FlowStage;
}

/** A deployed automation the client can see but not edit. */
export interface Automation {
  id: string;
  name: string;
  /** One plain sentence: what this does for the business. */
  description: string;
  status: AutomationStatus;
  /** What starts it, in client language. */
  trigger: string;
  /**
   * Who handles it — the first name of the worker this automation belongs to, matching
   * the `personName` of its module. These were "Document Agent", "Invoice Agent" and so
   * on; "Agent" is exactly the platform vocabulary the portal strips, and the client
   * asked for their systems to read as people doing a job.
   */
  handledBy: string;
  /** Systems it acts on, e.g. ["Xero", "CRM"]. */
  tools: string[];
  requiresApproval: boolean;
  runsToday: number;
  /** Relative, pre-formatted for display, e.g. "4 minutes ago". */
  lastRun: string;
  /** Rolling reliability figure, 0–100. */
  successRate: number;
  flow: FlowNode[];
  /** Short configuration facts, shown as a read-only summary. */
  configuration: { label: string; value: string }[];
}

/** An action Raresquared wants confirmed before it continues. */
export interface Approval {
  id: string;
  /** What the system wants to do, as a short imperative. */
  title: string;
  automationId: string;
  automationName: string;
  /** Why it is asking — plain prose, no logs. */
  reason: string;
  /** The specific action it will take once approved. */
  requestedAction: string;
  /** Supporting facts the client needs to judge it. Never raw JSON. */
  context: { label: string; value: string }[];
  /** Pre-formatted relative time, e.g. "3 minutes ago". */
  submitted: string;
  /**
   * Whether this one should be dealt with first, which is what "needs your attention"
   * sorts on.
   *
   * Explicit rather than derived. The money is in `context`, but under a different label
   * on every approval — "Value affected", "Order value", "Invoice total" — so reading
   * urgency out of it would mean parsing prose and guessing which number is the stake.
   *
   * Set for money leaving the business, or a sum large enough that a wrong decision is
   * expensive. Absent means ordinary; there is no "low", because an approval nobody needs
   * to see should not be an approval.
   */
  urgent?: boolean;
  /** Set once the client has acted. Pending approvals leave this undefined. */
  resolution?: { outcome: "approved" | "rejected"; when: string };
}

/** One step inside a run, shown when a run is expanded. */
export interface RunStep {
  /** Wall-clock time, e.g. "09:41". */
  time: string;
  /** What happened, in client language. */
  description: string;
  icon: IconKey;
}

/** A single execution of an automation. */
export interface Run {
  id: string;
  automationId: string;
  automationName: string;
  /** Plain summary of what this run achieved. */
  summary: string;
  status: RunStatus;
  /** Wall-clock start, e.g. "09:41". */
  startedAt: string;
  /** Pre-formatted relative time for list display. */
  relativeTime: string;
  /** Human duration, e.g. "8 seconds". Absent while still running. */
  duration?: string;
  steps: RunStep[];
  involvedApproval: boolean;
  /**
   * Client-friendly explanation when something went wrong.
   * "We couldn't update the CRM. Raresquared will retry automatically."
   */
  clientMessage?: string;
  /** Raw detail, only ever shown behind a disclosure. */
  technicalDetail?: string;
  /**
   * Concurrency lane. Runs overlapping in time get different lanes so Activity can
   * show them side by side instead of implying one sequential process.
   */
  lane: number;
}

/** Completed work shown on Home. */
export interface WorkItem {
  id: string;
  /** e.g. "Invoice extracted and matched". */
  description: string;
  automationName: string;
  status: RunStatus;
  relativeTime: string;
  icon: IconKey;
}

export type NotificationKind =
  | "approval-requested"
  | "automation-failed"
  | "automation-recovered"
  | "integration-disconnected"
  | "automation-activated";

/** A notification in the bell menu. Each one links somewhere useful. */
export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  /** One supporting line. */
  detail: string;
  relativeTime: string;
  read: boolean;
  /** Where clicking takes the client. */
  href: string;
  /**
   * The approval this notification was raised for, when it is an approval request.
   * Resolving that one approval clears this notification and no other.
   */
  approvalId?: string;
}

/** A connected third-party service. Never exposes secrets or keys. */
export interface Integration {
  id: string;
  name: string;
  /** What it is used for, in business terms. */
  purpose: string;
  status: IntegrationStatus;
  /** Masked account hint, e.g. "ops@northgate.co.uk". Never a credential. */
  account?: string;
  /** Shown when status is needs-attention. */
  attentionReason?: string;
}

/** Notification preferences on the Settings page. */
export interface NotificationPreferences {
  emailNotifications: boolean;
  approvalNotifications: boolean;
  failedAutomationAlerts: boolean;
  weeklySummary: boolean;
}

/** A signed-in device/session, shown under Security. */
export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
}

/** Whether the client has a module on their account. */
export type ModuleState = "active" | "available";

/**
 * A capability the client has bought, or could buy.
 *
 * A module is the unit a business actually purchases — "invoice processing" — and it
 * switches on one or more automations behind the scenes. Clients think in modules;
 * automations are what the modules do once running.
 */
export interface Module {
  id: string;
  name: string;
  /**
   * The first name this system goes by, e.g. "Marcus".
   *
   * The client asked for their systems to be presented as a workforce — people who do a
   * job — rather than software they own. It is always shown WITH `name` ("Marcus · Goods
   * In"), never instead of it: four bare first names in the rail would be a staff list
   * rather than navigation, and the portal's job is telling a non-technical owner which
   * system handles what at a glance.
   */
  personName: string;
  /** One plain sentence: what this does for the business. */
  description: string;
  /** Two or three concrete things it handles, in the client's words. */
  includes: string[];
  state: ModuleState;
  /** Monthly price in GBP. Whole pounds — these are not pence-level products. */
  monthlyPrice: number;
  /** Automations this module switches on. Must match Automation ids. */
  unlocks: string[];
  /** When it was added to the account. Absent while still available to buy. */
  addedOn?: string;
  /** Roughly what it saves, for modules not yet bought. Kept concrete, not salesy. */
  typicalImpact?: string;
}

export interface Account {
  name: string;
  email: string;
  role: string;
  /** Initials for the single avatar in the header. */
  initials: string;
}

export interface Company {
  name: string;
  industry: string;
  plan: string;
}

/**
 * How the client reaches a person at Raresquared.
 *
 * The portal explains what the automations did and when they need a decision, but until
 * now it never said who to contact when something is actually wrong — a client with an
 * expired Xero connection had no route to a human.
 */
export interface Support {
  /** The named person who looks after this account. */
  leadName: string;
  leadInitials: string;
  leadRole: string;
  email: string;
  /** Plain expectation, e.g. "within 1 working hour". */
  responseTime: string;
  /** When someone is there, e.g. "Monday to Friday, 8am–6pm". */
  hours: string;
}
