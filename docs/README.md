# Gemini Balance - Next.js Edition

You can read this document in [Chinese](README_ZH.md).

This project is a high-performance, feature-rich Next.js implementation inspired by the `gemini-balance` Python project. It functions as an intelligent AI gateway, receiving requests through multiple API formats (including OpenAI-compatible) and routing them to Google's Gemini models.

This version goes beyond a simple proxy, offering a robust feature set including a management dashboard, persistent configuration, and advanced authentication, making it a powerful and flexible solution for developers.

## Important Notes

- **Origin & Acknowledgment**: This project is a Next.js implementation of the original Python project [gemini-balance](https://github.com/snailyp/gemini-balance). Special thanks to the original author for the inspiration. It currently implements the core API forwarding and management capabilities, with other features under active development.
- **AI-Generated**: With the exception of this notice, all code and documentation in this project were written by Google's Gemini model.
- **Contributions**: Pull requests are welcome! Please note that PRs will also be reviewed and managed by an AI.
- **Maintenance**: The author is not a Python developer and is unfamiliar with the intricacies of the original project. Future updates and maintenance will be handled by the AI model.

## Core Features

- **Multi-API Interface**:
  - **`/v1beta` & `/gemini`**: Gemini-native proxy endpoints with flexible authentication (API key in URL, `x-goog-api-key` header, or Bearer token).
  - **`/openai`**: An OpenAI-compatible endpoint that requires strict Bearer token authentication.
- **Intelligent Load Balancing**: Manages a pool of Gemini API keys, rotating them to distribute request loads.
- **Automatic Failover & Retry**: If a request fails, it automatically retries with the next available key, ensuring high availability.
- **Persistent Health Tracking**: Monitors key failures, automatically sidelining failing keys and syncing their status to a persistent database.
- **Web UI & Management Dashboard**:
  - A simple chat interface for testing.
  - An admin dashboard at `/admin` to view key status, manage settings, and monitor logs.
- **Database Persistence**: Uses Prisma and a SQLite database to store API keys and application settings.
- **Secure Authentication**:
  - Protects the admin dashboard with a dedicated `AUTH_TOKEN`.
  - Secures API endpoints with a flexible system of `ALLOWED_TOKENS`.

## Project Structure & Code Guide

To understand the project, we recommend exploring the files in the following order:

1.  **`src/middleware.ts`**: The entry point for all incoming requests. This file handles routing and authentication logic, directing traffic to the correct handler based on the path.
2.  **`src/lib/gemini-proxy.ts`**: The core proxying logic. It receives requests from the API routes, retrieves a working API key, and forwards the request to the Google Gemini API.
3.  **`src/lib/key-manager.ts`**: The `KeyManager` class, responsible for all API key management, including loading keys from the environment and database, rotation, and failure tracking.
4.  **`src/app/{gemini,openai,v1beta}`**: Directories containing the API routes. These routes are lightweight and delegate all logic to the middleware and proxy.
5.  **`src/app/admin`**: The code for the admin dashboard, including the UI components and server-side actions for managing the application.
6.  **`prisma/schema.prisma`**: Defines the database schema for storing API keys and settings.

## Getting Started

Follow these steps to get the project running locally.

### 1. Install Dependencies

Navigate to the project directory and install the necessary packages.

```bash
pnpm install
```

### 2. Initialize the Database

This project uses Prisma for database management. Run the following command to create the SQLite database and apply the schema.

```bash
pnpm prisma migrate dev
```

This will create a `prisma/dev.db` file.

### 3. Configure Environment Variables

- Create a `.env.local` file by copying the example: `cp .env.example .env.local`.
- Open `.env.local` and set the following variables:

```env
# .env.local

# 1. Gemini API Keys (Required)
# Comma-separated list of your Google AI Gemini API keys.
# These are loaded into the database on the first run.
GEMINI_API_KEYS=your_gemini_key_1,your_gemini_key_2

# 2. Admin Dashboard Authentication Token (Required)
# A secret token to access the admin panel at /admin.
AUTH_TOKEN=a_strong_and_secret_token_for_ui

# 3. API Access Tokens (Optional)
# Comma-separated list of tokens allowed to access the API endpoints.
# If you leave this blank, you can still use your AUTH_TOKEN for API access.
ALLOWED_TOKENS=user_token_1,user_token_2

# 4. Google API Host (Optional, Default: https://generativelanguage.googleapis.com)
# Can be overridden to use a proxy or a different regional endpoint.
GOOGLE_API_HOST=https://generativelanguage.googleapis.com

# 5. Key Failure Threshold (Optional, Default: 3)
# Maximum number of consecutive failures before a key is marked as invalid.
MAX_FAILURES=3

# 6. Proxy URL (Optional)
# If your server is in a region not supported by the Gemini API,
# you can provide an HTTP/HTTPS proxy URL to route requests through.
# Example: PROXY_URL=http://user:pass@host:port
PROXY_URL=
```

### 4. Run the Development Server

Start the Next.js development server.

```bash
pnpm dev
```

## Deployment with Docker

This project is a **stateful application** that requires a database. The provided `Dockerfile` is optimized for production deployment using Next.js's `standalone` output mode, and includes a robust mechanism for automated database migration.

### Production Deployment (e.g., with Coolify)

This is the recommended way to run the application in production.

#### 1. Deployment Principles

- **Standalone Output**: The `Dockerfile` leverages Next.js's `output: "standalone"` feature to create a minimal, production-optimized image. The `next.config.ts` is configured to correctly trace and include the necessary Prisma files in this output.
- **Automated Migrations & Permissions**: The image uses an `entrypoint.sh` script to solve critical deployment challenges:
  1.  It runs as `root` initially to fix permissions on the data volume that may be mounted by the deployment platform.
  2.  It then runs database migrations (`npx prisma migrate deploy`) as the non-root `nextjs` user.
  3.  Finally, it starts the application server as the non-root `nextjs` user.
- **Separation of Data and Configuration**: The application is designed to store its database in a dedicated `/app/data` directory, while Prisma's configuration files remain in `/app/prisma`. This separation is key to enabling persistent data storage without deployment errors.

#### 2. Deployment Platform Configuration (Coolify Example)

When deploying the pre-built image from GitHub Container Registry, you need to configure two crucial settings in your deployment service:

1.  **Volume Mount**:

    - Mount a persistent volume to the container's `/app/data` directory.
    - **Source**: `your_persistent_storage` (e.g., a volume managed by Coolify)
    - **Target/Mount Path**: `/app/data`
    - **CRITICAL**: Do **not** mount a volume to `/app/prisma`. Mounting a volume to `/app/prisma` will hide the schema file built into the image and cause the migration to fail.

2.  **Environment Variables**:
    - Set `DATABASE_URL` to point to the database file **inside the volume**. The required value is `file:/app/data/prod.db`.
    - Set all other required environment variables (`GEMINI_API_KEYS`, `AUTH_TOKEN`, etc.).

#### 3. Local Development with Docker Compose

For local testing that mimics the production setup, you can use the provided `docker-compose.yml` file.

```bash
# 1. Make sure you have a .env file with your variables
cp .env.local .env

# 2. Build and run the container in the background
docker-compose up --build -d
```

The `docker-compose.yml` is pre-configured to use the production deployment strategy: it mounts a local `./data` directory to the container's `/app/data` and sets the `DATABASE_URL` accordingly. The `entrypoint.sh` script will handle the database migration automatically on the first start.

## CI/CD with GitHub Actions

This project includes a GitHub Actions workflow to automatically build and push a Docker image to the **GitHub Container Registry (ghcr.io)** whenever changes are pushed to the `master` branch.

### 1. Fork the Repository

First, fork this repository to your own GitHub account.

### 2. Configure GitHub Secrets

The workflow requires several secrets to be configured in your GitHub repository's settings (`Settings` > `Secrets and variables` > `Actions`) to build the image and trigger deployments.

**Required for Docker Build:**
These secrets are passed as build arguments to Docker, embedding them into your image.

- `GEMINI_API_KEYS`: Comma-separated list of your Gemini API keys.
- `AUTH_TOKEN`: A secret token for the admin dashboard.
- `DATABASE_URL`: The connection string for your database. For production, this should point to a file in a persistent volume, e.g., `file:/app/data/prod.db`.
- `ALLOWED_TOKENS` (Optional): Comma-separated list of API access tokens.
- `MAX_FAILURES` (Optional): Key failure threshold.
- `GOOGLE_API_HOST` (Optional): Custom Google API host.

**For Auto-Redeployment (Optional):**
If you use a hosting service like Coolify, you can configure webhooks to automatically redeploy your application when a new image is pushed.

- `COOLIFY_WEBHOOK`: The webhook URL provided by Coolify.
- `COOLIFY_TOKEN`: The authentication token for the Coolify webhook.

### 3. How It Works

- The workflow is defined in `.github/workflows/deploy.yml`.
- On every push to the `master` branch, the action will:
  1. Check out the code.
  2. Log in to the GitHub Container Registry (`ghcr.io`).
  3. Build the Docker image, injecting the secrets you configured.
  4. Push the image to `ghcr.io`, tagging it as `ghcr.io/YOUR_USERNAME/gemini-balance-nextjs:latest` and other git-based tags.
  5. (Optional) Trigger a redeployment on your hosting service via the configured webhook.

You can then pull this image on your server or configure your hosting service to automatically pull from `ghcr.io` to deploy the latest version.

### 5. Explore the Application

- **Admin Dashboard**: Open [http://localhost:3000/admin](http://localhost:3000/admin) and log in with your `AUTH_TOKEN`. Here you can see the status of your `GEMINI_API_KEYS`.
- **API Endpoints**: Use a tool like `curl` or Postman to interact with the API endpoints, providing a token from `ALLOWED_TOKENS` or your `AUTH_TOKEN`.

**Example `curl` for Gemini/v1beta:**

```bash
curl -X POST http://localhost:3000/v1beta/models/gemini-pro:generateContent?key=user_token_1 \
-H "Content-Type: application/json" \
-d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

**Example `curl` for OpenAI:**

```bash
curl -X POST http://localhost:3000/openai/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer user_token_1" \
-d '{"model": "gemini-pro", "messages": [{"role": "user", "content": "Hello!"}]}'
```
