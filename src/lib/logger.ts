import "server-only";
import pino from "pino";
import { env } from "@/config/env";

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      "authorization",
      "cookie",
      "set-cookie",
      "accessToken",
      "refreshToken",
      "*.accessToken",
      "*.refreshToken",
    ],
    censor: "[REDACTED]",
  },
});
