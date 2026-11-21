import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { z } from "zod";
import { TEST_SIGNING_SECRET } from "@/mocks/test-key";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function issueTokens(role: "user" | "admin" = "user", sub = "test-user") {
  const secret = new TextEncoder().encode(TEST_SIGNING_SECRET);
  const accessToken = await new SignJWT({ role, sub })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuer("next-toolkit-tests")
    .setAudience("next-toolkit-app")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secret);
  const refreshToken = await new SignJWT({ role, sub, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuer("next-toolkit-tests")
    .setAudience("next-toolkit-app")
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  return { accessToken, refreshToken };
}

async function handle(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const route = `/${path.join("/")}`;
  if (route === "/health") return NextResponse.json({ status: "ok" });

  if (route === "/auth/login" && request.method === "POST") {
    const parsed = credentialsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid credentials",
          errors: { email: ["Enter a valid email"] },
        },
        { status: 422 },
      );
    }
    return NextResponse.json(
      await issueTokens(
        parsed.data.email.includes("admin") ? "admin" : "user",
        parsed.data.email,
      ),
    );
  }
  if (route === "/auth/register" && request.method === "POST") {
    const parsed = z
      .object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(8),
      })
      .safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        {
          message: "Invalid registration",
          errors: { email: ["Enter a valid email"] },
        },
        { status: 422 },
      );
    return NextResponse.json(await issueTokens("user", parsed.data.email), {
      status: 201,
    });
  }
  if (route === "/auth/refresh" && request.method === "POST") {
    const body = z
      .object({ refreshToken: z.string().min(1) })
      .safeParse(await request.json());
    if (!body.success)
      return NextResponse.json(
        { message: "Refresh token required" },
        { status: 401 },
      );
    return NextResponse.json(await issueTokens());
  }
  if (route === "/auth/logout" && request.method === "POST")
    return NextResponse.json({ ok: true });
  if (
    [
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/verify-email",
    ].includes(route) &&
    request.method === "POST"
  ) {
    return NextResponse.json({ ok: true });
  }
  if (route === "/me" && request.method === "GET") {
    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer "))
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    return NextResponse.json({
      id: "test-user",
      email: "demo@example.com",
      name: "Demo User",
      role: "user",
    });
  }
  return NextResponse.json({ message: "Not found" }, { status: 404 });
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
};
