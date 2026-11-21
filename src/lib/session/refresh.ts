import "server-only";
import { z } from "zod";
import { env } from "@/config/env";
import { API_ENDPOINTS } from "@/config/constants";
import { parseApiError } from "@/lib/errors";

const refreshSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
});

const inFlight = new Map<string, Promise<z.infer<typeof refreshSchema>>>();

export async function refreshSession(refreshToken: string) {
  const existing = inFlight.get(refreshToken);
  if (existing) return existing;

  const promise = (async () => {
    const response = await fetch(
      `${env.API_BASE_URL}${API_ENDPOINTS.refresh}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      },
    );
    if (!response.ok) throw await parseApiError(response);
    const parsed = refreshSchema.safeParse(await response.json());
    if (!parsed.success) throw new Error("Invalid refresh response");
    return parsed.data;
  })();

  inFlight.set(refreshToken, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(refreshToken);
  }
}
