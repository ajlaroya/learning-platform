import {
  ArrowUpRight,
  Bell,
  Bookmark,
  CheckCircle2,
  Clock3,
  Compass,
  FileText,
  Folder,
  Grid2x2,
  Lock,
  MousePointer2,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Wand2,
} from "lucide-react";
import { Button, TextButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { CourseCard } from "@/components/cards/course-card";
import { LessonVideoCard } from "@/components/cards/lesson-video-card";
import { LessonCard } from "@/components/cards/lesson-card";
import { ResourceCard } from "@/components/cards/resource-card";
import { Navbar } from "@/components/nav/navbar";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { Pagination } from "@/components/nav/pagination";
import { VertexLogo } from "@/components/brand/logo";

const typeRows = [
  ["Display 1", "Playfair Display", "48 / 56", "Bold", "Page titles"],
  ["Display 2", "Playfair Display", "36 / 44", "Bold", "Section titles"],
  ["Heading 1", "Inter", "28 / 36", "Semi Bold", "Card titles"],
  ["Heading 2", "Inter", "22 / 30", "Semi Bold", "Sub section titles"],
  ["Heading 3", "Inter", "18 / 26", "Medium", "Small titles"],
  ["Body Large", "Inter", "16 / 24", "Regular", "Body copy"],
  ["Body", "Inter", "14 / 20", "Regular", "Supporting text"],
  ["Small", "Inter", "12 / 16", "Regular", "Captions, meta"],
];

const spacingValues = [4, 8, 12, 16, 24, 32, 40, 48, 64];

const radiusCards = [
  { label: "xs", value: "4px" },
  { label: "sm", value: "8px" },
  { label: "md", value: "12px" },
  { label: "lg", value: "16px" },
  { label: "xl", value: "24px" },
  { label: "full", value: "9999px" },
];

const principleItems = [
  {
    icon: Sparkles,
    title: "Clarity First",
    text: "Every element should be immediately understandable and visually consistent.",
  },
  {
    icon: CheckCircle2,
    title: "Consistency",
    text: "We reuse patterns so the platform feels predictable from page to page.",
  },
  {
    icon: Compass,
    title: "Focus & Calm",
    text: "Remove noise and keep attention on the learning experience itself.",
  },
  {
    icon: ShieldCheck,
    title: "Accessible by default",
    text: "Strong contrast and clear affordances support all learners from the start.",
  },
];

const sectionHeader = (number: string, title: string) => (
  <div className="mb-6 flex items-center gap-3">
    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-900">
      {number}
    </span>
    <h2 className="text-[18px] font-semibold uppercase tracking-[0.08em] text-neutral-900">
      {title}
    </h2>
  </div>
);

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[#f5f3f0] p-8 text-neutral-900">
      <div className="mx-auto max-w-7xl rounded-[20px] bg-[#f8f7f4] p-8 shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
        <div className="space-y-6">
          <section className="pb-8">
            <div className="mb-6 flex items-center justify-between">
              <VertexLogo className="gap-2" />
              <div className="flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">
                <span>Colors</span>
              </div>
            </div>

            <div className="flex items-start justify-between gap-6">
              <div className="text-display-1">Design System</div>
              <div className="max-w-130 text-lg leading-7 text-neutral-700">
                A unified design language for Vertex learning platform. Clean,
                modern and focused on clarity, consistency and intuitive
                learning experiences.
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              <span>VERSION 1.0</span>
              <span>•</span>
              <span>May 2025</span>
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-6">
              {sectionHeader("01", "Colors")}
              <div className="grid grid-cols-5 gap-4">
                {[
                  {
                    name: "Primary 500",
                    hex: "#F97316",
                    color: "bg-primary-500",
                  },
                  {
                    name: "Primary 400",
                    hex: "#FB923C",
                    color: "bg-primary-400",
                  },
                  {
                    name: "Primary 300",
                    hex: "#FDBA74",
                    color: "bg-primary-300",
                  },
                  {
                    name: "Primary 200",
                    hex: "#FED7AA",
                    color: "bg-primary-200",
                  },
                  {
                    name: "Primary 100",
                    hex: "#FFEEE5",
                    color: "bg-primary-100",
                  },
                ].map((swatch) => (
                  <div key={swatch.name} className="space-y-2">
                    <div className={`h-16 rounded-md ${swatch.color}`} />
                    <div className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                      {swatch.name}
                    </div>
                    <div className="text-[11px] text-neutral-700">
                      {swatch.hex}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              {sectionHeader("02", "Typography")}
              <div className="space-y-3">
                <div className="text-display-2">Ag</div>
                <div className="text-[28px] font-medium italic text-neutral-900">
                  Inter
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-6">
              {sectionHeader("02", "Typography")}
              <div className="space-y-8">
                <div className="text-display-1">Ag</div>
                <div className="text-display-2">Ag</div>
              </div>
            </section>

            <section className="space-y-6">
              {sectionHeader("03", "Type Scale")}
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                    <tr>
                      <th className="px-4 py-3">Style</th>
                      <th className="px-4 py-3">Font</th>
                      <th className="px-4 py-3">Size / Line Height</th>
                      <th className="px-4 py-3">Weight</th>
                      <th className="px-4 py-3">Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeRows.map((row) => (
                      <tr key={row[0]} className="border-t border-neutral-200">
                        {row.map((cell) => (
                          <td
                            key={`${row[0]}-${cell}`}
                            className="px-4 py-3 text-neutral-700"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-6">
              {sectionHeader("04", "Spacing System")}
              <div className="space-y-3">
                <div className="mb-3 text-sm text-neutral-700">
                  Base unit: 4px
                </div>
                <div className="flex items-end gap-3">
                  {spacingValues.map((value) => (
                    <div
                      key={value}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className="flex h-16 w-8 items-end justify-center rounded-md bg-primary-100 shadow-sm"
                        style={{
                          width: value === 4 ? 20 : 32,
                          height: value * 1.25,
                        }}
                      />
                      <div className="text-[11px] text-neutral-500">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-6">
              {sectionHeader("05", "Radius & Shadows")}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {radiusCards.map((item) => (
                    <div key={item.label} className="space-y-2 text-center">
                      <div
                        className="h-12 w-12 border border-neutral-200 bg-white"
                        style={{ borderRadius: item.value }}
                      />
                      <div className="text-[11px] uppercase text-neutral-500">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { label: "Sm", value: "0 1px 2px 0 rgba(15,23,42,0.05)" },
                    {
                      label: "Md",
                      value: "0 4px 12px -2px rgba(15,23,42,0.08)",
                    },
                    {
                      label: "Lg",
                      value: "0 12px 24px -4px rgba(15,23,42,0.10)",
                    },
                    {
                      label: "Xl",
                      value: "0 20px 40px -8px rgba(15,23,42,0.12)",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm"
                    >
                      <div className="mb-3 text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                        {item.label}
                      </div>
                      <div
                        className="h-16 rounded-xl border border-neutral-200 bg-neutral-50"
                        style={{ boxShadow: item.value }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-6">
              {sectionHeader("06", "Icons")}
              <div className="grid gap-4">
                <div className="flex items-center gap-4 text-neutral-900">
                  {[
                    Bell,
                    Search,
                    Play,
                    FileText,
                    Bookmark,
                    TrendingUp,
                    Clock3,
                    User,
                  ].map((Icon, index) => (
                    <div
                      key={index}
                      className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 bg-white"
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-neutral-900">
                  {[
                    CheckCircle2,
                    Lock,
                    Folder,
                    Grid2x2,
                    MousePointer2,
                    Wand2,
                    ArrowUpRight,
                    ShieldCheck,
                  ].map((Icon, index) => (
                    <div
                      key={index}
                      className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 bg-white"
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  ))}
                </div>
              </div>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li>• Outline style, 24x24 grid</li>
                <li>• Rounded line caps and minimal detail</li>
                <li>• 2px stroke, consistent spacing</li>
                <li>• Filled style available for emphasis</li>
              </ul>
            </section>

            <section className="space-y-6">
              {sectionHeader("07", "Buttons")}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button>Default</Button>
                  <Button variant="secondary">Get Started</Button>
                  <Button variant="tertiary">Explore Courses</Button>
                  <TextButton>Watch Video</TextButton>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button className="bg-primary-600">Hover</Button>
                  <Button variant="secondary" className="bg-primary-100">
                    Hover
                  </Button>
                  <Button variant="tertiary" className="bg-neutral-50">
                    Hover
                  </Button>
                  <TextButton className="text-primary-600">
                    Watch Video
                  </TextButton>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button disabled>Disabled</Button>
                  <Button variant="secondary" disabled>
                    Disabled
                  </Button>
                  <Button variant="tertiary" disabled>
                    Disabled
                  </Button>
                  <TextButton disabled>Disabled</TextButton>
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-6">
              {sectionHeader("08", "Inputs")}
              <div className="space-y-4">
                <SearchInput />
                <Select
                  label="Sort"
                  options={["Most Relevant", "Newest", "Popular"]}
                />
              </div>
            </section>

            <section className="space-y-6">
              {sectionHeader("09", "Badges")}
              <div className="flex flex-wrap gap-3">
                <Badge variant="video">VIDEO</Badge>
                <Badge variant="lesson">LESSON</Badge>
                <Badge variant="popular">POPULAR</Badge>
              </div>
            </section>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-6">
              {sectionHeader("10", "Status")}
              <div className="flex flex-wrap gap-6">
                <StatusIndicator variant="in-progress" label="In Progress" />
                <StatusIndicator variant="completed" label="Completed" />
                <StatusIndicator variant="now-playing" label="Now Playing" />
                <StatusIndicator variant="locked" label="Locked" />
              </div>
            </section>

            <section className="space-y-6">
              {sectionHeader("11", "Progress Bar")}
              <div className="max-w-sm">
                <ProgressBar value={35} label="Course progress" />
              </div>
            </section>
          </div>

          <section className="space-y-6">
            {sectionHeader("12", "Cards")}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <CourseCard
                title="Next.js for Production"
                description="Build scalable, high-performance web apps with Next.js."
                level="Intermediate"
                duration="8h 30m"
                modules="12 modules"
              />
              <LessonVideoCard
                title="Data Fetching in Server Components"
                description="Learn how to fetch data in the server using Next.js and React patterns."
                detail="Lesson 5.1"
                time="12:45"
              />
              <LessonCard
                title="Data Fetching & Caching"
                description="Explore different data fetching methods and validation strategies while building real apps."
                moduleLabel="Module 5"
              />
              <ResourceCard
                title="Caching and Validation Guide"
                description="Deep dive into Next.js caching strategies and validation patterns."
                detail="PDF · 1.2 MB"
              />
            </div>
          </section>

          <section className="space-y-6">
            {sectionHeader("13", "Navigation")}
            <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-4">
              <Navbar />
              <div className="flex items-center justify-between gap-4">
                <Breadcrumbs
                  items={[
                    { label: "All Courses" },
                    { label: "Next.js for Production", current: true },
                  ]}
                />
                <Pagination current={2} total={5} />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            {sectionHeader("14", "Principles")}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {principleItems.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-[18px] font-semibold tracking-[-0.02em] text-neutral-900">
                    {title}
                  </h3>
                  <p className="text-sm leading-6 text-neutral-600">{text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
