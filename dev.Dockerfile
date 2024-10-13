# Development Dockerfile for NestJS Discord Bot
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Start the application in development mode with hot-reloading
CMD ["npm", "run", "start:dev"]
