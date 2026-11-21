export const routes = {
  public: [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ],
  protected: ["/dashboard"],
  auth: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ],
} as const;

export function isPublicRoute(pathname: string): boolean {
  return routes.public.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isProtectedRoute(pathname: string): boolean {
  return routes.protected.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isAuthRoute(pathname: string): boolean {
  return routes.auth.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
