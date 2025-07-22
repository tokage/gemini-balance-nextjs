import { type InferSelectModel } from "drizzle-orm";
import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// 存储所有配置项，如 auth_token, max_failures 等
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// 存储 API 密钥及其状态
export const apiKeys = sqliteTable("api_keys", {
  key: text("key").primaryKey(),
  failureCount: integer("failure_count").default(0).notNull(),
  lastUsedAt: int("last_used_at", { mode: "timestamp" }),
  isEnabled: int("is_enabled", { mode: "boolean" }).default(true).notNull(),
});

// 请求日志
export const requestLogs = sqliteTable("request_logs", {
  id: integer("id").primaryKey(),
  apiKey: text("api_key").notNull(),
  modelName: text("model_name"),
  isSuccess: int("is_success", { mode: "boolean" }).default(true).notNull(),
  statusCode: integer("status_code"),
  latencyMs: integer("latency_ms"),
  createdAt: int("created_at", { mode: "timestamp" }).notNull(),
});

export type RequestLog = InferSelectModel<typeof requestLogs>;

// 错误日志
export const errorLogs = sqliteTable("error_logs", {
  id: integer("id").primaryKey(),
  apiKey: text("api_key"),
  modelName: text("model_name"),
  errorCode: integer("error_code"),
  errorMessage: text("error_message"),
  requestBody: text("request_body"), // 存储 JSON 字符串
  createdAt: int("created_at", { mode: "timestamp" }).notNull(),
});

export type ErrorLog = InferSelectModel<typeof errorLogs>;
