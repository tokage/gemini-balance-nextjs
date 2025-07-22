import { AnyD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// This is a placeholder for the D1 binding.
// In a real Cloudflare Worker environment, you would get this from the context.
// For local development, you might use a local D1 instance or a simulator.
const getD1Binding = (): AnyD1Database => {
  if (!process.env.DB) {
    // Return a mock D1 binding for development
    return {
      prepare: () => ({
        bind: () => ({
          all: () => Promise.resolve({ results: [] }),
          run: () => Promise.resolve({ meta: { changes: 0, last_row_id: 0 } }),
        }),
      }),
    } as AnyD1Database;
  }

  return process.env.DB as AnyD1Database;
};

export const db = drizzle(getD1Binding(), { schema });
