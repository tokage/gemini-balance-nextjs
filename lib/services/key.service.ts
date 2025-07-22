import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export class KeyService {
  async getNextWorkingKey(): Promise<string | null> {
    // TODO: Implement LRU or random selection logic
    return null;
  }

  async handleApiFailure(apiKey: string): Promise<void> {
    // TODO: Implement atomic failure count increment
  }

  async resetKeyFailureCount(apiKey: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({ failureCount: 0 })
      .where(eq(apiKeys.key, apiKey));
  }
}

export const keyService = new KeyService();
