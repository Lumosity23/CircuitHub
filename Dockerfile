# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Copy the docker entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create storage directory
RUN mkdir -p storage

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define environment variable
ENV NODE_ENV=production

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory to the nextjs user
USER nextjs

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["/usr/local/bin/docker-entrypoint.sh", "npm", "start"]