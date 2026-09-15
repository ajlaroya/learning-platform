import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-center justify-between text-sm text-neutral-700">
        <span>{label ?? `${clamped}% complete`}</span>
        <span>{clamped}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-neutral-100"
      >
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
