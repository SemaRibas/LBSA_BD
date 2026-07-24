import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-surface-200 via-surface-100 to-surface-200 bg-[length:200%_100%] animate-shimmer rounded-lg",
        className
      )}
    />
  );
};

export { Skeleton };
