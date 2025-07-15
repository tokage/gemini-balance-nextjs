import { prisma as db } from "@/lib/db";
import logger from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * Extracts the API key from the request headers or query parameters.
 * @param request - The NextRequest object.
 * @returns The API key string or null if not found.
 */
function getApiKey(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  const keyFromQuery = request.nextUrl.searchParams.get("key");
  if (keyFromQuery) {
    return keyFromQuery;
  }

  return null;
}

/**
 * Checks if the request is authenticated by validating the API key.
 * If the key is valid, it returns null.
 * If the key is invalid or missing, it returns a NextResponse object with a 401 status.
 * @param request - The NextRequest object.
 * @returns A promise that resolves to null or a NextResponse object.
 */
export async function isAuthenticated(
  request: NextRequest
): Promise<NextResponse | null> {
  const apiKey = getApiKey(request);

  if (!apiKey) {
    logger.warn("Authentication failed: No API key provided.");
    return new NextResponse(
      JSON.stringify({
        error: {
          message: "Unauthorized. Please provide an API key.",
          type: "authentication_error",
          code: "api_key_missing",
        },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const keyExists = await db.apiKey.findUnique({
      where: { key: apiKey },
    });

    if (keyExists) {
      // The key is valid.
      return null;
    } else {
      logger.warn(
        `Authentication failed: Invalid API key provided: ${apiKey.substring(
          0,
          8
        )}...`
      );
      return new NextResponse(
        JSON.stringify({
          error: {
            message:
              "Incorrect API key provided. You can find your API key at https://platform.openai.com/account/api-keys.",
            type: "invalid_request_error",
            code: "invalid_api_key",
          },
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    logger.error({ error }, "Database error during API key validation.");
    return new NextResponse(
      JSON.stringify({
        error: {
          message: "Internal server error during authentication.",
          type: "server_error",
          code: "auth_db_error",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
