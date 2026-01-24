# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock ./

# Copy all workspace package files to satisfy yarn install
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY frontend-admin/package.json ./frontend-admin/
COPY backend-admin/package.json ./backend-admin/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code for shared and the target app
COPY shared/ ./shared/
COPY backend/ ./backend/

# Build shared first
RUN yarn build:shared

# Build backend
RUN yarn build:backend 

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock ./

# Copy shared and backend package files
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

RUN yarn install --production --frozen-lockfile

COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/dist/i18n ./backend/dist/i18n

COPY backend/scripts/migrate.js ./scripts/
COPY backend/migrations ./backend/migrations

EXPOSE 3000

CMD ["sh", "-c", "node scripts/migrate.js && node backend/dist/backend/src/main"]
