import type { ReactNode } from "react";
import type { Role } from "@/lib/session/jwt";

export function RoleGate({
  role,
  allowed,
  children,
  fallback = null,
}: {
  role: Role;
  allowed: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return allowed.includes(role) ? children : fallback;
}
