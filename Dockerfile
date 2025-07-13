# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

# 1. Dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy schema first for `postinstall`
COPY prisma ./prisma
# Copy package manager files
COPY package.json pnpm-lock.yaml* ./
# Install dependencies
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# 2. Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time env vars
ENV NEXT_TELEMETRY_DISABLED=1
ARG ALLOWED_TOKENS
ARG AUTH_TOKEN
ARG DATABASE_URL
ARG GEMINI_API_KEYS
ARG GOOGLE_API_HOST
ARG MAX_FAILURES

ENV ALLOWED_TOKENS=$ALLOWED_TOKENS \
    AUTH_TOKEN=$AUTH_TOKEN \
    DATABASE_URL=$DATABASE_URL \
    GEMINI_API_KEYS=$GEMINI_API_KEYS \
    GOOGLE_API_HOST=$GOOGLE_API_HOST \
    MAX_FAILURES=$MAX_FAILURES

# Generate Prisma client and build the project
RUN corepack enable pnpm && pnpm prisma generate
RUN corepack enable pnpm && pnpm build

# 3. Runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install su-exec for user switching
RUN apk add --no-cache su-exec

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy the static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy public assets
COPY --from=builder /app/public ./public
# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Create a directory for persistent data
RUN mkdir -p /app/data

# Set ownership for the app directory, entrypoint will fix /app/data at runtime
RUN chown -R nextjs:nodejs /app

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run the entrypoint script to migrate and start
CMD ["/app/entrypoint.sh"]
