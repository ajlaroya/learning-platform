import Link from "next/link";
import { VertexLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export function Navbar({ className }: { className?: string }) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between border-b border-neutral-200 py-4",
        className,
      )}
    >
      <VertexLogo />
      <div className="flex items-center gap-8 text-sm font-medium text-neutral-500">
        <Link href="#" className="text-primary-500">
          Courses
        </Link>
        <Link href="#" className="text-neutral-900">
          My Learning
        </Link>
      </div>
    </nav>
  );
}
