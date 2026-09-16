import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-lg font-semibold text-ink">We couldn&apos;t find that page</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        The link may be out of date. Everything in your portal is reachable from the overview.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg bg-ink px-4 text-sm font-medium text-surface transition-opacity hover:opacity-90"
      >
        Go to overview
      </Link>
    </div>
  );
}
