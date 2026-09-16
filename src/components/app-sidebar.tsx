"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NotificationMenu } from "./notification-menu";
import { ProfileMenu } from "./profile-menu";
import { usePortal } from "./portal-provider";
import {
  ApprovalsIcon,
  CloseIcon,
  HireIcon,
  HistoryIcon,
  HomeIcon,
  MenuIcon,
  SettingsIcon,
  SystemsIcon,
} from "./icons";
import { WorkerAvatar } from "./worker-avatar";

/**
 * The one application navigation, as a left rail.
 *
 * Six destinations, one bell, one avatar — the bell immediately before it, both anchored
 * at the foot of the rail. No search field, no "New automation" button, no second copy of
 * the client's identity.
 *
 * Below lg the rail becomes an off-canvas drawer behind a slim bar, because a permanent
 * 260px rail would eat most of a phone screen.
 */

const navigation = [
  { href: "/", label: "Home", icon: HomeIcon },
  /*
   * "Hire workers" sits directly under Home, at the client's direction: browsing who
   * else Raresquared could put on is its own destination rather than a section at the
   * foot of the page that lists the people you already have.
   */
  { href: "/hire", label: "Hire workers", icon: HireIcon },
  // The route stays /systems: the URL is live, and this is a change to what is read.
  { href: "/systems", label: "Your workforce", icon: SystemsIcon },
  /*
   * "All approvals", not "Approvals": each worker's own page now carries the decisions
   * waiting on them, so this row is the one that gathers every worker's together. The
   * label says which of the two you are about to open.
   */
  { href: "/approvals", label: "All approvals", icon: ApprovalsIcon },
  { href: "/activity", label: "Activity", icon: HistoryIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

/**
 * Intrinsic size 261×85, declared so the rail reserves space before the file loads.
 *
 * `-ml-0.5` optically aligns the logo's ink with the nav icons below it: the artwork
 * carries a little transparent padding, so matching the box edges would leave the mark
 * looking inset by comparison.
 */
function Wordmark({
  onNavigate,
  size = "rail",
}: {
  onNavigate?: () => void;
  /**
   * "rail" is the 60px mark sized for the 248px desktop rail and the drawer. "bar" is
   * the smaller mark for the mobile top bar, where 60px spanned half the 375px width
   * and crowded the menu button.
   */
  size?: "rail" | "bar";
}) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      aria-label="Raresquared Labs — go to overview"
      className="flex shrink-0 items-center rounded"
    >
      <Image
        src="/raresquared-logo.png"
        alt="Raresquared Labs"
        width={261}
        height={85}
        priority
        className={size === "bar" ? "h-9 w-auto" : "h-[60px] w-auto"}
      />
    </Link>
  );
}

