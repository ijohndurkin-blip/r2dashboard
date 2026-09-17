import { PageSkeleton, SkeletonLine } from "@/components/skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <SkeletonLine className="h-5 w-40" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonLine key={index} className="h-56 rounded-2xl" />
        ))}
      </div>
    </PageSkeleton>
  );
}
