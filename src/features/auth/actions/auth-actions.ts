"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { API_ENDPOINTS } from "@/config/constants";
import { apiFetch } from "@/lib/api/client";
import { getTokenExpiry } from "@/lib/session/jwt";
import {
  accessCookieOptions,
  refreshCookieOptions,
} from "@/lib/session/cookies";
import { env } from "@/config/env";
import { sanitizeNextPath } from "@/lib/utils";
import { login, register, getCurrentUser } from "@/features/auth/api/auth-api";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@/features/auth/schemas/auth";

async function setSessionCookies(accessToken: string, refreshToken: string) {
  const exp = getTokenExpiry(accessToken);
  const accessMaxAge = exp
    ? Math.max(1, exp - Math.floor(Date.now() / 1000))
    : 300;
  const store = await cookies();
  store.set(
    env.ACCESS_COOKIE_NAME,
    accessToken,
    accessCookieOptions(accessMaxAge),
  );
  store.set(env.REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
}

export async function loginAction(input: z.infer<typeof loginSchema>) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  const next = sanitizeNextPath(parsed.data.next);
  try {
    const tokens = await login({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    await setSessionCookies(tokens.accessToken, tokens.refreshToken);
  } catch (error) {
    if (error instanceof Error)
      return { ok: false as const, message: error.message };
    return { ok: false as const, message: "Login failed" };
  }
  redirect(next);
}

export async function registerAction(input: z.infer<typeof registerSchema>) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  try {
    const tokens = await register(parsed.data);
    await setSessionCookies(tokens.accessToken, tokens.refreshToken);
  } catch (error) {
    if (error instanceof Error)
      return { ok: false as const, message: error.message };
    return { ok: false as const, message: "Registration failed" };
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  try {
    await apiFetch(API_ENDPOINTS.logout, { method: "POST" });
  } catch {
    // Logout is best-effort; local cookies must still be cleared.
  }
  const store = await cookies();
  store.delete(env.ACCESS_COOKIE_NAME);
  store.delete(env.REFRESH_COOKIE_NAME);
  redirect("/login");
}

export async function forgotPasswordAction(
  input: z.infer<typeof forgotPasswordSchema>,
) {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  await apiFetch(API_ENDPOINTS.forgotPassword, {
    method: "POST",
    body: parsed.data,
  });
  return { ok: true as const };
}

export async function resetPasswordAction(
  input: z.infer<typeof resetPasswordSchema>,
) {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  await apiFetch(API_ENDPOINTS.resetPassword, {
    method: "POST",
    body: parsed.data,
  });
  return { ok: true as const };
}

export async function verifyEmailAction(
  input: z.infer<typeof verifyEmailSchema>,
) {
  const parsed = verifyEmailSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  await apiFetch(API_ENDPOINTS.verifyEmail, {
    method: "POST",
    body: parsed.data,
  });
  return { ok: true as const };
}

export async function getCurrentUserAction() {
  return getCurrentUser();
}
