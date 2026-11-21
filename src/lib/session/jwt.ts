import "server-only";
import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import { z } from "zod";
import { env } from "@/config/env";

export const roleSchema = z.enum(["user", "admin"]);
export type Role = z.infer<typeof roleSchema>;

export const jwtPayloadSchema = z.object({
  sub: z.string().min(1),
  role: roleSchema,
  exp: z.number(),
  iat: z.number().optional(),
  iss: z.string().optional(),
  aud: z.union([z.string(), z.array(z.string())]).optional(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

export function getTokenExpiry(token: string): number | null {
  try {
    const payload = decodeJwt(token);
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

export async function verifyAccessToken(
  token: string,
): Promise<JwtPayload | null> {
  try {
    const secret = env.JWT_SECRET;
    let key: Parameters<typeof jwtVerify>[1];
    if (env.JWT_JWKS_URL) {
      jwks ??= createRemoteJWKSet(new URL(env.JWT_JWKS_URL));
      key = jwks;
    } else if (secret) {
      key = new TextEncoder().encode(secret);
    } else {
      return null;
    }

    const verified = await jwtVerify(token, key, {
      ...(env.JWT_ISSUER ? { issuer: env.JWT_ISSUER } : {}),
      ...(env.JWT_AUDIENCE ? { audience: env.JWT_AUDIENCE } : {}),
    });
    return jwtPayloadSchema.parse(verified.payload);
  } catch {
    return null;
  }
}
