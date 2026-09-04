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

# คัดลอกไฟล์ package และ pnpm-lock สำหรับติดตั้ง dependencies
COPY package.json pnpm-lock.yaml ./

# ติดตั้ง dependencies ทั้งหมด (รวมถึง devDependencies สำหรับใช้ build และอนุญาต build-scripts เช่น prisma/bcrypt)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --config.ignore-build-scripts=false

# ==========================================
# 3. Build Stage (Compile NestJS TypeScript)
# ==========================================
FROM base AS build
WORKDIR /app

# ดึง node_modules จากขั้นตอน dependencies มาใช้
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# สั่ง Build โค้ด TypeScript ของ NestJS ไปเป็น JavaScript ในโฟลเดอร์ dist/
RUN pnpm run build

# เคลียร์ devDependencies ออก ให้เหลือเฉพาะ Production Dependencies สำหรับรันจริง
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --config.ignore-build-scripts=false

# ==========================================
# 4. Production Runner Stage (Image ตัวจริงที่นำไปรัน)
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# รันด้วย non-root user (node) เพื่อความปลอดภัยสูงสุดตามมาตรฐาน Production
USER node

# คัดลอกเฉพาะไฟล์ที่จำเป็นต้องใช้ตอนรันระบบจาก stage build
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/package.json ./package.json

EXPOSE 3000

# รันไฟล์ Entry point หลักของ NestJS
CMD ["node", "dist/main.js"]