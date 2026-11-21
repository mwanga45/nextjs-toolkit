# Developer Guide

This guide explains how to work in the toolkit: where code belongs, how a feature moves from API contract to route, and how to verify changes. The project is a frontend and server-rendered API client; the real data, authentication authority, and business rules belong to an external REST backend.

## 1. Start the project

Use Bun for all package operations:

```bash
bun install
cp .env.example .env
bun run dev:mock
```

Open `http://localhost:3000`. For the local mock backend, `.env` should point `API_BASE_URL` to `http://localhost:3000/api/mock`. The mock endpoint is a Next.js Route Handler under `src/app/api/mock/`; it returns sample responses and signed development JWTs. Its signing key is not a production credential.

To connect a real backend, set `API_BASE_URL` to its origin/base path, configure the JWT verification settings, and keep `NEXT_PUBLIC_ENABLE_MOCKS=false`. See the environment table in the main [README](../README.md).

Run Docker only after starting Docker Desktop:

```bash
bun run docker:up
```

This command runs Compose in the foreground. Stop it with `Ctrl+C`; if you need to remove the container and network, run `bun run docker:down`.

## 2. Know where code belongs

| What you are adding or changing                 | Put it here                          | Responsibility                                                                                                      |
| ----------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| A URL/page/layout                               | `src/app/`                           | Route composition, loading/error states, metadata, and layouts; keep business behavior in a feature or `lib` module |
| A domain capability such as billing or projects | `src/features/<feature>/`            | Schemas, domain types, backend calls, server actions, hooks, and feature UI                                         |
| A backend endpoint path                         | `src/config/constants.ts`            | Keep endpoint path definitions centralized                                                                          |
| A backend request/response                      | `src/features/<feature>/api/`        | Call the shared server-side HTTP client and validate responses                                                      |
| A submitted mutation                            | `src/features/<feature>/actions/`    | Validate input, call the feature API, return a serializable result, and perform authorized server-side work         |
| A reusable visual primitive                     | `src/components/ui/`                 | Buttons, inputs, labels, and other UI building blocks                                                               |
| Shared UI that is not a primitive               | `src/components/shared/`             | Components reused across features                                                                                   |
| Cookie/JWT/session/API infrastructure           | `src/lib/`                           | Cross-cutting server infrastructure; never import feature modules here                                              |
| Environment variables or application routes     | `src/config/`                        | Validated env, route constants, endpoint constants, and other app-wide configuration                                |
| React context providers                         | `src/providers/`                     | Application-wide client providers                                                                                   |
| Mock API responses                              | `src/app/api/mock/` or `src/mocks/`  | The Route Handler is the local HTTP mock backend; MSW handlers support tests                                        |
| Unit tests                                      | Next to the source as `*.test.ts(x)` | Focused function, schema, and component behavior                                                                    |
| Browser workflow tests                          | `e2e/`                               | User-facing scenarios driven through Playwright                                                                     |
| Environment checks or generated API types       | `scripts/` and `src/lib/api/`        | Repeatable developer tooling and generated client types                                                             |

Use kebab-case for filenames and PascalCase for React component names.

## 3. Add a feature step by step

Example: adding a projects list.

### Step 1: Define the endpoint and data shape

Add a path to `src/config/constants.ts`:

```ts
export const API_ENDPOINTS = {
  // Keep the existing entries.
  projects: "/projects",
} as const;
```

Define the project response schema and type in `src/features/projects/types.ts` or `schemas/`. Validate data from the backend; TypeScript types alone do not validate JSON received over HTTP.

### Step 2: Add the feature API module

Create `src/features/projects/api/projects-api.ts`. Backend requests go through `apiFetch` from `src/lib/api/client.ts`, which is server-only and sets the access-token authorization header:

```ts
import "server-only";
import { z } from "zod";
import { API_ENDPOINTS } from "@/config/constants";
import { apiFetch } from "@/lib/api/client";

const projectsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
  }),
);

export function getProjects() {
  return apiFetch<z.infer<typeof projectsSchema>>(API_ENDPOINTS.projects, {
    schema: projectsSchema,
  });
}
```

Do not call the external backend with raw `fetch` from a component. Keep transport, timeout, authorization, error parsing, and response validation in the shared API layer.

### Step 3: Add server actions for client-submitted changes

Create `src/features/projects/actions/` for mutations that a Client Component needs to invoke. Mark Server Action modules with `"use server"`, validate every input with the feature’s Zod schema, and return serializable success/error results.

Check authorization inside each sensitive Server Action. A protected layout is useful for navigation and UX, but it does not replace authorization in the action or Route Handler itself. Use `requireUser()` or `requireRole()` from `src/lib/auth/session.ts` where appropriate.

### Step 4: Add UI and route composition

- Put feature-specific UI in `src/features/projects/components/`.
- Reuse general primitives from `src/components/ui/`.
- Put the route in `src/app/(dashboard)/projects/page.tsx`; route groups in parentheses do not appear in the URL.
- Keep the page as a Server Component when it can fetch data on the server. Use a Client Component only when browser state or interaction requires it.
- Put shared route protection in the layout for a consistent redirect, and still check authorization in sensitive actions/handlers.

In Next.js 16, `searchParams` is asynchronous. If a route reads URL search params during a prerendered render, put the async read behind a `<Suspense>` boundary, following `src/app/(auth)/login/page.tsx`.

### Step 5: Publish the feature API

Export only the pieces other modules should use from `src/features/projects/index.ts`. Other features should import through this public entry point rather than reaching into the feature’s internal files.

### Step 6: Test and verify