/** The rail's contents, shared by the fixed desktop rail and the mobile drawer. */
function RailContents({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { pendingApprovals, activeModules, bobReviewItems } = usePortal();

  /*
   * Exact match for "/" and for "/systems".
   *
   * startsWith was correct while /systems had no children, but each module now has its
   * own page beneath it. On /systems/mod-goods-in a prefix match lights BOTH the parent
   * row and the module row — two aria-current="page" elements, and two filled surfaces
   * in a rail whose active state is carried by the surface alone. The module rows below
   * are the more specific answer to "where am I", so the parent yields to them.
   *
   * The other three keep the prefix match: they have no child routes today, and if one
   * grows them the same reasoning applies at that point.
   */
  function isActive(href: string): boolean {
    return href === "/" || href === "/systems"
      ? pathname === href
      : pathname.startsWith(href);
  }

  return (
    <div className="flex h-full flex-col">
      {/*
       * pl-5 puts the logo's INK flush with the nav icon column at 24px, so the whole
       * rail hangs off one left edge. The PNG carries 4px of transparent padding, so the
       * box starts at 20px: 20 + 4 = 24.
       *
       * It was previously pl-8, which centred the ink over the block of rows (123px,
       * matching the row-box centre). Both are valid; flush-left was chosen because the
       * rest of the portal is built on a single left edge.
       *
       * Both figures come from a canvas alpha scan plus getBoundingClientRect. If the
       * rail width, row padding or artwork changes, re-measure and re-derive rather than
       * nudging the value by eye.
       */}
      <div className="flex h-[104px] shrink-0 items-center pl-5 pt-2">
        <Wordmark onNavigate={onNavigate} />
      </div>

      {/*
       * Each row is a `group` so the label responds to hover anywhere on the row, not just
       * on the text itself. The active row reads through its own surface and weight rather
       * than a marker bar.
       *
       * There is no icon tile — the description of a "brand-accent wash and a filled tile"
       * described a version that was removed some time ago.
       */}
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 pb-2">
        <ul className="flex flex-col gap-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            const waiting =
              item.href === "/approvals"
                ? pendingApprovals.length + bobReviewItems.length
                : 0;
            const ItemIcon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-11 items-center gap-3 rounded-lg px-3 text-[14px] transition-colors duration-150 ${
                    active
                      ? "bg-paper font-medium text-ink"
                      : "text-nav hover:bg-paper/60 hover:text-ink"
                  }`}
                >
                  {/*
                   * No tile behind the icon at all.
                   *
                   * This went pastel cyan (toyish), then solid navy (a dark bruise in an
                   * otherwise light rail), then transparent-with-a-box (icons floating in
                   * nothing). The tile itself was the problem: a 248px rail with five
                   * rows does not need a decorated container per row. The active row's
                   * own background is the only surface needed, and the icon simply takes
                   * the row's text colour.
                   */}
                  {/*
                   * Navy glyphs, still with no tile behind them.
                   *
                   * The icon no longer matches the label's grey. That was the rule when
                   * both were neutral — two *slightly* different greys read as sloppy
                   * without being nameable — but navy against grey is a deliberate
                   * difference rather than an accidental one, and it is the colour the
                   * client asked for. It also reads better: navy on the rail is 14.69:1
                   * against the grey's 8.22:1.
                   *
                   * Navy holds through all three states, including hover. Letting it fall
                   * to ink on hover would make the glyph look duller the moment you point
                   * at it, which is backwards — so the label alone shifts to ink and the
                   * icon keeps its colour.
                   *
                   * Still no tile. That part of the history stands: pastel cyan was toyish,
                   * solid navy was a dark bruise, and a bordered transparent box left the
                   * icons floating in nothing. Colouring the glyph is what the tile was
                   * reaching for.
                   */}
                  <ItemIcon
                    className="h-[18px] w-[18px] shrink-0 text-brand transition-colors duration-150"
                  />
                  <span className="flex-1">{item.label}</span>
                  {waiting > 0 ? (
                    <span className="tabular flex h-5 min-w-5 items-center justify-center rounded-full bg-flag px-1.5 text-[11px] font-semibold text-surface">
                      {waiting}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        {/*
         * The modules on this account, each linking to its own page.
         *
         * Only active modules appear. A sidebar is navigation, and you navigate to what
         * you have; the ones still to hire live on /hire ("Hire workers"),
         * where they have a price and an Add button that a nav row cannot carry.
         *
         * A separate "Modules" nav ITEM was removed once before, because it duplicated
         * /systems. This is not that: these are per-module destinations, not a second
         * copy of the page.
         *
         * Sentence case, not a caps eyebrow — DESIGN.md rules out ALL-CAPS labels.
         */}
        {activeModules.length > 0 ? (
          <>
            {/*
             * Separates the five fixed destinations from the account's own modules.
             *
             * Same rule as the account block at the foot of the rail: a hairline inset to
             * the row padding, not run edge-to-edge. A full-width rule under indented
             * content reads as bolted onto the rail rather than part of it. The heading
             * alone was carrying this break and did not hold it — the modules read as a
             * sixth nav group rather than a different kind of thing.
             */}
            <div className="mx-3 mb-4 mt-5 h-px bg-line" />
            {/*
             * "Working for you", not "Your workforce" — the nav row directly above now
             * carries that name, and the rail would otherwise say the same two words
             * twice within five rows. This names what the list IS (the people currently
             * on the account) rather than repeating the destination above it.
             */}
            {/*
             * A div with a role, not an h2.
             *
             * The rail renders before <main>, so an h2 here was the first heading on
             * every page — a screen reader walking the outline met "Working for you"
             * before the page's own h1, and the rail's label appeared to introduce the
             * page. The label still needs to exist for the list beneath it, so it keeps
             * its accessible name via the nav's aria-labelledby below; it just stops
             * claiming a place in the document outline.
             */}
            <div
              id="rail-workforce-label"
              className="mb-1 px-3 text-[12.5px] font-medium text-subtle"
            >
              Working for you
            </div>
            <ul aria-labelledby="rail-workforce-label" className="flex flex-col gap-1">
              {activeModules.map((module) => {
                const href = `/systems/${module.id}`;
                const active = pathname === href;
                /*
                 * Approvals waiting on THIS worker, counted exactly as their own page
                 * counts them — same filter, so the rail and the page cannot disagree.
                 * Grace runs two automations, so hers is the sum across both.
                 *
                 * Bob is the one exception: he isn't backed by seed automations at all
                 * (`unlocks` is empty), so his count comes from his own live application
                 * instead — see bobReviewItems in the portal provider.
                 */
                const waitingOnWorker =
                  module.id === "mod-bob-invoice-processor"
                    ? bobReviewItems.length
                    : pendingApprovals.filter((approval) =>
                        module.unlocks.includes(approval.automationId),
                      ).length;
                return (
                  <li key={module.id}>
                    {/*
                     * px-3 and gap-3, identical to the rows above: the icon sits at the
                     * button's left edge and the label follows it.
                     *
                     * These were once indented to 54px — text aligned with the labels
                     * above, empty space where their icons are. The client asked for
                     * flush left, then for icons; both are satisfied by the same
                     * structure the parent rows use, where the ROW starts at the left
                     * edge rather than the text being pushed into a blank column.
                     *
                     * Distinct glyphs per module, which is what makes them worth having:
                     * a truck, a receipt, an envelope and a contact book are told apart
                     * at 16px. Four copies of one generic box would not be.
                     */}
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`group flex min-h-9 items-center gap-3 rounded-lg px-3 py-1.5 text-[13px] transition-colors duration-150 ${
                        active
                          ? "bg-paper font-medium text-ink"
                          : "text-nav hover:bg-paper/60 hover:text-ink"
                      }`}
                    >
                      {/*
                       * The worker's face, at 22px rather than the 16px glyph it replaced.
                       *
                       * These were reviewed at 18px and read as mush — the illustrations
                       * carry too much detail to survive that. 22px is the largest the row
                       * takes without growing it (min-h-9 = 36px, less py-1.5 top and
                       * bottom leaves 24px), and at that size the hair, skin tone and
                       * clothing colour are enough to tell one from another even where the
                       * faces are not legible.
                       *
                       * It sits in an 18px-wide centring column — the width of the nav
                       * glyphs above — and overflows it symmetrically by 2px a side. That
                       * is the whole point: sharing a left edge is NOT sharing a centre.
                       * Measured, the 18px glyphs centre on x=33 and a flush-left 22px
                       * avatar centred on 35, with labels at 54 and 58. Boxing the avatar
                       * to 18 puts both midlines on 33 and both labels on 54, so the rail
                       * reads as one column rather than two that nearly line up.
                       *
                       * If the avatar size or the nav glyph size changes, re-measure with
                       * getBoundingClientRect and re-derive — do not nudge this by eye.
                       *
                       * The initials disc inside WorkerAvatar still covers a module with
                       * no artwork, so the rail never shows a broken image.
                       */}
                      <span className="flex w-[18px] shrink-0 justify-center">
                        <WorkerAvatar
                          moduleId={module.id}
                          size={22}
                        />
                      </span>
                      {/*
                       * Name first, then the job — "Marcus · Goods In".
                       *
                       * Never the name alone: four bare first names in a rail is a staff
                       * list, not navigation, and a client still has to see which system
                       * handles deliveries without opening anything. The job carries the
                       * quieter colour so the name leads the scan while the function
                       * stays legible beside it.
                       */}
                      {/*
                       * flex-1 so the badge can sit hard right, as it does on the
                       * Approvals row above. min-w-0 keeps truncate working inside a
                       * flex child — without it a long name pushes the badge out of
                       * the row instead of ellipsing.
                       */}
                      <span className="min-w-0 flex-1 truncate">
                        {module.personName}
                        <span
                          className={active ? "text-muted" : "text-subtle"}
                        >{` · ${module.name}`}</span>
                      </span>
                      {/*
                       * The same badge the Approvals row carries — one badge idiom in
                       * the rail, not two. It answers "who needs me?" without opening
                       * anything, which is what a second level of nav rows would have
                       * been reached for.
                       *
                       * The number alone means nothing to a screen reader, so the count
                       * is hidden from it and a real sentence is read instead — the same
                       * rule StatusIndicator follows.
                       */}
                      {waitingOnWorker > 0 ? (
                        <>
                          <span
                            aria-hidden="true"
                            className="tabular flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-flag px-1.5 text-[10.5px] font-semibold text-surface"
                          >
                            {waitingOnWorker}
                          </span>
                          <span className="sr-only">
                            {`${waitingOnWorker} ${
                              waitingOnWorker === 1 ? "approval" : "approvals"
                            } waiting on you`}
                          </span>
                        </>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </nav>

      {/*
       * The account block: who you are, with the bell as a peer control beside it.
       * Both are 40px tall so they sit on one baseline instead of looking dropped in.
       */}
      {/*
       * The divider is inset to match the nav rows (px-3), not run edge-to-edge: a
       * full-width rule under indented content made the account block read as bolted
       * onto the rail rather than part of it.
       */}
      <div className="shrink-0 px-3 pb-3 pt-3">
        <div className="mb-3 h-px bg-line" />
        <div className="flex items-center gap-1">
          <ProfileMenu align="top" />
          <NotificationMenu align="top" />
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: a fixed rail the content is offset against. */}
      {/*
       * h-screen with the rail's own scroll: `inset-y-0` alone let the white background
       * stop partway down a long page, leaving a visible seam against the page ground.
       */}
      {/*
       * No `overflow-y-auto` here. It was added to keep the rail scrollable on a short
       * viewport, but overflow on the aside creates a clipping context, which cut off the
       * notification panel where it extended past the 248px rail. The scroll belongs on
       * the <nav> instead — the logo block and account footer are fixed height, so the
       * nav list is the only part that can overflow, and clipping it is harmless.
       */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[248px] border-r border-line bg-surface lg:block">
        <RailContents />
      </aside>

      {/* Below lg: a slim bar that opens the same rail as a drawer. */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur-[2px] lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-rail"
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-ink"
        >
          <MenuIcon className="h-[18px] w-[18px]" />
        </button>
        <Wordmark size="bar" />
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/20"
          />
          {/*
           * 288px, not 264: the logo box runs 32→216px and the close button starts at
           * 216px in a 264px drawer, so the two would touch exactly. The extra width
           * gives both room.
           */}
          <div
            id="mobile-rail"
            className="absolute inset-y-0 left-0 w-[288px] max-w-[85vw] border-r border-line bg-surface"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-ink"
            >
              <CloseIcon className="h-[18px] w-[18px]" />
            </button>
            <RailContents onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
