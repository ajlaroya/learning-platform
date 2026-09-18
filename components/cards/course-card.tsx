import { BookOpen, Clock3, Layers3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CourseCard({
  className,
  title,
  description,
  level,
  duration,
  modules,
  layout = "row",
  mark,
}: {
  className?: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: string;
  layout?: "row" | "stacked";
  mark?: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col gap-4",
        layout === "stacked" && "rounded-xl p-6",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-neutral-900 text-xl font-bold text-white",
          layout === "stacked" ? "h-18 w-18" : "h-12 w-12",
        )}
      >
        {mark ?? "N"}
      </div>
      <div>
        <h3
          className={cn(
            "tracking-[-0.02em] text-neutral-900",
            layout === "stacked"
              ? "font-display text-[21px] font-bold"
              : "text-[16px] font-semibold",
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "mt-2 text-neutral-600",
            layout === "stacked"
              ? "text-[13px] leading-6"
              : "text-sm leading-6",
          )}
        >
          {description}
        </p>
      </div>
      <div
        className={cn(
          "mt-auto flex flex-wrap text-neutral-500",
          layout === "stacked"
            ? "gap-3 border-t border-canvas-line pt-4 text-[10px]"
            : "gap-4 pt-3 text-xs",
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" /> {level}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" /> {duration}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Layers3 className="h-3.5 w-3.5" /> {modules}
        </span>
      </div>
    </Card>
  );
}
