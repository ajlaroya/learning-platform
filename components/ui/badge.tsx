import { cn } from "@/lib/utils";

export type BadgeVariant = "video" | "lesson" | "popular";

const styles: Record<BadgeVariant, string> = {
  video: "bg-primary-100 text-primary-500",
  lesson: "bg-[#EEF0FE] text-[#4F46E5]",
  popular: "bg-primary-100 text-primary-500",
};

export function Badge({
  variant,
  className,
  children,
}: {
  variant: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
