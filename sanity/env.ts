const runtimeEnv =
  (
    (globalThis as Record<string, unknown>)["process"] as
      { env?: Record<string, string | undefined> } | undefined
  )?.env ?? {};

export const apiVersion =
  runtimeEnv.NEXT_PUBLIC_SANITY_API_VERSION || "2026-09-21";

export const dataset = assertValue(
  runtimeEnv.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET",
);
export const projectId = assertValue(
  runtimeEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID",
);

function assertValue<T>(value: T | undefined, errorMessage: string): T {
  if (value === undefined) throw new Error(errorMessage);
  return value;
}
