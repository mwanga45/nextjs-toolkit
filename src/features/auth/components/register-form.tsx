"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/features/auth/schemas/auth";
import { registerAction } from "@/features/auth/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

export function RegisterForm() {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  function submit(values: z.infer<typeof registerSchema>) {
    startTransition(async () => {
      const result = await registerAction(values);
      if (!result.ok) setMessage(result.message ?? "Please correct the form.");
    });
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
      {message ? (
        <p role="alert" className="text-sm text-red-600">
          {message}
        </p>
      ) : null}
      {(["name", "email", "password"] as const).map((field) => (
        <div className="space-y-2" key={field}>
          <Label htmlFor={field}>
            {field === "name"
              ? "Name"
              : field[0]?.toUpperCase() + field.slice(1)}
          </Label>
          <Input
            id={field}
            type={
              field === "password"
                ? "password"
                : field === "email"
                  ? "email"
                  : "text"
            }
            {...form.register(field)}
          />
          {form.formState.errors[field] ? (
            <p className="text-sm text-red-600">
              {form.formState.errors[field]?.message}
            </p>
          ) : null}
        </div>
      ))}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
