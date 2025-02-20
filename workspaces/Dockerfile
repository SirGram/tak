# Stage 1: Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build argument for VITE_SOCKET_URL
ARG VITE_SOCKET_URL
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}

# Copy package files and install dependencies...
COPY ./server/package.json ./server/
COPY ./server/package-lock.json ./server/
COPY ./client/package.json ./client/
COPY ./client/package-lock.json ./client/

ENV HUSKY=0

RUN npm install --prefix client --ignore-scripts
RUN npm install --prefix server --ignore-scripts

COPY . .

# Build frontend (will pick up VITE_SOCKET_URL from ENV)
WORKDIR /app/client
RUN npm run build

# Build backend
WORKDIR /app/server
RUN npm run build

# Stage 2: Final production image (unchanged)
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/server /app/server
COPY --from=builder /app/client/dist /app/client/dist

RUN npm install --prefix /app/server --omit=dev

EXPOSE 8080

CMD ["npm", "run", "start", "--prefix", "/app/server"]
