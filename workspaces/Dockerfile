# Stage 1: Build Stage (use the full Node.js image for building)
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json for client and server
COPY ./server/package.json ./server/
COPY ./server/package-lock.json ./server/
COPY ./client/package.json ./client/
COPY ./client/package-lock.json ./client/

# Disable Husky
ENV HUSKY=0

# Install dependencies separately for each workspace
RUN npm install --prefix client --ignore-scripts
RUN npm install --prefix server --ignore-scripts

# Copy the entire project (source code)
COPY . .

# 🔥 Build frontend
WORKDIR /app/client
RUN npm run build

# 🔥 Build backend
WORKDIR /app/server
RUN npm run build

# Stage 2: Final production image (use a minimal Alpine-based Node image)
FROM node:18-alpine

WORKDIR /app

# Copy only necessary build files from the builder stage
COPY --from=builder /app/server /app/server
COPY --from=builder /app/client/dist /app/client/dist

# Install only production dependencies
RUN npm install --prefix /app/server --omit=dev

# Expose port 8080
EXPOSE 8080

# Start the server
CMD ["npm", "run", "start", "--prefix", "/app/server"]
