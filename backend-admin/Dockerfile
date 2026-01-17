# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock ./

# Copy workspace package files
COPY shared/package.json ./shared/
COPY backend-admin/package.json ./backend-admin/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY shared/ ./shared/
COPY backend-admin/ ./backend-admin/

# Build shared first
RUN yarn workspace @mydictionary/shared build

# Build backend-admin
RUN yarn workspace mydictionary-backend-admin build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock ./

# Copy workspace package files
COPY shared/package.json ./shared/
COPY backend-admin/package.json ./backend-admin/

# Install production dependencies only
RUN yarn install --production --frozen-lockfile

# Copy built application and shared dist
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend-admin/dist ./backend-admin/dist

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "backend-admin/dist/backend-admin/src/main"]
