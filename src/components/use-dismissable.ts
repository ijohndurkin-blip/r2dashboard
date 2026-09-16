"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/**
 * Shared behaviour for the rail's two dropdowns.
 *
 * Both menus need the same things to be usable without a mouse: Escape closes, clicking
 * outside closes, and focus returns to the trigger afterwards so tab order isn't lost.
 * Written once here rather than twice, slightly differently, in each menu.
 *
 * They are also mutually exclusive. The bell and the account menu sit a few pixels apart
 * at the foot of a 248px rail, so two open panels would overlap each other. Opening one
 * closes any other, coordinated through this registry rather than by wiring the two
 * components together.
 */
const openMenus = new Set<() => void>();

export function useDismissable<T extends HTMLElement = HTMLDivElement>(): {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
  containerRef: RefObject<T | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
} {
  const [open, setOpenState] = useState(false);
  const containerRef = useRef<T | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const closeSelf = useCallback(() => setOpenState(false), []);

  const setOpen = useCallback(
    (next: boolean) => {
      if (next) {
        // Close every other open menu before this one opens.
        openMenus.forEach((close) => {
          if (close !== closeSelf) close();
        });
        openMenus.add(closeSelf);
      } else {
        openMenus.delete(closeSelf);
      }
      setOpenState(next);
    },
    [closeSelf],
  );

  // Leave the registry behind if the component unmounts while open.
  useEffect(() => () => void openMenus.delete(closeSelf), [closeSelf]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        openMenus.delete(closeSelf);
        setOpenState(false);
        triggerRef.current?.focus();
      }
    }

    function onPointerDown(event: PointerEvent) {
      const node = containerRef.current;
      if (node && event.target instanceof Node && !node.contains(event.target)) {
        openMenus.delete(closeSelf);
        setOpenState(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, closeSelf]);

  /*
   * Functional update, not `setOpen(!open)`: the latter closes over the `open` value from
   * the render that created it, so two clicks landing in the same task (a fast double-tap,
   * or a scripted burst) both read the same stale value and the menu never toggles.
   */
  const toggle = useCallback(() => {
    setOpenState((current) => {
      const next = !current;
      if (next) {
        openMenus.forEach((close) => {
          if (close !== closeSelf) close();
        });
        openMenus.add(closeSelf);
      } else {
        openMenus.delete(closeSelf);
      }
      return next;
    });
  }, [closeSelf]);

  return {
    open,
    setOpen,
    toggle,
    close: () => setOpen(false),
    containerRef,
    triggerRef,
  };
}
