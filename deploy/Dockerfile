FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
ARG APP
RUN pnpm --filter @cradle/widget build && pnpm --filter ${APP} build
WORKDIR /app/apps/${APP}
CMD ["sh", "-c", "pnpm exec next start -p ${PORT:-3000}"]
