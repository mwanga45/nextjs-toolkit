import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth";
import { sanitizeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Sign in</h1>
      <LoginForm next={sanitizeNextPath(params.next)} />
      <div className="mt-4 flex justify-between text-sm">
        <Link className="underline" href="/forgot-password">
          Forgot password?
        </Link>
        <Link className="underline" href="/register">
          Create account
        </Link>
      </div>
    </div>
  );
}
