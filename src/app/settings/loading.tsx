import { PageSkeleton, SkeletonCard } from "@/components/skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <SkeletonCard rows={2} />
      <SkeletonCard rows={2} />
      <SkeletonCard rows={4} />
      <SkeletonCard rows={3} />
    </PageSkeleton>
  );
}
