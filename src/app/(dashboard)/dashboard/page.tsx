import { requireUser, can } from "@/lib/auth/session";
import { RoleGate } from "@/components/shared/role-gate";

export default async function DashboardPage() {
  const user = await requireUser();
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Signed in as <strong>{user.id}</strong> ({user.role})
      </p>
      <RoleGate role={user.role} allowed={["admin"]}>
        {can(user, "manage:users") ? (
          <section className="mt-8 rounded-lg border bg-white p-6">
            <h2 className="font-semibold">Administrator tools</h2>
            <p className="mt-2 text-sm text-slate-600">
              This area is visible only to administrators.
            </p>
          </section>
        ) : null}
      </RoleGate>
    </main>
  );
}
