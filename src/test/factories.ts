export function createUser(
  overrides: Partial<{
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
  }> = {},
) {
  return {
    id: overrides.id ?? "test-user",
    email: overrides.email ?? "demo@example.com",
    name: overrides.name ?? "Demo User",
    role: overrides.role ?? ("user" as const),
  };
}
