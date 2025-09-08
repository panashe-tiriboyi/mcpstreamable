FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY src/ ./src/

# Build TypeScript
RUN npm run build

FROM node:20-alpine AS release

WORKDIR /app

# Copy only production files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

ENV NODE_ENV=production
ENV PORT=80

# Install only production dependencies
RUN npm ci --omit=dev

CMD ["node", "dist/server.js"]