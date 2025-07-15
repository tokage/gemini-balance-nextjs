"use server";

"use server";

"use server";

import { prisma } from "@/lib/db";
import { getKeyManager, resetKeyManager } from "@/lib/key-manager";
import { ParsedSettings, resetSettings } from "@/lib/settings";
import { revalidatePath } from "next/cache";

export async function addApiKeys(keysString: string) {
  if (!keysString) {
    return { error: "No API keys provided." };
  }

  // 1. Process the input string into a clean list of potential keys
  const allSubmittedKeys = keysString
    .split(/[\n,]+/) // Split by newlines or commas
    .map((key) => key.trim())
    .filter(Boolean); // Filter out any empty strings

  if (allSubmittedKeys.length === 0) {
    return { error: "No keys found in the input." };
  }

  // 2. Remove duplicates from the user's input
  const uniqueSubmittedKeys = [...new Set(allSubmittedKeys)];

  try {
    // 3. Find which of the submitted keys already exist in the database
    const existingKeys = await prisma.apiKey.findMany({
      where: {
        key: { in: uniqueSubmittedKeys },
      },
      select: { key: true }, // Only select the key field
    });
    const existingKeySet = new Set(existingKeys.map((k) => k.key));

    // 4. Determine which keys are genuinely new
    const newKeysToAdd = uniqueSubmittedKeys.filter(
      (key) => !existingKeySet.has(key)
    );

    let message = "";

    // 5. Add the new keys if there are any
    if (newKeysToAdd.length > 0) {
      await prisma.apiKey.createMany({
        data: newKeysToAdd.map((key) => ({ key })),
      });
      message += `${newKeysToAdd.length} new key(s) added. `;
      resetKeyManager(); // Invalidate the key manager cache
      revalidatePath("/admin"); // Revalidate the page to show new keys
    } else {
      message += "No new keys were added. ";
    }

    // 6. Report back on duplicates
    const duplicateCount = uniqueSubmittedKeys.length - newKeysToAdd.length;
    if (duplicateCount > 0) {
      message += `${duplicateCount} key(s) were duplicates or already existed.`;
    }

    return { success: message.trim() };
  } catch (_error) {
    console.error("Failed to add API keys:", _error);
    return { error: "Failed to add API keys to the database." };
  }
}

export async function deleteApiKeys(keys: string[]) {
  if (!keys || keys.length === 0) {
    return { error: "No keys provided for deletion." };
  }
  try {
    const deleteResponse = await prisma.apiKey.deleteMany({
      where: { key: { in: keys } },
    });
    resetKeyManager(); // Reset the singleton instance
    revalidatePath("/admin");
    return {
      success: `${deleteResponse.count} API key(s) deleted successfully.`,
    };
  } catch {
    return { error: "Failed to delete API keys." };
  }
}

export async function resetKeysFailures(keys: string[]) {
  if (!keys || keys.length === 0) {
    return { error: "No keys provided for reset." };
  }
  try {
    const keyManager = await getKeyManager();
    keys.forEach((key) => keyManager.resetKeyFailureCount(key));
    revalidatePath("/admin");
    return {
      success: `${keys.length} key(s) failure count reset successfully.`,
    };
  } catch {
    return { error: "Failed to reset key failure counts." };
  }
}

export async function verifyApiKeys(keys: string[]) {
  if (!keys || keys.length === 0) {
    return { error: "No keys provided for verification." };
  }
  try {
    const keyManager = await getKeyManager();
    const results = await Promise.all(
      keys.map(async (key) => {
        const success = await keyManager.verifyKey(key);
        return { key, success };
      })
    );
    revalidatePath("/admin");
    return { success: "Verification process completed.", results };
  } catch {
    return { error: "Failed to verify API keys." };
  }
}

