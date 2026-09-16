import { PageSkeleton, SkeletonCard } from "@/components/skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <SkeletonCard rows={6} />
      <SkeletonCard rows={3} />
    </PageSkeleton>
  );
}
