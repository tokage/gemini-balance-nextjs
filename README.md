# Gemini Balance Next.js

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fgemini-balance-nextjs)

This is a Next.js port of the original [Gemini Balance](https://github.com/gemini-im/gemini-balance), a load-balancing proxy for Google Gemini Pro API keys. This version is designed to be deployed on the edge (Vercel/Cloudflare) for minimal latency and cost.

## Features

- **OpenAI-Compatible API**: Use your favorite OpenAI clients with the Gemini Pro model.
- **Load Balancing**: Distributes requests across multiple Gemini API keys.
- **Fault Tolerance**: Automatically retries requests with a different key on failure.
- **Edge-First**: Optimized for serverless deployment on Vercel and Cloudflare.
- **Modern UI**: A sleek and responsive admin dashboard built with Next.js App Router and shadcn/ui.

## Getting Started

### 1. Prerequisites

- Node.js (v18 or later)
- pnpm
- A Vercel or Cloudflare account

### 2. Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/gemini-balance-nextjs.git
    cd gemini-balance-nextjs
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```

### 3. Local Development

1.  Set up your database. For local development, you can use a local SQLite database. Create a `.env` file and add the following:
    ```
    DATABASE_URL="file:./local.db"
    ```
2.  Run the database migrations:
    ```bash
    pnpm drizzle-kit push:sqlite
    ```
3.  Start the development server:
    ```bash
    pnpm dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) to access the admin dashboard.

## Deployment

### Vercel (Recommended)

1.  Click the "Deploy with Vercel" button above.
2.  Follow the instructions to create a new project.
3.  Add a Vercel KV database and connect it to your project.
4.  Set the `DATABASE_URL` environment variable to the one provided by Vercel KV.
5.  Deploy!

### Cloudflare

1.  Create a new Cloudflare Pages project and connect it to your Git repository.
2.  Create a new D1 database.
3.  Add the D1 binding to your Pages project.
4.  Set the `DATABASE_URL` environment variable to the one provided by D1.
5.  Deploy!

## License

This project is licensed under the MIT License.