export async function getKeyUsageDetails(apiKey: string) {
  try {
    const totalCalls = await prisma.requestLog.count({
      where: { apiKey: apiKey.slice(-4) },
    });
    const successfulCalls = await prisma.requestLog.count({
      where: { apiKey: apiKey.slice(-4), isSuccess: true },
    });
    const failedCalls = totalCalls - successfulCalls;

    return {
      total: totalCalls,
      success: successfulCalls,
      failed: failedCalls,
    };
  } catch {
    return { error: "Failed to fetch key usage details." };
  }
}

export async function updateSetting(key: string, value: string) {
  try {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    resetSettings(); // 清空配置缓存
    revalidatePath("/admin"); // 重新验证管理页面

    return { success: "Configuration updated successfully!" };
  } catch (error) {
    console.error(`Failed to update setting ${key}:`, error);
    return { error: "Failed to update configuration." };
  }
}

export async function updateSettings(settings: ParsedSettings) {
  try {
    const updates = Object.entries(settings).map(([key, value]) => {
      let dbValue: string;
      if (typeof value === "boolean") {
        dbValue = value.toString();
      } else if (typeof value === "number") {
        dbValue = value.toString();
      } else if (typeof value === "object") {
        dbValue = JSON.stringify(value);
      } else {
        dbValue = value;
      }
      return prisma.setting.upsert({
        where: { key },
        update: { value: dbValue },
        create: { key, value: dbValue },
      });
    });

    await prisma.$transaction(updates);

    resetSettings();
    resetKeyManager(); // Also reset key manager in case MAX_FAILURES changed
    revalidatePath("/admin/config");
    revalidatePath("/admin");

    return { success: "Configuration updated successfully!" };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return { error: "Failed to update settings." };
  }
}

// Log Management Actions

type LogType = "request" | "error";

interface LogFilters {
  logType: LogType;
  search?: string;
  page?: number;
  limit?: number;
}

type RequestLogWhere = import("@prisma/client").Prisma.RequestLogWhereInput;
type ErrorLogWhere = import("@prisma/client").Prisma.ErrorLogWhereInput;

export async function getLogs(filters: LogFilters) {
  const { logType, search, page = 1, limit = 10 } = filters;

  try {
    if (logType === "request") {
      const where: RequestLogWhere = {};
      if (search) {
        where.apiKey = { contains: search };
      }
      const total = await prisma.requestLog.count({ where });
      const logs = await prisma.requestLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { logs, total, error: null };
    } else {
      const where: ErrorLogWhere = {};
      if (search) {
        where.OR = [
          { apiKey: { contains: search } },
          { errorType: { contains: search } },
          { errorMessage: { contains: search } },
        ];
      }
      const total = await prisma.errorLog.count({ where });
      const logs = await prisma.errorLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { logs, total, error: null };
    }
  } catch (_error) {
    const errorMessage = `Failed to fetch ${logType} logs.`;
    console.error(errorMessage, _error);
    return { logs: [], total: 0, error: errorMessage };
  }
}

export async function deleteLogs(logIds: number[], logType: LogType) {
  try {
    let response;
    if (logType === "request") {
      response = await prisma.requestLog.deleteMany({
        where: { id: { in: logIds } },
      });
    } else {
      response = await prisma.errorLog.deleteMany({
        where: { id: { in: logIds } },
      });
    }
    revalidatePath("/admin");
    return { success: `${response.count} log(s) deleted.` };
  } catch (_error) {
    console.error(`Failed to delete ${logType} logs:`, _error);
    return { error: `Failed to delete ${logType} logs.` };
  }
}

export async function clearAllLogs(logType: LogType) {
  try {
    if (logType === "request") {
      await prisma.requestLog.deleteMany({});
    } else {
      await prisma.errorLog.deleteMany({});
    }
    revalidatePath("/admin");
    return { success: `All ${logType} logs cleared.` };
  } catch (_error) {
    console.error(`Failed to clear ${logType} logs:`, _error);
    return { error: `Failed to clear ${logType} logs.` };
  }
}
