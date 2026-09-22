import "server-only";

import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";
import { sanityReadToken } from "./token";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: sanityReadToken,
  useCdn: false,
  perspective: "published",
});
