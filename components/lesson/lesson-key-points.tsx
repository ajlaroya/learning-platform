import { CheckCircle2, Lightbulb } from "lucide-react";

export function LessonKeyPoints({
  keyPoints,
  proTip,
}: {
  keyPoints: string[] | null;
  proTip: string | null;
}) {
  if (!keyPoints?.length && !proTip) return null;

  return (
    <div className="space-y-5 border-t border-canvas-line pt-5">
      {keyPoints && keyPoints.length > 0 && (
        <section aria-labelledby="lesson-key-points-title">
          <h2
            id="lesson-key-points-title"
            className="text-sm font-semibold text-neutral-900"
          >
            In this lesson you will:
          </h2>
          <ul className="mt-3 space-y-2.5">
            {keyPoints.map((point, index) => (
              <li
                key={`${point}-${index}`}
                className="flex items-start gap-3 text-sm leading-6 text-neutral-700"
              >
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary-500"
                  aria-hidden="true"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {proTip && (
        <aside className="flex gap-3 rounded-lg border border-primary-100 bg-primary-100/50 p-4 sm:p-5">
          <Lightbulb
            className="mt-0.5 h-5 w-5 shrink-0 text-primary-500"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-display text-base font-semibold text-neutral-900">
              Pro Tip
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-neutral-600 sm:text-sm sm:leading-6">
              {proTip}
            </p>
          </div>
        </aside>
      )}
    </div>
  );
}
