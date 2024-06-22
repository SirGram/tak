# Use an official Node runtime as a parent image
FROM node:14-alpine

# Install TypeScript globally
RUN npm install -g typescript

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY ./server/package.json .
COPY ./server/package*.json ./
# Install dependencies
RUN npm install 


# Copy the common directory into the container
COPY ./common /common

# Copy the rest of the application code to the working directory
COPY ./server .


# Expose port 3000 to the outside world
EXPOSE 8080


# Command to run your server using ts-node
CMD ["npm", "run", "dev"]
