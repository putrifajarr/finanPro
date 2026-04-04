FROM node:20-alpine AS base

# Instalasi Dependensi
FROM base AS deps
# Menambahkan libc6-compat karena beberapa library node (seperti Prisma/Sharp) membutuhkannya di Alpine Linux
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Salin file konfigurasi package
COPY package.json package-lock.json ./
# Instal dependensi menggunakan 'npm ci' untuk memastikan versi yang sama dengan lockfile
RUN npm ci

# Build Aplikasi
FROM base AS builder
WORKDIR /app

# Ambil node_modules yang sudah diinstal di tahap sebelumnya
COPY --from=deps /app/node_modules ./node_modules
# Salin seluruh source code
COPY . .

# Generate Prisma Client agar query database bisa berjalan
RUN npx prisma generate

# placeholder agar build tidak error/crash 
# meskipun database atau API asli tidak terhubung saat proses build di dalam Docker.
ARG DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ARG NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co"
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder"
ARG SUPABASE_SERVICE_ROLE_KEY="placeholder"

# Mendaftarkan ARG ke ENV agar dapat diakses oleh script 'npm run build'.
# Saat container dijalankan (Runtime), nilai ini akan ditimpa oleh variabel asli dari file .env
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Melakukan kompilasi/build proyek Next.js untuk produksi
RUN npm run build

# Runner (Image final untuk produksi)
FROM base AS runner
WORKDIR /app

# Set environment ke mode produksi
ENV NODE_ENV=production
# Matikan telemetri Next.js untuk privasi dan performa yang lebih baik
ENV NEXT_TELEMETRY_DISABLED=1

# Salin file-file yang dibutuhkan untuk menjalankan aplikasi
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Salin hasil build (.next) dan dependensi produksi (node_modules)
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Salin folder prisma untuk kebutuhan migrasi atau runtime jika diperlukan
COPY --from=builder /app/prisma ./prisma

# Expose port 3000 (port default Next.js)
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Jalankan aplikasi menggunakan perintah npm start
CMD ["npm", "run", "start"]
