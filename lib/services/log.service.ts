import { db } from "@/lib/db";
import {
  errorLogs,
  InsertErrorLog,
  InsertRequestLog,
  requestLogs,
} from "@/lib/db/schema";

class LogService {
  async recordRequest(log: InsertRequestLog) {
    try {
      await db.insert(requestLogs).values(log);
    } catch (error) {
      console.error("Failed to record request log:", error);
    }
  }

  async recordError(log: InsertErrorLog) {
    try {
      await db.insert(errorLogs).values(log);
    } catch (error) {
      console.error("Failed to record error log:", error);
    }
  }
}

export const logService = new LogService();
