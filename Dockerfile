FROM node:22 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build; exit 0

# Stage 2: Run
FROM node:22

# Set the working directory
WORKDIR /app

# Install AWS CLI
RUN apt-get update && apt-get install -y \
    awscli \
    && rm -rf /var/lib/apt/lists/*

# Copy the build folder from the previous stage
COPY --from=build /app/build ./build

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Copy src directory maintaining structure
COPY src ./src

# Install PM2 globally and production dependencies
RUN npm install -g pm2 && npm ci --only=production

# Create startup script
RUN echo '#!/bin/sh\n\
    echo "🔄 Running configuration script..."\n\
    node --experimental-vm-modules /app/src/scripts/load-pm2-ecosystem-file/index.mjs\n\
    exec pm2-runtime ecosystem.config.json' > /app/start.sh && \
    chmod +x /app/start.sh

# Expose the port the app runs on
EXPOSE 3000-3004

# Start the application with debug logging
CMD ["/app/start.sh"]
