import { requireUser } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl justify-end">
          <form
            action={async () => {
              "use server";
              const { logoutAction } =
                await import("@/features/auth/actions/auth-actions");
              await logoutAction();
            }}
          >
            <button
              className="rounded-md border px-3 py-2 text-sm"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
