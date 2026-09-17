/**
 * Loading placeholders.
 *
 * Shaped like the content that is arriving rather than a generic spinner, so the page
 * doesn't jump when the real thing lands.
 */
export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block animate-pulse rounded bg-line motion-reduce:animate-none ${className}`}
    />
  );
}

export function SkeletonHeader() {
  return (
    <div className="flex flex-col gap-3">
      <SkeletonLine className="h-7 w-44" />
      <SkeletonLine className="h-4 w-full max-w-md" />
    </div>
  );
}

/** A card-shaped placeholder with a configurable number of rows. */
export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-line bg-surface">
      <div className="border-b border-line px-5 py-4">
        <SkeletonLine className="h-4 w-32" />
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex-1 space-y-2">
              <SkeletonLine className="h-3.5 w-2/3" />
              <SkeletonLine className="h-3 w-1/3" />
            </div>
            <SkeletonLine className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Wraps a page-level loading view with the standard header placeholder. */
export function PageSkeleton({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <SkeletonHeader />
      {children}
    </div>
  );
}
