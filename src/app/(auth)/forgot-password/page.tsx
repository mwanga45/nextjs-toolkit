"use client";

import { useState, useTransition } from "react";
import { forgotPasswordAction } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Forgot password</h1>
      {done ? (
        <p role="status">
          If the account exists, reset instructions have been sent.
        </p>
      ) : (
        <form
          className="space-y-4"
          action={() =>
            startTransition(async () => {
              const result = await forgotPasswordAction({ email });
              if (result.ok) setDone(true);
            })
          }
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}
    </div>
  );
}
