import { z } from "zod";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
    public readonly code = "APP_ERROR",
    public readonly fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export class ApiError extends AppError {
  constructor(
    message: string,
    status: number,
    code = "API_ERROR",
    fields?: Record<string, string[]>,
  ) {
    super(message, status, code, fields);
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null);
  const schema = z.object({
    message: z.string().optional(),
    code: z.string().optional(),
    errors: z.record(z.string(), z.array(z.string())).optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new ApiError(
      response.statusText || "Request failed",
      response.status,
    );
  }
  return new ApiError(
    parsed.data.message ?? "Request failed",
    response.status,
    parsed.data.code ?? "API_ERROR",
    parsed.data.errors,
  );
}
