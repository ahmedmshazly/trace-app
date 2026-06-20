# Trace backend — production image.
# Build once, run anywhere; configuration is injected via environment at runtime
# (12-factor). The same artifact runs locally (compose) and in hosted envs.

# ---- Stage 1: build (full deps + TypeScript -> dist/) ----
FROM node:22-bookworm-slim AS build
WORKDIR /app

# Install deps against the lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# Compile.
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# Drop dev dependencies for the runtime image.
RUN npm prune --omit=dev

# ---- Stage 2: runtime (slim, non-root) ----
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Run as the unprivileged user that the base image already provides.
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

USER node
EXPOSE 4000

# Lightweight liveness probe against the health endpoint.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# No --env-file here: the platform/compose injects configuration as real env vars.
CMD ["node", "dist/server.js"]
