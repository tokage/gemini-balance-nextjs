import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";

// Define a type for all possible settings to ensure type safety
type AppConfig = {
  AUTH_TOKEN: string;
  MAX_FAILURES: number;
  MAX_RETRIES: number;
  // Add other settings keys here as needed
};

class ConfigService {
  private config: Partial<AppConfig> = {};
  private isInitialized = false;

  private async initialize() {
    if (this.isInitialized) return;

    const allSettings = await db.select().from(settings);
    for (const setting of allSettings) {
      this.config[setting.key as keyof AppConfig] = this.parseValue(
        setting.key as keyof AppConfig,
        setting.value
      );
    }
    this.isInitialized = true;
  }

  private parseValue(key: keyof AppConfig, value: string): any {
    switch (key) {
      case "MAX_FAILURES":
      case "MAX_RETRIES":
        return parseInt(value, 10);
      default:
        return value;
    }
  }

  public async get<T extends keyof AppConfig>(
    key: T
  ): Promise<AppConfig[T] | undefined> {
    await this.initialize();
    return this.config[key];
  }
}

export const configService = new ConfigService();
