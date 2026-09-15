import { ArrowUpRight, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ResourceCard({
  className,
  title,
  description,
  detail,
}: {
  className?: string;
  title: string;
  description: string;
  detail: string;
}) {
  return (
    <Card className={cn("flex h-full flex-col gap-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
          <FileText className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-neutral-400" />
      </div>
      <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-neutral-900">
        {title}
      </h3>
      <p className="text-sm leading-6 text-neutral-600">{description}</p>
      <div className="mt-auto flex items-center justify-between pt-3 text-sm text-neutral-500">
        <span>{detail}</span>
        <span className="text-neutral-400" aria-hidden="true">
          ↗
        </span>
      </div>
    </Card>
  );
}
