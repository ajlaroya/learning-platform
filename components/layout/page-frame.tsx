import { cn } from "@/lib/utils";

export function PageFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-canvas bg-[repeating-linear-gradient(135deg,transparent_0,transparent_10px,rgba(240,231,224,0.7)_10px,rgba(240,231,224,0.7)_11px)] px-0 sm:px-4 lg:px-8">
      <div
        className={cn(
          "mx-auto min-h-screen w-full max-w-360 border-x border-canvas-line bg-canvas",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
