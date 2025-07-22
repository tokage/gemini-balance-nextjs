import { configService } from "@/lib/config";
import { keyService } from "@/lib/services/key.service";

type Handler<T> = (apiKey: string) => Promise<T>;

export async function withRetryHandling<T>(handler: Handler<T>): Promise<T> {
  const maxRetries = (await configService.get("MAX_RETRIES")) ?? 3;

  for (let i = 0; i < maxRetries; i++) {
    const apiKey = await keyService.getNextWorkingKey();
    if (!apiKey) {
      throw new Error("No available API keys after multiple retries.");
    }

    try {
      const result = await handler(apiKey);
      return result;
    } catch (error) {
      await keyService.handleApiFailure(apiKey);
      if (i === maxRetries - 1) {
        // Last retry failed, rethrow the error
        throw error;
      }
    }
  }

  throw new Error("Max retries reached, but no result was returned.");
}
