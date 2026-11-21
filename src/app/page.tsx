import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
      <p className="mb-4 rounded-full border px-3 py-1 text-sm">
        Next.js frontend toolkit
      </p>
      <h1 className="max-w-3xl text-5xl font-bold tracking-tight">
        Secure foundations for long-lived applications
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-slate-600">
        Typed API infrastructure, JWT cookie authentication, role gates, mocks,
        tests, and production hardening.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/register">Create account</Link>
        </Button>
      </div>
    </main>
  );
}
