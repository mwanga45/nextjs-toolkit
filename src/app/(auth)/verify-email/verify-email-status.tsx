"use client";

import { useEffect, useState, useTransition } from "react";
import { verifyEmailAction } from "@/features/auth/actions/auth-actions";

export default function VerifyEmailStatus({ token }: { token: string }) {
  const [message, setMessage] = useState("Verifying...");
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    startTransition(async () => {
      const result = await verifyEmailAction({ token });
      setMessage(
        result.ok ? "Email verified successfully." : "Verification failed.",
      );
    });
  }, [startTransition, token]);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Verify email</h1>
      <p aria-live="polite">{pending ? "Verifying..." : message}</p>
    </div>
  );
}
