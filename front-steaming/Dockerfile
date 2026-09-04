# 1. ติดตั้ง Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# เปลี่ยนตรงนี้: ระบุเวอร์ชัน pnpm ให้ตรงกับเครื่อง เช่น pnpm@9
RUN npm install -g pnpm@9 && pnpm install --frozen-lockfile

# 2. Build โค้ด Next.js
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# และเปลี่ยนตรงนี้ด้วยเช่นกัน
RUN npm install -g pnpm@9 && pnpm build

# 3. รันโปรเจคในโหมด Production (Standalone)
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]