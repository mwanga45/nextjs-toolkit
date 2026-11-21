import { NextResponse } from "next/server";
import { env } from "@/config/env";

export async function GET() {
  let backend = "not-checked";
  try {
    const response = await fetch(`${env.API_BASE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    backend = response.ok ? "ok" : "degraded";
  } catch {
    backend = "unreachable";
  }
  return NextResponse.json(
    { status: "ok", backend },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
