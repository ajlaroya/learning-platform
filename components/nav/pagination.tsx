import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  current,
  total,
  className,
}: {
  current: number;
  total: number;
  className?: string;
}) {
  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center gap-2", className)}
    >
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {[1, 2, 3, 4, 5].slice(0, Math.min(total, 5)).map((page) => (
        <button
          key={page}
          type="button"
          aria-current={page === current ? "page" : undefined}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium",
            page === current
              ? "border-primary-500 bg-white text-primary-500"
              : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50",
          )}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
