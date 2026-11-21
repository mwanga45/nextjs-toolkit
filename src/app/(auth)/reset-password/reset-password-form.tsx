"use client";

import { useState, useTransition } from "react";
import { resetPasswordAction } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Reset password</h1>
      {done ? (
        <p role="status">Password reset successfully.</p>
      ) : (
        <form
          className="space-y-4"
          action={() =>
            startTransition(async () => {
              const result = await resetPasswordAction({ token, password });
              if (result.ok) setDone(true);
            })
          }
        >
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      )}
    </div>
  );
}
