# ==========================================
# 1. Base Image (Node.js 22 + pnpm)
# ==========================================
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ==========================================
# 2. Dependencies Stage
# ==========================================
FROM base AS dependencies
WORKDIR /app

# คัดลอกไฟล์ lockfile เพื่อใช้แคชของ Docker
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ==========================================
# 3. Build Stage (Compile NestJS TypeScript)
# ==========================================
FROM base AS build
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# สั่ง Build โค้ด NestJS จาก src/ ไปเป็น dist/
RUN pnpm run build

# เคลียร์ devDependencies ให้เหลือเฉพาะ Production Dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# ==========================================
# 4. Production Runner Stage (Image ตัวจริงที่นำไปรัน)
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# รันด้วย non-root user (node) เพื่อความปลอดภัย
USER node

# ดึงเฉพาะ dist, node_modules และ package.json
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/package.json ./package.json

EXPOSE 3000

# รันไฟล์ Entry point หลักของ NestJS
CMD ["node", "dist/main.js"]