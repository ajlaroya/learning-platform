import "server-only";

import { createMCPClient } from "@ai-sdk/mcp";

const INITIAL_CONTEXT_TTL = 5 * 60 * 1000;
let cachedInitialContext:
  { expiresAt: number; value: Promise<string> } | undefined;

function getContextUrl() {
  const value = process.env.SANITY_CONTEXT_MCP_URL;
  if (!value) throw new Error("SANITY_CONTEXT_MCP_URL is not configured");

  const url = new URL(value);
  if (url.protocol !== "https:") {
    throw new Error("Sanity Context MCP URL must use HTTPS");
  }
  return url;
}

export async function fetchInitialContext() {
  if (cachedInitialContext && cachedInitialContext.expiresAt > Date.now()) {
    return cachedInitialContext.value;
  }

  const readToken = process.env.SANITY_API_READ_TOKEN;
  if (!readToken) throw new Error("SANITY_API_READ_TOKEN is not configured");

  const url = getContextUrl();
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/initial-context`;

  const value = fetch(url, {
    headers: { Authorization: `Bearer ${readToken}` },
    cache: "no-store",
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(
        `Sanity Context initial-context failed (${response.status})`,
      );
    }
    return response.text();
  });

  cachedInitialContext = { expiresAt: Date.now() + INITIAL_CONTEXT_TTL, value };
  try {
    return await value;
  } catch (error) {
    cachedInitialContext = undefined;
    throw error;
  }
}

export async function createSearchMcpClient() {
  const readToken = process.env.SANITY_API_READ_TOKEN;
  if (!readToken) throw new Error("SANITY_API_READ_TOKEN is not configured");

  return createMCPClient({
    transport: {
      type: "http",
      url: getContextUrl().toString(),
      headers: { Authorization: `Bearer ${readToken}` },
    },
  });
}
