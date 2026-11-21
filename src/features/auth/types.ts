import { z } from "zod";
import type { Role } from "@/lib/session/jwt";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(["user", "admin"]),
});
