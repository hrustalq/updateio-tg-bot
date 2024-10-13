# PRODUCTION DOCKERFILE
# ---------------------
# This Dockerfile is optimized for GitLab Runner deployment on a remote Ubuntu server

# Build stage
FROM node:20-alpine AS builder

ENV NODE_ENV=build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER node

CMD ["node", "dist/main.js"]
