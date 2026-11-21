"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center">
        <main className="text-center">
          <h1 className="text-2xl font-bold">Application error</h1>
          <p className="mt-2">{error.message}</p>
          <button className="mt-6 rounded-md border px-4 py-2" onClick={reset}>
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
