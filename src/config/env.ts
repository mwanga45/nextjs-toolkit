import "server-only";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
    SENTRY_DSN: z.string().url().optional().or(z.literal("")),
    API_BASE_URL: z.string().url(),
    JWT_JWKS_URL: z.string().url().optional().or(z.literal("")),
    JWT_SECRET: z.string().min(32).optional().or(z.literal("")),
    JWT_ISSUER: z.string().optional(),
    JWT_AUDIENCE: z.string().optional(),
    ACCESS_COOKIE_NAME: z.string().default("access_token"),
    REFRESH_COOKIE_NAME: z.string().default("refresh_token"),
    REFRESH_COOKIE_MAX_AGE: z.coerce.number().int().positive().default(604800),
    COOKIE_DOMAIN: z.string().optional().or(z.literal("")),
    AUTH_REFRESH_LEEWAY_SECONDS: z.coerce
      .number()
      .int()
      .nonnegative()
      .default(30),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_ENABLE_MOCKS: z.enum(["true", "false"]).default("false"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    API_BASE_URL: process.env.API_BASE_URL,
    JWT_JWKS_URL: process.env.JWT_JWKS_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_ISSUER: process.env.JWT_ISSUER,
    JWT_AUDIENCE: process.env.JWT_AUDIENCE,
    ACCESS_COOKIE_NAME: process.env.ACCESS_COOKIE_NAME,
    REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME,
    REFRESH_COOKIE_MAX_AGE: process.env.REFRESH_COOKIE_MAX_AGE,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
    AUTH_REFRESH_LEEWAY_SECONDS: process.env.AUTH_REFRESH_LEEWAY_SECONDS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ENABLE_MOCKS: process.env.NEXT_PUBLIC_ENABLE_MOCKS,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});

if (
  process.env.SKIP_ENV_VALIDATION !== "true" &&
  !env.JWT_JWKS_URL &&
  !env.JWT_SECRET
) {
  throw new Error("Configure JWT_JWKS_URL or JWT_SECRET.");
}
