import { describe, expect, it } from "vitest";
import { sanitizeNextPath } from "./utils";

describe("sanitizeNextPath", () => {
  it("accepts relative paths", () => {
    expect(sanitizeNextPath("/dashboard")).toBe("/dashboard");
  });
  it("rejects open redirects", () => {
    expect(sanitizeNextPath("//evil.example")).toBe("/dashboard");
    expect(sanitizeNextPath("https://evil.example")).toBe("/dashboard");
    expect(sanitizeNextPath("/\\evil.example")).toBe("/dashboard");
  });
});