- Add unit tests beside the schema/API/helper being changed.
- Add or update a Playwright scenario in `e2e/` for an important user workflow.
- Run `bun run lint`, `bun run typecheck`, `bun run test`, and `bun run build`.
- Run `bun run test:e2e` for browser-visible behavior.

## 4. Authentication and authorization

### Where auth code lives

| File/folder                         | Use                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `src/features/auth/schemas/`        | Validate login, registration, and account-recovery input                    |
| `src/features/auth/api/auth-api.ts` | Login, registration, and current-user backend requests                      |
| `src/features/auth/actions/`        | Server Actions that submit auth forms and write/delete cookies              |
| `src/features/auth/components/`     | Client forms and auth UI                                                    |
| `src/lib/session/cookies.ts`        | Central cookie names/options and token lookup                               |
| `src/lib/session/jwt.ts`            | JWT signature/claim verification and role types                             |
| `src/lib/session/refresh.ts`        | Shared in-flight refresh requests                                           |
| `src/lib/auth/session.ts`           | `getSession`, `requireUser`, `requireRole`, and `can`                       |
| `src/proxy.ts`                      | Next.js 16 optimistic route redirects; not the final authorization boundary |
| `src/app/api/auth/refresh/route.ts` | Refresh cookie exchange and cookie rotation                                 |

Tokens must stay in httpOnly cookies. Never put them in local storage, session storage, rendered props, or client logs. Treat roles decoded by the frontend as a UX/routing hint; the backend must authorize every protected operation.

When adding a protected route, add the path to `src/config/routes.ts`, ensure its protected layout calls `requireUser()`, and explicitly authorize sensitive Server Actions and Route Handlers. For role-specific server logic, call `requireRole()` or check `can()`; hiding a button with `<RoleGate>` alone is not authorization.

### Changing the backend auth contract

1. Update the endpoint path in `src/config/constants.ts`.
2. Update request/response schemas and API methods in `src/features/auth/`.
3. Keep cookie writes/deletes in Server Actions or Route Handlers.
4. Update the local mock in `src/app/api/mock/[...path]/route.ts` and related MSW handlers in `src/mocks/handlers.ts`.
5. Update the backend contract in the main README and affected tests.

The backend should rotate refresh tokens, detect refresh-token reuse, and revoke refresh sessions on logout. The mock backend is only a development aid.

## 5. Environment and secrets

- `.env.example` is the documented safe local starting point; copy it to `.env`.
- `.env` is ignored by Git. Never commit real tokens, private keys, or production secrets.
- Add variable schemas and runtime mappings only in `src/config/env.ts`. Do not read `process.env` elsewhere.
- `NEXT_PUBLIC_` variables are exposed to browser code; never place secrets in them.
- Use `JWT_JWKS_URL` for asymmetric verification when available. `JWT_SECRET` makes the frontend hold a shared signing secret and is not the preferred production setup.
- Run `bun run env:check` to validate configuration.

## 6. API types and mocks

`src/lib/api/client.ts` is the shared server-side HTTP client. Use it from feature API modules. `src/lib/errors.ts` contains the common API error shape and error-body parser.

To generate TypeScript definitions from the backend OpenAPI document:

```bash
bun run api:types
```

The script reads `API_BASE_URL` and expects an OpenAPI document at `<API_BASE_URL>/openapi.json`. Review generated output at `src/lib/api/generated.ts`; do not hand-edit generated files.

The local mock REST backend is served at `/api/mock/*`. The default `.env.example` points the API client to it. `src/mocks/handlers.ts` defines MSW handlers for tests; `src/mocks/server.ts` wires them into Vitest. When changing a backend contract, update both mock representations so local app usage and tests stay aligned.

## 7. UI, styles, and global errors

- Use Tailwind utility classes and existing UI primitives before adding new dependencies.
- Add a generally reusable primitive to `src/components/ui/`; keep a one-feature component inside that feature.
- Add app-wide CSS variables and reset/styles to `src/app/globals.css`.
- Set root metadata/providers in `src/app/layout.tsx`.
- Use `src/app/loading.tsx`, `error.tsx`, `global-error.tsx`, and `not-found.tsx` for route/app-level states; feature-specific states can live with the feature.
- Avoid `dangerouslySetInnerHTML`; cookies do not eliminate XSS risks.

## 8. Commands and pull request checklist

| Command                                     | When to use it                          |
| ------------------------------------------- | --------------------------------------- |
| `bun run dev:mock`                          | Develop against the local mock REST API |
| `bun run dev`                               | Develop with the configured API         |
| `bun run env:check`                         | Check required environment values       |
| `bun run api:types`                         | Regenerate OpenAPI types                |
| `bun run lint` / `bun run lint:fix`         | Check / fix lint                        |
| `bun run typecheck`                         | Check strict TypeScript                 |
| `bun run test` / `bun run test:watch`       | Run / watch unit tests                  |
| `bun run test:e2e`                          | Run Playwright browser tests            |
| `bun run build`                             | Verify a production build               |
| `bun run docker:up` / `bun run docker:down` | Start / remove the Docker Compose app   |

Before opening a pull request:

- [ ] Code is in the correct layer and uses feature public APIs.
- [ ] All external inputs and backend responses are validated.
- [ ] Authorization is enforced on the server for protected operations.
- [ ] Tests cover new or changed behavior.
- [ ] `bun run lint`, `bun run typecheck`, `bun run test`, and `bun run build` pass.
- [ ] Documentation, environment examples, and mocks reflect contract changes.
- [ ] No secrets or generated runtime data are committed.
