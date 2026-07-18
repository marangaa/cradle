FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
ARG APP
ENV APP=${APP}
ARG NEXT_PUBLIC_CRADLE_RUNTIME_URL
ENV NEXT_PUBLIC_CRADLE_RUNTIME_URL=${NEXT_PUBLIC_CRADLE_RUNTIME_URL}
RUN pnpm --filter @cradle/widget build && pnpm --filter ${APP} build
CMD ["sh", "-c", "pnpm --filter ${APP} start"]
