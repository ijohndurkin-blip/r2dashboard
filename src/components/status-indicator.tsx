import type { AutomationStatus, IntegrationStatus, RunStatus } from "@/lib/types";

/**
 * Status, communicated by wording first and colour second.
 *
 * Colour alone would leave the state invisible to a screen reader and to anyone who
 * can't distinguish the hues, so the label is always rendered — visibly by default, or
 * as screen-reader-only text when the surrounding layout supplies its own wording.
 */

type AnyStatus = AutomationStatus | RunStatus | IntegrationStatus;

type Tone = "signal" | "flag" | "fault" | "neutral";

const meta: Record<AnyStatus, { label: string; tone: Tone; pulse?: boolean }> = {
  // Automations
  running: { label: "Running normally", tone: "signal" },
  "needs-attention": { label: "Needs attention", tone: "flag" },
  paused: { label: "Paused", tone: "neutral" },
  // Runs
  completed: { label: "Completed", tone: "signal" },
  "awaiting-approval": { label: "Waiting for approval", tone: "flag" },
  failed: { label: "Failed", tone: "fault" },
  // Integrations
  connected: { label: "Connected", tone: "signal" },
  "not-connected": { label: "Not connected", tone: "neutral" },
};

const dotTone: Record<Tone, string> = {
  signal: "bg-signal",
  flag: "bg-flag",
  fault: "bg-fault",
  neutral: "bg-subtle",
};

const textTone: Record<Tone, string> = {
  signal: "text-signal",
  flag: "text-flag",
  fault: "text-fault",
  neutral: "text-muted",
};

interface StatusIndicatorProps {
  status: AnyStatus;
  /** Override the default wording, e.g. "Running" instead of "Running normally". */
  label?: string;
  /** Hide the label visually but keep it for assistive technology. */
  labelHidden?: boolean;
  /** Colour the label to match the dot. Off by default to keep pages calm. */
  colored?: boolean;
  className?: string;
}

export function StatusIndicator({
  status,
  label,
  labelHidden = false,
  colored = false,
  className = "",
}: StatusIndicatorProps) {
  const { label: defaultLabel, tone } = meta[status];
  const text = label ?? defaultLabel;
  const live = status === "running" || status === "awaiting-approval";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden="true"
        className={`relative flex h-2 w-2 shrink-0 rounded-full ${dotTone[tone]}`}
      >
        {live ? (
          <span
            className={`absolute inset-0 animate-ping rounded-full opacity-60 motion-reduce:animate-none ${dotTone[tone]}`}
          />
        ) : null}
      </span>
      <span
        className={
          labelHidden
            ? "sr-only"
            : `text-[13px] ${colored ? textTone[tone] : "text-muted"}`
        }
      >
        {text}
      </span>
    </span>
  );
}
