import { CheckCircle2, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusVariant =
  | "in-progress"
  | "completed"
  | "now-playing"
  | "locked";

const itemClass =
  "inline-flex items-center gap-2 text-sm font-medium text-neutral-700";

export function StatusIndicator({
  variant,
  className,
  label,
}: {
  variant: StatusVariant;
  className?: string;
  label?: string;
}) {
  const labelText = label ?? variant;

  return (
    <span className={cn(itemClass, className)}>
      {variant === "in-progress" && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary-500 border-t-transparent">
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary-500"
            aria-hidden="true"
          />
        </span>
      )}
      {variant === "completed" && (
        <CheckCircle2 className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />
      )}
      {variant === "now-playing" && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-white">
          <Play className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
        </span>
      )}
      {variant === "locked" && (
        <Lock className="h-4 w-4 text-neutral-500" aria-hidden="true" />
      )}
      <span>{labelText}</span>
    </span>
  );
}
