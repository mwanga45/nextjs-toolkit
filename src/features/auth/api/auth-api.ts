import "server-only";
import { z } from "zod";
import { API_ENDPOINTS } from "@/config/constants";
import { apiFetch } from "@/lib/api/client";
import { userSchema } from "@/features/auth/types";

export const tokenSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export async function login(input: { email: string; password: string }) {
  return apiFetch<z.infer<typeof tokenSchema>>(API_ENDPOINTS.login, {
    method: "POST",
    body: input,
    schema: tokenSchema,
  });
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
}) {
  return apiFetch<z.infer<typeof tokenSchema>>(API_ENDPOINTS.register, {
    method: "POST",
    body: input,
    schema: tokenSchema,
  });
}

export async function getCurrentUser() {
  return apiFetch<z.infer<typeof userSchema>>(API_ENDPOINTS.me, {
    schema: userSchema,
  });
}
