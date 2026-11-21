import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";
import { env } from "@/config/env";
import { isAuthRoute, isProtectedRoute } from "@/config/routes";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(env.ACCESS_COOKIE_NAME)?.value;
  let exp: number | undefined;
  if (accessToken) {
    try {
      exp = decodeJwt(accessToken).exp;
    } catch {
      exp = undefined;
    }
  }

  const now = Math.floor(Date.now() / 1000);
  const needsRefresh = !exp || exp <= now + env.AUTH_REFRESH_LEEWAY_SECONDS;

  if (isProtectedRoute(pathname)) {
    if (!accessToken || needsRefresh) {
      if (request.nextUrl.searchParams.get("refreshAttempt") === "1") {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      refreshUrl.searchParams.set(
        "next",
        `${pathname}${request.nextUrl.search}`,
      );
      refreshUrl.searchParams.set("refreshAttempt", "1");
      return NextResponse.redirect(refreshUrl);
    }
  }

  if (accessToken && exp && exp > now && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ],
};
