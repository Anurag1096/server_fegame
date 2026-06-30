# syntax=docker/dockerfile:1

FROM node:24-alpine AS builder

WORKDIR /app

# argon2 and other native modules need a compiler on Alpine
RUN apk add --no-cache python3 make g++

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY .npmrc pnpm-lock.yaml ./

# Download packages into the store first (cacheable, lockfile-only)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm fetch --config.trustPolicy=any --config.minimumReleaseAge=0

COPY package.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Link from store without hitting the registry again
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --offline

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN pnpm exec prisma generate
RUN pnpm build
RUN pnpm prune --prod

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3004

RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nestjs

EXPOSE 3004

CMD ["node", "dist/src/main.js"]
