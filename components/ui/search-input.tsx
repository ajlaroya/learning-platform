import { Search, Command } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchInput({
  className,
  placeholder = "Search anything...",
  size = "md",
}: {
  className?: string;
  placeholder?: string;
  size?: "md" | "lg";
}) {
  return (
    <label className="relative block">
      <span className="sr-only">Search</span>
      <Search
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-neutral-500 ${size === "lg" ? "left-6 h-6 w-6" : "left-4 h-4 w-4"}`}
      />
      <input
        type="search"
        placeholder={placeholder}
        className={cn(
          size === "lg"
            ? "h-22 w-full rounded-xl border border-canvas-line bg-white pl-16 pr-20 text-[18px] text-neutral-900 placeholder:text-neutral-500 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20"
            : "h-11 w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-12 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
          className,
        )}
      />
      <span
        className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 font-medium text-neutral-500 ${size === "lg" ? "right-5 px-3 py-2 text-sm" : "right-3 px-1.5 py-0.5 text-[10px]"}`}
      >
        <Command className="h-3 w-3" />K
      </span>
    </label>
  );
}
