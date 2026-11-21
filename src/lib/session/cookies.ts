import "server-only";
import type { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { env } from "@/config/env";

type CookieStore = RequestCookies | ReadonlyRequestCookies;

export function accessCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

export function refreshCookieOptions(maxAge = env.REFRESH_COOKIE_MAX_AGE) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/api/auth",
    maxAge,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

export function getAccessToken(store: CookieStore): string | undefined {
  return store.get(env.ACCESS_COOKIE_NAME)?.value;
}

export function getRefreshToken(store: CookieStore): string | undefined {
  return store.get(env.REFRESH_COOKIE_NAME)?.value;
}
