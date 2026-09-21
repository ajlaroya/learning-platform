import "server-only";

const runtimeEnv =
  (
    (globalThis as Record<string, unknown>)["process"] as
      { env?: Record<string, string | undefined> } | undefined
  )?.env ?? {};

export const sanityReadToken = assertValue(
  runtimeEnv.SANITY_API_READ_TOKEN,
  "Missing environment variable: SANITY_API_READ_TOKEN",
);

function assertValue<T>(value: T | undefined, errorMessage: string): T {
  if (value === undefined) throw new Error(errorMessage);
  return value;
}
