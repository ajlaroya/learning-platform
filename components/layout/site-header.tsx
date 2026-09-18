import Link from "next/link";
import { Bell } from "lucide-react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { VertexLogo } from "@/components/brand/logo";

export function SiteHeader() {
  return (
    <header className="flex h-24 items-center justify-between border-b border-canvas-line px-6 sm:px-10">
      <div className="flex items-center gap-10">
        <Link href="/" aria-label="Vertex home">
          <VertexLogo />
        </Link>
        <nav
          className="hidden items-center gap-8 text-sm text-neutral-900 sm:flex"
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
        <Show when="signed-out">
          <div className="flex items-center gap-1 text-xs font-medium sm:gap-4 sm:text-sm">
            <SignInButton mode="modal">
              <button type="button" className="rounded-lg px-2 py-2 text-neutral-700 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:px-3">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button" className="rounded-lg bg-primary-500 px-3 py-2 text-white shadow-sm hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 sm:px-4">
                Sign up
              </button>
            </SignUpButton>
          </div>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
