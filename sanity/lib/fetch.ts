import { client } from "./client";

type SanityFetchOptions<QueryParams extends Record<string, unknown>> = {
  query: string;
  params?: QueryParams;
  tags?: string[];
  revalidate?: number | false;
};

export async function sanityFetch<
  QueryResult,
  QueryParams extends Record<string, unknown> = Record<string, never>,
>({
  query,
  params,
  tags = [],
  revalidate = tags.length > 0 ? false : 3600,
}: SanityFetchOptions<QueryParams>): Promise<QueryResult> {
  return client.fetch<QueryResult>(query, params ?? ({} as QueryParams), {
    next: { tags, revalidate },
  });
}
