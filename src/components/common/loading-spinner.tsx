import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
};

/**
 * Loading spinner — minimal CSS-only spinner using Tailwind animate-spin.
 */
export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-muted border-t-foreground",
        sizeMap[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Full-page loading overlay — used in page-level loading.tsx files.
 */
export function PageLoader() {
  return (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
