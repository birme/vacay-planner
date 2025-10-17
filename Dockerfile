# Use official Node.js runtime as the base image
FROM node:22-alpine

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install all dependencies (including devDependencies for build)
RUN npm ci && \
    cd server && npm ci --only=production && \
    cd ../client && npm ci

# Copy application code
COPY . .

# Build the frontend
RUN npm run build

# Clean up devDependencies after build
RUN cd client && npm prune --production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S vacayapp -u 1001

# Change ownership of the app directory
RUN chown -R vacayapp:nodejs /app
USER vacayapp

# Expose port (can be overridden with PORT env var)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: process.env.PORT || 3001, path: '/health', timeout: 2000 }; \
    const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Start the application
CMD ["npm", "start"]