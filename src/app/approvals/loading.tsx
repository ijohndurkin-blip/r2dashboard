import { PageSkeleton, SkeletonLine } from "@/components/skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <SkeletonLine className="h-10 w-48" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonLine key={index} className="h-64 rounded-2xl" />
        ))}
      </div>
    </PageSkeleton>
  );
}
