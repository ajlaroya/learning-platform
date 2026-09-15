import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function LessonCard({
  className,
  title,
  description,
  moduleLabel,
}: {
  className?: string;
  title: string;
  description: string;
  moduleLabel: string;
}) {
  return (
    <Card className={cn("flex h-full flex-col gap-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <Badge variant="lesson">Lesson</Badge>
        <ExternalLink className="h-4 w-4 text-neutral-400" />
      </div>
      <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-neutral-900">
        {title}
      </h3>
      <p className="text-sm leading-6 text-neutral-600">{description}</p>
      <div className="mt-auto flex items-center justify-between pt-3 text-sm text-neutral-500">
        <span>{moduleLabel}</span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500"
        >
          View lesson <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
