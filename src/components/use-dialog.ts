"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/**
 * Behaviour for a modal dialog.
 *
 * Deliberately separate from useDismissable rather than an extension of it. That hook
 * serves the rail's two dropdowns and coordinates them through a mutual-exclusion
 * registry so the bell and the account menu cannot both be open; a dialog has different
 * semantics and needs three things a dropdown does not:
 *
 *   - focus moves INTO the panel when it opens, not just back to the trigger on close,
 *     so a keyboard user is not left tabbing through the page behind the overlay
 *   - Tab and Shift+Tab are trapped, for the same reason
 *   - background scrolling is locked, so the page behind does not move under the overlay
 *
 * Bending the dropdown hook to cover all three would have risked the rail menus, which
 * are already working and depend on its registry.
 */
export function useDialog<T extends HTMLElement = HTMLDivElement>(): {
  open: boolean;
  openDialog: () => void;
  close: () => void;
  panelRef: RefObject<T | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
} {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<T | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const openDialog = useCallback(() => setOpen(true), []);

  /* Returning focus to the trigger is what makes closing not lose the user's place. */
  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;

    /*
     * Move focus in. The panel itself is the target rather than its first control: the
     * dialog opens to be read, so starting on the close button would announce the escape
     * hatch before the content.
     */
    panel?.focus();

    /*
     * Lock the page behind, and compensate for the scrollbar it removes.
     *
     * overflow:hidden alone makes the page jump: the vertical scrollbar disappears, the
     * content reclaims its width, and everything shifts sideways as the dialog opens —
     * then back again on close. Padding the body by exactly the scrollbar's width holds
     * the layout still.
     *
     * The width is measured rather than assumed, because it differs per platform and is
     * 0 for overlay scrollbars (macOS trackpads, most touch devices), where padding
     * would itself cause the shift it is meant to prevent.
     *
     * Previous values are captured and restored rather than reset to "", so this cannot
     * clobber styles set by something else.
     */
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const current = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${current + scrollbarWidth}px`;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      const focusable = [
        ...panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => el.offsetParent !== null);

      /* Nothing focusable inside: keep focus on the panel rather than letting it escape. */
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!event.shiftKey && (active === last || active === panel)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  return { open, openDialog, close, panelRef, triggerRef };
}
