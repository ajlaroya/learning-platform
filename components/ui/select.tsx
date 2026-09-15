import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Select({
  label,
  options,
  className,
}: {
  label: string;
  options: string[];
  className?: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <div className="relative">
        <select
          aria-label={label}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
            className,
          )}
          defaultValue={options[0]}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
      </div>
    </label>
  );
}
