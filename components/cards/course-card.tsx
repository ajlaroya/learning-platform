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
}: {
  className?: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: string;
}) {
  return (
    <Card className={cn("flex h-full flex-col gap-4", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-xl font-bold text-white">
        N
      </div>
      <div>
        <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-neutral-900">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
      </div>
      <div className="mt-auto flex flex-wrap gap-4 pt-3 text-xs text-neutral-500">
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
