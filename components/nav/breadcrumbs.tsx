import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Breadcrumbs({
  items,
  className,
}: {
  items: { label: string; href?: string; current?: boolean }[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center gap-2 text-sm text-neutral-500">
        {items.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className="flex items-center gap-2"
          >
            {item.href && !item.current ? (
              <Link href={item.href} className="hover:text-neutral-700">
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  item.current ? "text-neutral-400" : "text-neutral-500"
                }
              >
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <ChevronRight
                className="h-3.5 w-3.5 text-neutral-300"
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
