import Link from "next/link";
import { Bell } from "lucide-react";
import { VertexLogo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";

export function SiteHeader() {
  return (
    <header className="flex h-24 items-center justify-between border-b border-canvas-line px-6 sm:px-10">
      <div className="flex items-center gap-10">
        <Link href="/" aria-label="Vertex home">
          <VertexLogo />
        </Link>
        <nav
          className="flex items-center gap-8 text-sm text-neutral-900"
          aria-label="Main navigation"
        >
          <Link
            href="/courses"
            className="hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            Courses
          </Link>
          <Link
            href="/my-learning"
            className="hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            My Learning
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-5">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-full p-2 text-neutral-700 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <Bell className="h-5 w-5" />
        </button>
        <Avatar name="Arthur Laroya" />
      </div>
    </header>
  );
}
