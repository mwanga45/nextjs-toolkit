import { http, HttpResponse } from "msw";
import { SignJWT } from "jose";
import { TEST_SIGNING_SECRET } from "./test-key";

async function tokens() {
  const secret = new TextEncoder().encode(TEST_SIGNING_SECRET);
  const accessToken = await new SignJWT({ sub: "test-user", role: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("next-toolkit-tests")
    .setAudience("next-toolkit-app")
    .setExpirationTime("5m")
    .sign(secret);
  const refreshToken = await new SignJWT({ sub: "test-user", type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("next-toolkit-tests")
    .setAudience("next-toolkit-app")
    .setExpirationTime("7d")
    .sign(secret);
  return { accessToken, refreshToken };
}

export const handlers = [
  http.post("*/auth/login", async () => HttpResponse.json(await tokens())),
  http.post("*/auth/register", async () =>
    HttpResponse.json(await tokens(), { status: 201 }),
  ),
  http.post("*/auth/refresh", async () => HttpResponse.json(await tokens())),
  http.post("*/auth/logout", () => HttpResponse.json({ ok: true })),
  http.post("*/auth/forgot-password", () => HttpResponse.json({ ok: true })),
  http.post("*/auth/reset-password", () => HttpResponse.json({ ok: true })),
  http.post("*/auth/verify-email", () => HttpResponse.json({ ok: true })),
  http.get("*/me", ({ request }) =>
    request.headers.get("authorization")
      ? HttpResponse.json({
          id: "test-user",
          email: "demo@example.com",
          name: "Demo User",
          role: "user",
        })
      : HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
  ),
];
