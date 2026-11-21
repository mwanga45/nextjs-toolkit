import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-slate-600">This page could not be found.</p>
      <Link className="mt-6 underline" href="/">
        Go home
      </Link>
    </main>
  );
}
