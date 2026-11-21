"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/features/auth/schemas/auth";
import { loginAction } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

export function LoginForm({ next }: { next?: string }) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", next },
  });

  function submit(values: z.infer<typeof loginSchema>) {
    setMessage("");
    startTransition(async () => {
      const result = await loginAction(values);
      if (!result.ok) {
        setMessage(result.message ?? "Please correct the highlighted fields.");
        for (const [field, errors] of Object.entries(
          result.fieldErrors ?? {},
        )) {
          if (errors?.[0])
            form.setError(field as "email" | "password", {
              message: errors[0],
            });
        }
      }
    });
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
      {message ? (
        <p role="alert" className="text-sm text-red-600">
          {message}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-sm text-red-600">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-red-600">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>
      <input type="hidden" {...form.register("next")} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
