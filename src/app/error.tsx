"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-slate-600">{error.message}</p>
      <button className="mt-6 rounded-md border px-4 py-2" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
