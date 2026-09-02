import { cn } from "@/lib/utils";

/**
 * Yuklanish paytidagi joy egallovchi blok.
 * Spinner o'rniga shuni ishlating — sahifa tuzilishi sakramaydi.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "after:absolute after:inset-0 after:animate-shimmer after:-translate-x-full",
        "after:bg-gradient-to-r after:from-transparent after:via-foreground/[0.06] after:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
