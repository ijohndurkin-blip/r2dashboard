import { PageSkeleton, SkeletonLine } from "@/components/skeleton";

/** Three hiring cards in a row, matching the grid the page settles into. */
export default function Loading() {
  return (
    <PageSkeleton>
      <SkeletonLine className="h-10 w-56" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonLine key={index} className="h-72 rounded-xl" />
        ))}
      </div>
    </PageSkeleton>
  );
}
