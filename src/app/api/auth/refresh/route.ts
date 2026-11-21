import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { sanitizeNextPath } from "@/lib/utils";
import { getTokenExpiry } from "@/lib/session/jwt";
import { refreshSession } from "@/lib/session/refresh";
import {
  accessCookieOptions,
  refreshCookieOptions,
} from "@/lib/session/cookies";

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get(env.REFRESH_COOKIE_NAME)?.value;
  const next = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  if (!refreshToken) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(next)}`, request.url),
    );
  }

  try {
    const tokens = await refreshSession(refreshToken);
    const exp = getTokenExpiry(tokens.accessToken);
    const accessMaxAge = exp
      ? Math.max(1, exp - Math.floor(Date.now() / 1000))
      : 300;
    const response = NextResponse.redirect(new URL(next, request.url));
    response.cookies.set(
      env.ACCESS_COOKIE_NAME,
      tokens.accessToken,
      accessCookieOptions(accessMaxAge),
    );
    response.cookies.set(
      env.REFRESH_COOKIE_NAME,
      tokens.refreshToken ?? refreshToken,
      refreshCookieOptions(),
    );
    return response;
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", next);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(env.ACCESS_COOKIE_NAME);
    response.cookies.delete(env.REFRESH_COOKIE_NAME);
    return response;
  }
}
