interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div
    className={`animate-pulse rounded-lg bg-(--bg-tertiary)/80 ${className}`}
    aria-hidden="true"
  />
);

export default Skeleton;
