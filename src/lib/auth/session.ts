import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppError } from "@/lib/errors";
import { getAccessToken } from "@/lib/session/cookies";
import { verifyAccessToken, type Role } from "@/lib/session/jwt";

export interface SessionUser {
  id: string;
  role: Role;
  exp: number;
  email?: string;
  name?: string;
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = getAccessToken(cookieStore);
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  if (!payload) return null;
  return {
    id: payload.sub,
    role: payload.role,
    exp: payload.exp,
  };
});

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(role: Role | Role[]): Promise<SessionUser> {
  const session = await requireUser();
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(session.role)) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }
  return session;
}

export function can(
  user: SessionUser,
  permission: "manage:users" | "view:dashboard",
): boolean {
  if (permission === "view:dashboard") return true;
  return user.role === "admin";
}
