import { PageSkeleton, SkeletonCard, SkeletonLine } from "@/components/skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <SkeletonLine className="h-16 rounded-xl" />
      <SkeletonLine className="h-32 rounded-xl" />
      {/* xl, matching page.tsx: at lg the skeleton split two-up while the real page
          stayed stacked, so content jumped sideways as it loaded. */}
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <SkeletonCard rows={3} />
        </div>
        <div className="xl:col-span-2">
          <SkeletonCard rows={4} />
        </div>
      </div>
      <SkeletonCard rows={5} />
    </PageSkeleton>
  );
}
