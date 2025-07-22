import { configService } from "@/lib/config";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { and, asc, eq, lt, sql } from "drizzle-orm";

export class KeyService {
  async getNextWorkingKey(): Promise<string | null> {
    const maxFailures = (await configService.get("MAX_FAILURES")) ?? 5;

    const availableKeys = await db
      .select({
        key: apiKeys.key,
      })
      .from(apiKeys)
      .where(
        and(eq(apiKeys.isEnabled, true), lt(apiKeys.failureCount, maxFailures))
      )
      .orderBy(asc(apiKeys.lastUsedAt))
      .limit(1);

    if (availableKeys.length === 0) {
      return null;
    }

    const selectedKey = availableKeys[0].key;

    // Update the last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.key, selectedKey));

    return selectedKey;
  }

  async handleApiFailure(apiKey: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({ failureCount: sql`${apiKeys.failureCount} + 1` })
      .where(eq(apiKeys.key, apiKey));
  }

  async resetKeyFailureCount(apiKey: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({ failureCount: 0 })
      .where(eq(apiKeys.key, apiKey));
  }
}

export const keyService = new KeyService();
