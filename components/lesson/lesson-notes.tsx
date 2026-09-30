import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { LESSON_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

type Lesson = NonNullable<LESSON_BY_SLUG_QUERY_RESULT>;
type Notes = NonNullable<Lesson["notes"]>;

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-sm leading-7 text-neutral-600">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="font-display text-xl font-semibold text-neutral-900">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display text-lg font-semibold text-neutral-900">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-semibold text-neutral-900">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-primary-500 pl-4 text-neutral-600">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc space-y-1 pl-5 text-sm leading-7 text-neutral-600">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal space-y-1 pl-5 text-sm leading-7 text-neutral-600">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-neutral-900">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9em] text-neutral-900">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const href = value?.href ?? "";
      const isSafe = href.startsWith("https://") || href.startsWith("/");
      return isSafe ? (
        <a
          href={href}
          rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}
          className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700"
        >
          {children}
        </a>
      ) : (
        <>{children}</>
      );
    },
  },
};

export function LessonNotes({ notes }: { notes: Notes | null }) {
  if (!notes || notes.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-neutral-900">
        Overview
      </h2>
      <div className="space-y-4">
        <PortableText value={notes} components={components} />
      </div>
    </section>
  );
}
