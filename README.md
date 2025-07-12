# Gemini Balance - Next.js Core Implementation

This project is a Next.js implementation of the core functionality found in the original `gemini-balance` Python project. It serves as an intelligent AI gateway that receives OpenAI-compatible API requests and forwards them to Google's Gemini models.

The primary goal of this project is to provide a clear and understandable foundation for Node.js developers to build upon the original concept.

## Core Features

- **OpenAI-Compatible Endpoint**: Provides a familiar API interface at `/api/v1/chat/completions` for seamless integration with existing tools.
- **API Key Load Balancing**: Manages a pool of Gemini API keys, rotating through them in a round-robin fashion to distribute load.
- **Automatic Failover & Retry**: If a request with a specific key fails, it automatically retries with the next available key, enhancing service reliability.
- **Health-Tracking for Keys**: Monitors consecutive failures for each key and temporarily removes a key from the active pool if it exceeds a failure threshold.
- **Streaming Support**: Fully supports streaming responses for real-time chat applications.

## Project Structure & Code Guide

To understand the project, we recommend exploring the files in the following order:

1.  **`src/app/page.tsx`**: The frontend chat interface. A great place to start to see how the client interacts with the API.
2.  **`src/app/api/v1/chat/completions/route.ts`**: The main API route and the heart of the application. This file orchestrates the entire request lifecycle.
3.  **`src/lib/key-manager.ts`**: The `KeyManager` class, which handles all the logic for API key management, rotation, and failure tracking.
4.  **`src/lib/google-adapter.ts`**: A crucial utility that translates data structures between the OpenAI API format and the Google Gemini API format.
5.  **`.env.local`**: The configuration file where you store your API keys.

## Getting Started

Follow these steps to get the project running locally.

### 1. Install Dependencies

Navigate to the project directory and install the necessary packages using `pnpm` (or your preferred package manager).

```bash
cd /path/to/gemini-balance-nextjs
pnpm install
```

### 2. Configure API Keys

- Rename the `.env.example` file to `.env.local`. (If one doesn't exist, create it).
- Open `.env.local` and add your Google Gemini API keys. You can add one or more keys, separated by commas.

```env
# .env.local

# Comma-separated list of Google AI Gemini API keys
GEMINI_API_KEYS=key1,key2,key3

# Maximum number of consecutive failures before a key is marked as invalid
MAX_FAILURES=3
```

### 3. Run the Development Server

Start the Next.js development server.

```bash
pnpm dev
```

### 4. Open the Application

Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

You should see a chat interface. Try sending a message to test the entire system end-to-end. Watch the console in your development server terminal to see the `KeyManager` in action as it selects keys for each request.
