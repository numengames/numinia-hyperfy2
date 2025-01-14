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

The project can be run using Docker. Make sure you have Docker installed on your system.

1. Build the image and run the container:

```bash
docker build -t hyperfydemo . && docker run -d -p 3000:3000 --env-file ./.env \
  -v "$(pwd)/src:/app/src" \
  -v "$(pwd)/world:/app/world" \
  hyperfydemo
```

This command:
- Builds the Docker image tagged as 'hyperfydemo'
- Mounts local src/, world/ directories and .env file into the container
- Exposes port 3000
- Sets up required environment variables
- Runs the container in detached mode (-d)

Note: Adjust the URLs and domain according to your specific setup.


