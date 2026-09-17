"use client";

import Link from "next/link";
import { usePortal } from "./portal-provider";
import { useDismissable } from "./use-dismissable";
import {
  BellIcon,
  CheckIcon,
  PlugIcon,
  RefreshIcon,
  WarningIcon,
} from "./icons";
import type { NotificationKind } from "@/lib/types";

/**
 * The bell. Every notification links to the page where the client can act on it, so the
 * menu is a route into the portal rather than a dead list.
 */

/*
 * Exported: the Home card shows the same notifications, and a failure must not be red in
 * the bell and amber on the page. One definition of what each kind looks like.
 */
export const kindIcon: Record<
  NotificationKind,
  (props: { className?: string }) => React.ReactElement
> = {
  "approval-requested": CheckIcon,
  "automation-failed": WarningIcon,
  "automation-recovered": RefreshIcon,
  "integration-disconnected": PlugIcon,
  "automation-activated": CheckIcon,
};

export const kindTone: Record<NotificationKind, string> = {
  "approval-requested": "text-flag",
  "automation-failed": "text-fault",
  "automation-recovered": "text-signal",
  "integration-disconnected": "text-flag",
  "automation-activated": "text-signal",
};

export function NotificationMenu({ align = "bottom" }: { align?: "bottom" | "top" }) {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } =
    usePortal();
  const { open, toggle, close, containerRef, triggerRef } = useDismissable();

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications, none unread"
        }
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-ink"
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-flag ring-2 ring-surface" />
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Notifications"
          /*
           * At the foot of the rail the panel opens upward and to the RIGHT: it is 352px
           * against a 248px rail, so anchoring it left-0 pushed 104px past the rail edge
           * where it looked unanchored (and was clipped outright until the aside's
           * overflow was removed). `left-full ml-3` sits it clear of the rail instead.
           */
          /*
           * When it opens from the rail's foot this is `fixed`, not `absolute`.
           *
           * Any offset relative to this component resolves against the bell's own 40px
           * wrapper, not the rail — so it can only reach the rail edge via a number that
           * happens to match where the bell currently sits, which drifts the moment the
           * footer row changes. Going fixed escapes that box: left-[260px] is the 248px
           * rail plus a 12px gutter, measured from the viewport and true regardless of
           * the trigger's position.
           *
           * Height is capped against the viewport rather than a fixed 22rem, so the list
           * never presses against the bottom of a short screen.
           */
          className={`z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface shadow-lg ${
            align === "top"
              ? "fixed bottom-4 left-[260px] max-h-[min(26rem,calc(100vh-2rem))]"
              : "absolute left-0 mt-2"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="rounded text-[12.5px] text-muted transition-colors hover:text-ink"
              >
                Mark all as read
              </button>
            ) : null}
          </div>

          <ul className="max-h-[22rem] divide-y divide-line overflow-y-auto">
            {notifications.map((notification) => {
              const KindIcon = kindIcon[notification.kind];
              return (
                <li key={notification.id}>
                  <Link
                    href={notification.href}
                    role="menuitem"
                    onClick={() => {
                      markNotificationRead(notification.id);
                      close();
                    }}
                    className="flex gap-3 px-4 py-3 transition-colors hover:bg-paper"
                  >
                    <KindIcon
                      className={`mt-0.5 h-4 w-4 shrink-0 ${kindTone[notification.kind]}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start gap-2">
                        <span className="text-[13.5px] font-medium leading-snug text-ink">
                          {notification.title}
                        </span>
                        {!notification.read ? (
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-flag"
                            aria-label="Unread"
                          />
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] leading-relaxed text-muted">
                        {notification.detail}
                      </span>
                      <span className="mt-1 block text-[12px] text-subtle">
                        {notification.relativeTime}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
