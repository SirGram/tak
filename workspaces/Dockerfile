FROM node:18

WORKDIR /app

# Copy package.json and package-lock.json from both client & server
COPY ./server/package.json ./server/
COPY ./server/package-lock.json ./server/
COPY ./client/package.json ./client/
COPY ./client/package-lock.json ./client/

# Disable Husky
ENV HUSKY=0

# Install dependencies separately for each workspace
RUN npm install --prefix client --ignore-scripts
RUN npm install --prefix server --ignore-scripts

# Copy the entire project
COPY . .

# 🔥 Change to `client/` before running build
WORKDIR /app/client
RUN npm run build

# 🔥 Change to `server/` before building the backend
WORKDIR /app/server
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production --omit=dev

# Expose port 8080
EXPOSE 8080

# Start the server
CMD ["npm", "run", "start"]
