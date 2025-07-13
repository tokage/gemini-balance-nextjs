# https://github.com/nextauthjs/next-auth-example/blob/main/Dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
# Copy prisma schema to be available for generate
COPY prisma ./prisma
RUN corepack enable pnpm && pnpm i --frozen-lockfile
# Clean up pnpm cache
RUN pnpm store prune

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# 接收构建参数
ARG ALLOWED_TOKENS
ARG AUTH_TOKEN
ARG DATABASE_URL
ARG GEMINI_API_KEYS
ARG GOOGLE_API_HOST
ARG MAX_FAILURES

# 转换为环境变量
ENV ALLOWED_TOKENS=$ALLOWED_TOKENS \
    AUTH_TOKEN=$AUTH_TOKEN \
    DATABASE_URL=$DATABASE_URL \
    GEMINI_API_KEYS=$GEMINI_API_KEYS \
    GOOGLE_API_HOST=$GOOGLE_API_HOST \
    MAX_FAILURES=$MAX_FAILURES

# Build Project
RUN corepack enable pnpm && pnpm prisma generate && pnpm build

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy production dependencies and build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

# Set ownership for the app directory
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Run the entrypoint script to migrate and start
CMD ["./entrypoint.sh"]
