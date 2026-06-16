# ---------- Dependencies ----------
FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

# Generate Prisma client
RUN npx prisma generate


# ---------- Builder ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


# ---------- Runner ----------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs
RUN adduser -S nextjs -G nodejs

# Next standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma schema/client if needed at runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]