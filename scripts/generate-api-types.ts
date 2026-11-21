import { spawnSync } from "node:child_process";
import { env } from "../src/config/env";

const command = "bunx";
const args = [
  "openapi-typescript",
  `${env.API_BASE_URL.replace(/\/$/, "")}/openapi.json`,
  "-o",
  "src/lib/api/generated.ts",
];
const result = spawnSync(command, args, { stdio: "inherit" });
process.exit(result.status ?? 1);
