import { Search, Command } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchInput({
  className,
  placeholder = "Search anything...",
}: {
  className?: string;
  placeholder?: string;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">Search</span>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <input
        type="search"
        placeholder={placeholder}
        className={cn(
          "h-11 w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-12 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
          className,
        )}
      />
      <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
        <Command className="h-3 w-3" />K
      </span>
    </label>
  );
}
