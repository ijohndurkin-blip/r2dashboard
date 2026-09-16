"use client";

import Link from "next/link";
import { Card, CardHeader } from "./card";
import { EmptyState } from "./empty-state";
import { BellIcon, ChevronRightIcon } from "./icons";
import { kindIcon, kindTone } from "./notification-menu";
import { usePortal } from "./portal-provider";

/**
 * Recent notifications, in the right column under Your systems.
 *
 * This fills what was ~500px of empty column beside Recent work, and it earns the space:
 * "what happened recently" is one of the questions Home exists to answer, and until now
 * notifications lived only behind the bell, where nothing on the page hinted at them.
 *
 * Deliberately NOT a second bell. No "mark all as read" — that control belongs to the
 * bell, and two of them would leave the client unsure which list they had cleared.
 * Reading one here still marks it read, because they have seen it.
 *
 * Capped at four: enough to fill the column beside Your systems without turning a glanceable
 * card into a scrolling list. The bell holds the full history.
 */
export function RecentNotifications() {
  const { notifications, unreadCount, markNotificationRead } = usePortal();
  const shown = notifications.slice(0, 4);

  return (
    <Card>
      <CardHeader
        title="Latest updates"
        count={unreadCount > 0 ? `${unreadCount} unread` : undefined}
      />

      {shown.length === 0 ? (
        <EmptyState
          compact
          icon={<BellIcon className="h-5 w-5" />}
          title="Nothing new"
          description="Updates about your workforce will appear here."
        />
      ) : (
        <ul className="divide-y divide-line">
          {shown.map((notification) => {
            const KindIcon = kindIcon[notification.kind];
            return (
              <li key={notification.id}>
                <Link
                  href={notification.href}
                  onClick={() => markNotificationRead(notification.id)}
                  className="flex gap-3 px-5 py-3.5 transition-colors hover:bg-paper"
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
      )}

      {notifications.length > shown.length ? (
        <div className="border-t border-line px-5 py-3">
          <Link
            href="/activity"
            className="flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-ink"
          >
            See all activity
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
