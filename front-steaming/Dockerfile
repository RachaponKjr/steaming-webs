# 1. Install Dependencies Stage
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@9 && pnpm install --frozen-lockfile

# 2. Build Stage (Next.js)
FROM node:22-alpine AS builder
WORKDIR /app

# ประกาศรับค่า Argument จาก Docker Compose
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_LIVEKIT_URL

# แปลง Argument ให้เป็น Environment Variable เพื่อให้ตอนพิมพ์คำสั่ง build โค้ดมองเห็น
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_LIVEKIT_URL=$NEXT_PUBLIC_LIVEKIT_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# 3. Production Runner Stage (Standalone)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# (ถ้าตอนรันไทม์ฝั่ง client ต้องใช้ตัวแปรเหล่านี้ซ้ำ เผื่อไว้ด้วย)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_LIVEKIT_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_LIVEKIT_URL=$NEXT_PUBLIC_LIVEKIT_URL

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p /app/uploads/og /app/uploads/thumbnails /app/uploads/avatars /app/uploads/general
RUN chown -R nextjs:nodejs /app/uploads
# หรือใช้ chmod -R 777 /app/uploads เผื่อกรณีใช้ Docker Volume ทับ
RUN chmod -R 777 /app/uploads

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]