import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { getAccessToken } from "@/lib/session/cookies";

async function forward(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const origin = request.headers.get("origin");
  if (origin) {
    const appUrl = new URL(env.NEXT_PUBLIC_APP_URL);
    if (origin !== appUrl.origin)
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const host = request.headers.get("host");
  if (request.method !== "GET" && host) {
    const appUrl = new URL(env.NEXT_PUBLIC_APP_URL);
    if (host !== appUrl.host)
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { path } = await context.params;
  const store = await cookies();
  const token = getAccessToken(store);
  const url = `${env.API_BASE_URL}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const response = await fetch(url, {
    method: request.method,
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.text(),
    cache: "no-store",
  });
  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ?? "application/json",
    },
  });
}

export {
  forward as GET,
  forward as POST,
  forward as PUT,
  forward as PATCH,
  forward as DELETE,
};
