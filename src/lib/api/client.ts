import "server-only";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { parseApiError } from "@/lib/errors";
import { getAccessToken } from "@/lib/session/cookies";

interface ApiOptions extends Omit<RequestInit, "body" | "headers"> {
  body?: unknown;
  headers?: Record<string, string>;
  schema?: z.ZodType;
  timeoutMs?: number;
}

import type { z } from "zod";

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = getAccessToken(cookieStore);
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 15_000,
  );

  try {
    const response = await fetch(`${env.API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      signal: options.signal ?? controller.signal,
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    const body: unknown = await response.json().catch(() => null);
    if (!options.schema) return body as T;

    const parsed = options.schema.safeParse(body);
    if (!parsed.success) {
      throw new Error("Backend response failed validation");
    }
    return parsed.data as T;
  } finally {
    clearTimeout(timeout);
  }
}
