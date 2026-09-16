import type { ReactNode } from "react";

/**
 * Structure comes from a hairline border, not a drop shadow — shadows are reserved for
 * things that genuinely float above the page (open menus). See DESIGN.md, principle 4.
 */
export function Card({
  children,
  className = "",
  as: Element = "section",
  measured = false,
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "div" | "li";
  /**
   * Cap the card to a readable measure.
   *
   * For list-style cards — label on the left, its value on the right — a full 1110px row
   * pushed the value to the far edge: measured gaps of 660px on Home, 721–877px in
   * Settings. Capping each *row* fixed the gap but left a dead region inside a full-width
   * card, which read as unfinished. Capping the card instead shrinks the frame to its
   * content, so there is no empty half and the pair still reads as one fact.
   */
  measured?: boolean;
}) {
  return (
    <Element
      className={`rounded-xl border border-line bg-surface ${
        /*
         * Capped, NOT centred.
         *
         * Centring these was tried and reverted: on Settings the narrow cards moved to
         * x=476 while the page header and the full-width Account/Company cards stayed at
         * x=288, so the page had two competing left edges and the band heading
         * "Preferences and connections" hung 188px to the left of the cards it introduces.
         * A single left edge shared by headings, body text and cards beats closing a gap
         * on the right.
         */
        measured ? "row-measure" : ""
      } ${className}`}
    >
      {children}
    </Element>
  );
}

/**
 * A card's heading row: a title, an optional count, and optional trailing content such
 * as a link. The count sits with the title so it reads as one phrase.
 */
export function CardHeader({
  title,
  count,
  children,
  heading = true,
}: {
  title: string;
  count?: number | string;
  children?: ReactNode;
  /**
   * Whether the title belongs in the document outline.
   *
   * Defaults true, which is right when the title names the card. Pass false where the
   * title is a *value* rather than a label — Activity's summary card is headed "8 runs",
   * which as an h2 put a number in the outline as though it introduced a section, and
   * renamed itself every time the count changed.
   */
  heading?: boolean;
}) {
  const Title = heading ? "h2" : "p";
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
      <Title className="flex items-baseline gap-2 text-[15px] font-semibold text-ink">
        {title}
        {count !== undefined ? (
          <span className="tabular text-[13px] font-normal text-muted">{count}</span>
        ) : null}
      </Title>
      {children ? <div className="shrink-0 text-[13px]">{children}</div> : null}
    </div>
  );
}
