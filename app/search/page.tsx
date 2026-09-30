import type { Metadata } from "next";
import { Suspense } from "react";
import { PageFrame } from "@/components/layout/page-frame";
import { SiteHeader } from "@/components/layout/site-header";
import { SearchForm } from "@/components/search/search-form";
import {
  SearchResults,
  SearchResultsFallback,
} from "@/components/search/search-results";

export const metadata: Metadata = {
  title: "Search | Vertex",
  description: "Find relevant lessons and video moments across Vertex courses.",
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[]; sort?: string | string[] }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const query = rawQuery.trim().slice(0, 200);

  return (
    <PageFrame>
      <SiteHeader />
      <main className="px-5 pb-12 pt-8 sm:px-10 sm:pt-12">
        <header className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <span className="rounded-lg border border-primary-200 bg-primary-100/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-500">
            Search results
          </span>
          <h1 className="mt-5 font-display text-[32px] font-bold leading-tight text-neutral-900 sm:text-[42px]">
            {query ? (
              <>
                Results for <span className="text-primary-500">“{query}”</span>
              </>
            ) : (
              "Search your learning"
            )}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
            {query
              ? "Explore lessons and moments that match what you want to learn."
              : "Find the right course or lesson with a plain-language search."}
          </p>
          <SearchForm initialQuery={query} className="mt-7 w-full max-w-3xl" />
        </header>

        <section className="mx-auto mt-9 max-w-5xl" aria-label="Search results">
          <Suspense fallback={<SearchResultsFallback />}>
            <SearchResults />
          </Suspense>
        </section>
      </main>
    </PageFrame>
  );
}
