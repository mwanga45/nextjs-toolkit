FROM oven/bun:1.4.2 AS dependencies
WORKDIR /app
ENV HUSKY=0
COPY package.json bun.lock bunfig.toml ./
COPY scripts/check-package-manager.ts ./scripts/check-package-manager.ts
RUN bun install --frozen-lockfile

FROM oven/bun:1.4.2 AS build
WORKDIR /app
ENV SKIP_ENV_VALIDATION=true
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM oven/bun:1.4.2-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=1001:1001 /app/public ./public
COPY --from=build --chown=1001:1001 /app/.next/standalone ./
COPY --from=build --chown=1001:1001 /app/.next/static ./.next/static
USER 1001:1001
EXPOSE 3000
CMD ["bun", "server.js"]
