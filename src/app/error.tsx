"use client";

import { useEffect } from "react";
import { WarningIcon } from "@/components/icons";

/**
 * Something went wrong loading a page.
 *
 * Written the way the brief asks errors to be written: what it means for the client and
 * what happens next, not a status code. Next 16 supplies `retry` (earlier versions called
 * this prop `reset`).
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-flag-soft text-flag">
        <WarningIcon className="h-5 w-5" />
      </span>
      <h1 className="text-lg font-semibold text-ink">This page didn&apos;t load</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        Your automations are still running normally — this is a problem showing the page, not
        with your workforce. Try again in a moment.
      </p>
      <button
        type="button"
        onClick={retry}
        className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg bg-ink px-4 text-sm font-medium text-surface transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
