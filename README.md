# Hyperfy ⚡️

## Overview

<div align="center">
  <img src="overview.png" alt="Hyperfy Ecosystem" width="100%" />
</div>

## 🧬 Features

- Standalone persistent world
- Host them on your own domain
- Connect via Hyperfy for portable avatars
- Realtime content creation in-world
- Realtime coding in-world (for devs)
- Fully interactive and interoperable app format
- Highly extensible

## 🦹‍♀️ Use Cases

- Live events
- Storefronts
- Podcasts
- Gaming
- Social

## 🚀 Quick Start

### Prerequisites

- Node 22.11.0+ (eg via nvm)

### Install

```bash
git clone https://github.com/hyperfy-xyz/hyperfy.git my-world
cd my-world
cp .env.example .env
npm install
npm run dev
```

## 🌱 Alpha

This project is still in alpha as we transition all of our [reference platform](https://github.com/hyperfy-xyz/hyperfy-ref) code into fully self hostable worlds.
Most features are already here in this repo but still need to be connected up to work with self hosting in mind.
Note that APIs are highly likely to change during this time.

## 🔄 Syncing with upstream

To keep your fork in sync with the main repository, follow these steps:

1. Add the original repository as upstream (you only need to do this once):
```bash
git remote add upstream https://github.com/original-repo/hyperfy2.git
```

2. Verify the upstream was added correctly:
```bash
git remote -v
```

3. Fetch the latest changes from upstream:
```bash
git fetch upstream
```

4. Make sure you're on your main branch:
```bash
git checkout main
```

5. Merge upstream changes into your local branch:
```bash
git merge upstream/main
```

## 🐳 Docker Deployment

The project can be run using Docker in two different ways: production mode and development mode.

### Production Mode

This mode is for production deployments where the source code is packaged inside the image:

```bash
docker build -t hyperfy . && docker run -d -p 3000:3000 --env-file ./.env -v "$(pwd)/world:/app/world" hyperfy
```

This command:
- Builds the Docker image with the 'hyperfy' tag
- Mounts only the `world/` directory from the host
- Loads environment variables from the `.env` file
- Exposes port 3000
- Runs the container in detached mode (-d)

### Development Mode

This mode is ideal for development as it allows real-time source code modifications:

```bash
docker build -t hyperfy-dev -f Dockerfile-dev . && docker run -d -p 3000:3000 --env-file ./.env -v "$(pwd)/world:/app/world" -v "$(pwd)/src:/app/src" hyperfy-dev
```

This command:
- Uses `Dockerfile-dev` specific for development
- Builds the Docker image with the 'hyperfy-dev' tag
- Mounts the `src/` directory from the host, allowing real-time code modifications
- Mounts the `world/` directory for data persistence
- Loads environment variables from the `.env` file
- Exposes port 3000
- Runs the container in detached mode (-d)

### Environment Variables

Make sure your `.env` file includes:
- `NODE_ENV=server` - Required for proper environment variables loading
- All other required variables as shown in `.env.example`

### Volumes

- `/app/world`: Stores persistent world data
- `/app/src`: (Development mode only) Contains the application source code

Note: Adjust the URLs and domain according to your specific setup.


