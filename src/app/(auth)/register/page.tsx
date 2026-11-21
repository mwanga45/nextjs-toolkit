import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Create account</h1>
      <RegisterForm />
      <p className="mt-4 text-sm">
        Already registered?{" "}
        <Link className="underline" href="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
