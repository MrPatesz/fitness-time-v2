##### DEPENDENCIES

FROM --platform=linux/amd64 node:16-alpine3.17 AS deps
RUN apk add --no-cache libc6-compat openssl1.1-compat
WORKDIR /app

# Install Prisma Client
COPY prisma ./

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
 if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
 elif [ -f package-lock.json ]; then npm ci; \
 elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
 else echo "Lockfile not found." && exit 1; \
 fi

##### BUILDER

FROM --platform=linux/amd64 node:16-alpine3.17 AS builder

# Env
ARG NEXT_PUBLIC_VERCEL_ENV
# Pusher
ARG NEXT_PUBLIC_PUSHER_CLUSTER
ARG NEXT_PUBLIC_PUSHER_APP_KEY
# Google Maps Api
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
# Prisma
ARG POSTGRES_PRISMA_URL
# Kysely
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG POSTGRES_HOST
ARG POSTGRES_PORT
ARG POSTGRES_DATABASE
# Next Auth
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
# Next Auth Discord Provider
ARG DISCORD_CLIENT_ID
ARG DISCORD_CLIENT_SECRET
# Next Auth Google Provider
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
# Pusher
ARG PUSHER_APP_ID
ARG PUSHER_SECRET
# Upload Thing
ARG UPLOADTHING_SECRET
ARG UPLOADTHING_APP_ID

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN \
 if [ -f yarn.lock ]; then SKIP_ENV_VALIDATION=1 yarn build; \
 elif [ -f package-lock.json ]; then SKIP_ENV_VALIDATION=1 npm run build; \
 elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && SKIP_ENV_VALIDATION=1 pnpm run build; \
 else echo "Lockfile not found." && exit 1; \
 fi

##### RUNNER

FROM --platform=linux/amd64 node:16-alpine3.17 AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
