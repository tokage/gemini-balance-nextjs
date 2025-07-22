import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// This is a placeholder for the D1 binding.
// In a real Cloudflare Worker environment, you would get this from the context.
// For local development, you might use a local D1 instance or a simulator.
const getD1Binding = () => {
  // This is a simplified mock. In a real scenario, process.env.DB would be
  // provided by the Cloudflare environment.
  if (!process.env.DB) {
    throw new Error("D1 binding not found. Make sure to bind a D1 database.");
  }
  return process.env.DB;
};

export const db = drizzle(getD1Binding(), { schema });
