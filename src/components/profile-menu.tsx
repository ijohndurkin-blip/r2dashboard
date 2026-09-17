"use client";

import Link from "next/link";
import { account } from "@/lib/data";
import { useDismissable } from "./use-dismissable";

/**
 * The single account control in the portal.
 *
 * The header shows this avatar and nothing else that repeats the client's identity —
 * the name and email appear once, inside the menu.
 */
export function ProfileMenu({ align = "bottom" }: { align?: "bottom" | "top" }) {
  const { open, toggle, close, containerRef, triggerRef } = useDismissable();

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      {/*
       * The account control carries the client's name and role, so the rail's foot reads
       * as "this is who you are signed in as" rather than an unexplained circle.
       */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left transition-colors hover:bg-paper"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[11.5px] font-medium text-surface">
          {account.initials}
        </span>
        {/* No chevron: the button already announces its state via aria-expanded, and the
            space is better spent letting the name and role sit on one line each. */}
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13px] font-medium text-ink">
            {account.name}
          </span>
          <span className="block truncate text-[12.5px] text-subtle">{account.role}</span>
        </span>
        <span className="sr-only">Account menu for {account.name}</span>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          /* Same reasoning as the notification panel: open clear of the rail, not over it. */
          className={`absolute z-50 w-60 overflow-hidden rounded-2xl border border-line bg-surface shadow-lg ${
            align === "top" ? "bottom-0 left-[calc(100%+0.75rem)]" : "left-0 mt-2"
          }`}
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium text-ink">{account.name}</p>
            <p className="truncate text-[12.5px] text-muted">{account.email}</p>
          </div>
          {/*
           * One link, not two. Account and Settings are the same page here, and the rail
           * already lists Settings — three routes to one destination is clutter.
           */}
          <div className="py-1">
            <Link
              href="/settings"
              role="menuitem"
              onClick={close}
              className="block px-4 py-2 text-[13.5px] text-ink transition-colors hover:bg-paper"
            >
              Account settings
            </Link>
          </div>
          <div className="border-t border-line py-1">
            <button
              type="button"
              role="menuitem"
              onClick={close}
              className="block w-full px-4 py-2 text-left text-[13.5px] text-ink transition-colors hover:bg-paper"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
