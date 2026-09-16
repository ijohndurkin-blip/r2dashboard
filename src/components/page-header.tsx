import type { ReactNode } from "react";

/**
 * The opening of every page: a title, one supporting line, and optional trailing content.
 *
 * No eyebrow label above the title and no all-caps kicker — the page name is enough, and
 * those treatments read as decoration rather than information.
 */
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  /** One concise sentence. Keep it to a single line of meaning. */
  description: string;
  /** Optional trailing element, e.g. a filter control. */
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[28px]">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </header>
  );
}
