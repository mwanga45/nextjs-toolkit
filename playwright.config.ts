import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: { baseURL: "http://127.0.0.1:3000", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command:
      "NEXT_PUBLIC_ENABLE_MOCKS=true API_BASE_URL=http://127.0.0.1:3000/api/mock JWT_SECRET=test-secret-with-at-least-32-characters JWT_ISSUER=next-toolkit-tests JWT_AUDIENCE=next-toolkit-app NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000 bun run dev",
    url: "http://127.0.0.1:3000/api/health",
    reuseExistingServer: true,
  },
});
