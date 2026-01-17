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
RUN yarn workspace @stashy/shared build

# Build backend
RUN yarn workspace stashy-backend build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock ./

# Copy shared and backend package files
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# Install production dependencies only
RUN yarn install --production --frozen-lockfile

# Copy built application and shared dist
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "backend/dist/backend/src/main"]
