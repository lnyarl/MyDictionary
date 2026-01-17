# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock ./

# Copy workspace package files
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY shared/ ./shared/
COPY frontend/ ./frontend/

# Build shared first
RUN yarn workspace @mydictionary/shared build

# Build frontend
RUN yarn workspace mydictionary-frontend build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
# The path is relative to the build context (root)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
