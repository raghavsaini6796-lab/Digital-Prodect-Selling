import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

/**
 * App logo — renders a geometric mark + optional wordmark.
 * Used in Sidebar and Navbar.
 */
export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Geometric mark */}
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
        <div className="h-3 w-3 rounded-sm bg-background" />
      </div>
      {showText && (
        <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
      )}
    </div>
  );
}
