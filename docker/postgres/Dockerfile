FROM postgres:16-alpine

# Install Node.js and npm
RUN apk add --no-available --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Install pg library for migration script
RUN npm install pg

# Copy the migration script (optional, can also be mounted)
# But we'll mount it for easier development
