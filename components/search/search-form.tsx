"use client";

import { SearchInput } from "@/components/ui/search-input";

export function SearchForm({
  initialQuery = "",
  size = "md",
  className,
}: {
  initialQuery?: string;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <form action="/search" method="get" className={className} role="search">
      <SearchInput
        name="q"
        defaultValue={initialQuery}
        placeholder={
          size === "lg"
            ? "Ask anything about your learning..."
            : "Search courses and lessons..."
        }
        size={size}
        required
        maxLength={200}
        autoComplete="off"
      />
    </form>
  );
}
