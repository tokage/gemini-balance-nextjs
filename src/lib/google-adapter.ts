/**
 * This adapter module provides functions to convert data structures
 * between the OpenAI Chat Completions API format and the Google Gemini API format.
 */

// --- Type Definitions (simplified for clarity) ---

// OpenAI-like request format
export interface OpenAIChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface OpenAIChatRequest {
  messages: OpenAIChatMessage[];
  model: string;
  stream?: boolean;
  // Other properties like temperature, max_tokens, etc. are omitted for simplicity
}

// Gemini-like request format
export interface GeminiPart {
  text: string;
}

export interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

export interface GeminiRequest {
  contents: GeminiContent[];
  // generationConfig, safetySettings, etc.
}

/**
 * Converts an array of OpenAI-formatted messages to Gemini-formatted contents.
 *
 * - Merges consecutive messages from the same role.
 * - Handles the "system" role by prepending its content to the next user message.
 * - Ensures alternating "user" and "model" roles as required by Gemini.
 *
 * @param messages - An array of OpenAI chat messages.
 * @returns An array of Gemini content objects.
 */
export function openAiToGeminiRequest(
  messages: OpenAIChatMessage[]
): GeminiContent[] {
  const contents: GeminiContent[] = [];
  let systemPrompt: string | null = null;
  let lastRole: "user" | "model" | null = null;

  for (const message of messages) {
    if (message.role === "system") {
      systemPrompt =
        (systemPrompt ? systemPrompt + "\n" : "") + message.content;
      continue;
    }

    // Gemini roles are 'user' and 'model'
    const currentRole = message.role === "assistant" ? "model" : "user";

    // Prepend system prompt to the first user message
    let content = message.content;
    if (currentRole === "user" && systemPrompt) {
      content = `${systemPrompt}\n\n${content}`;
      systemPrompt = null; // Only use it once
    }

    if (lastRole === currentRole) {
      // Merge with the previous message if roles are the same
      const lastContent = contents[contents.length - 1];
      lastContent.parts.push({ text: `\n${content}` });
    } else {
      contents.push({
        role: currentRole,
        parts: [{ text: content }],
      });
      lastRole = currentRole;
    }
  }

  return contents;
}

/**
 * Converts a chunk of a Gemini API stream response into an OpenAI-compatible
 * Server-Sent Event (SSE) chunk.
 *
 * @param geminiChunk - A chunk from the Gemini API response.
 * @param model - The model name to include in the response.
 * @returns A string formatted as an OpenAI-compatible SSE chunk.
 */
export function geminiToOpenAiStreamChunk(
  geminiChunk: any,
  model: string
): string {
  const choice = {
    index: 0,
    delta: {
      content: geminiChunk.candidates?.[0]?.content?.parts?.[0]?.text || "",
    },
    finish_reason: geminiChunk.candidates?.[0]?.finishReason || null,
  };

  const streamData = {
    id: `chatcmpl-${Date.now()}`,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [choice],
  };

  return `data: ${JSON.stringify(streamData)}\n\n`;
}
