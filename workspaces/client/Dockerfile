# Use an official Node runtime as a parent image
FROM node:18-alpine


# Install TypeScript globally
RUN npm install -g typescript

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY ./client/package.json .
COPY ./client/package*.json ./


# Install dependencies
RUN npm install

# Copy the common directory into the container
COPY ./common /common

# Copy the rest of the application code to the working directory
COPY ./client .


# Build your React application (assuming it's a React app)
RUN npm run build

# Expose port 80 to the outside world
EXPOSE 80



# Command to run your application
CMD ["npm", "start"]
