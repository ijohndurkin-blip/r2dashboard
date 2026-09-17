import { PageSkeleton, SkeletonLine } from "@/components/skeleton";

/**
 * The parent /systems skeleton shows four equal cards, which is the wrong shape here:
 * this page is a title, one summary panel, then the automation detail.
 */
export default function Loading() {
  return (
    <PageSkeleton>
      <SkeletonLine className="h-4 w-28" />
      <SkeletonLine className="h-7 w-56" />
      <SkeletonLine className="h-32 rounded-2xl" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <SkeletonLine key={index} className="h-40 rounded-2xl" />
        ))}
      </div>
    </PageSkeleton>
  );
}
