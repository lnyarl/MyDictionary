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
COPY frontend/ ./frontend/

# Build shared first
RUN yarn workspace @mydictionary/shared build

# Build frontend
RUN yarn workspace mydictionary-frontend build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY frontend/nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Copy built application
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
