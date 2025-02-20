FROM node:22-alpine
RUN apk add --no-cache curl

# Set the working directory
WORKDIR /app
# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .
COPY .env.example .env

RUN npm run build || exit 0

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

# Install only production dependencies
RUN npm install -g pm2 \
    && npm install --only=production

# Create startup script
RUN echo '#!/bin/sh\n\
    echo "🔄 Running configuration script..."\n\
    node --experimental-vm-modules /app/src/scripts/index.mjs\n\
    \n\
    # Wait for .env file to exist and be readable\n\
    echo "⏳ Waiting for .env file..."\n\
    while [ ! -f /app/.env ] || [ ! -r /app/.env ]; do\n\
    sleep 5\n\
    done\n\
    echo "✅ .env file is ready"\n\
    \n\
    # Start PM2\n\
    echo "🚀 Starting PM2..."\n\
    exec pm2-runtime ecosystem.config.json' > /app/start.sh && \
    chmod +x /app/start.sh

# Create empty .env file
RUN touch .env

ARG COMMIT_HASH=local
ENV COMMIT_HASH=${COMMIT_HASH:-local}

# Expose the port the app runs on
EXPOSE 3000-3004

# Healthcheck using curl
HEALTHCHECK --interval=2s --timeout=10s --start-period=5s --retries=5 \
  CMD curl -f http://localhost:3000/status || exit 1

# Start the application
CMD [ "npm", "run", "start" ]
