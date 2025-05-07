# Use the official Node.js image as the base image
FROM node:20-alpine as build

ARG VITE_PUBLIC_URL

# Set the environment variable
ENV VITE_PUBLIC_URL=$VITE_PUBLIC_URL

# Set the working directory
WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the production version of the app
RUN npm run build

# Use Nginx to serve the production build
FROM nginx:stable-alpine

# Copy the build output from the Node.js container
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf

# Copy the Nginx configuration file
COPY nginx/nginx.conf /etc/nginx/conf.d

# Expose port 80
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
