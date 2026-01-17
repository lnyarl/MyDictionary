# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock ./

# Copy workspace package files
COPY shared/package.json ./shared/
COPY frontend-admin/package.json ./frontend-admin/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY shared/ ./shared/
COPY frontend-admin/ ./frontend-admin/

# Build shared if needed
RUN yarn workspace @mydictionary/shared build

# Build frontend-admin
RUN yarn workspace mydictionary-frontend-admin build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY frontend-admin/nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder
COPY --from=builder /app/frontend-admin/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
