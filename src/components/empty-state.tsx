import type { ReactNode } from "react";

/**
 * An empty screen is a statement that nothing needs doing, so it reads as reassurance
 * rather than absence. Centred here — the one place the portal centres text.
 */
export function EmptyState({
  title,
  description,
  icon,
  compact = false,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Tighter padding for use inside a card rather than a full page region. */
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "px-6 py-10" : "px-6 py-16"
      }`}
    >
      {icon ? (
        <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-signal-soft text-signal">
          {icon}
        </span>
      ) : null}
      <p className="text-[15px] font-medium text-ink">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
    </div>
  );
}
