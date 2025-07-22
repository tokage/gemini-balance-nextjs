import { keyService } from "./key.service";

// region: Types
interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAIChatRequest {
  messages: OpenAIMessage[];
  // Other properties like model, temperature, etc. are omitted for now
}

interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

interface GeminiSystemInstruction {
  role: "system";
  parts: { text: string }[];
}

interface GeminiChatRequest {
  contents: GeminiContent[];
  systemInstruction?: GeminiSystemInstruction;
}

export interface GeminiChatResponse {
  candidates: {
    content: {
      parts: { text: string }[];
      role: "model";
    };
    finishReason: "STOP" | "MAX_TOKENS" | "SAFETY" | "RECITATION" | "OTHER";
    index: number;
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  }[];
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

interface OpenAIChatCompletion {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason:
      | "stop"
      | "length"
      | "function_call"
      | "content_filter"
      | "null";
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
// endregion: Types

export class ChatService {
  async createCompletion(
    request: OpenAIChatRequest,
    requestOptions: { model: string }
  ): Promise<OpenAIChatCompletion> {
    const geminiRequest = this.convertOpenAIMessagesToGemini(request.messages);
    const apiKey = await keyService.getNextWorkingKey();

    if (!apiKey) {
      throw new Error("No available API keys");
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${requestOptions.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(geminiRequest),
      }
    );

    if (!geminiResponse.ok) {
      await keyService.handleApiFailure(apiKey);
      throw new Error(
        `Gemini API request failed: ${geminiResponse.statusText}`
      );
    }

    const geminiData = await geminiResponse.json();
    return this.convertGeminiResponseToOpenAI(geminiData, requestOptions.model);
  }

  private convertOpenAIMessagesToGemini(
    messages: OpenAIMessage[]
  ): GeminiChatRequest {
    const geminiRequest: GeminiChatRequest = { contents: [] };
    const systemMessage = messages.find((msg) => msg.role === "system");

    if (systemMessage) {
      geminiRequest.systemInstruction = {
        role: "system",
        parts: [{ text: systemMessage.content }],
      };
    }

    geminiRequest.contents = messages
      .filter((msg) => msg.role !== "system")
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    return geminiRequest;
  }

  private convertGeminiResponseToOpenAI(
    geminiResponse: GeminiChatResponse,
    model: string = ""
  ): OpenAIChatCompletion {
    const now = Math.floor(Date.now() / 1000);
    const choice = geminiResponse.candidates?.[0];

    const finishReasonMap: Record<
      GeminiChatResponse["candidates"][0]["finishReason"],
      OpenAIChatCompletion["choices"][0]["finish_reason"]
    > = {
      STOP: "stop",
      MAX_TOKENS: "length",
      SAFETY: "content_filter",
      RECITATION: "content_filter",
      OTHER: "stop",
    };

    return {
      id: `chatcmpl-${now}`, // Simple timestamp-based ID
      object: "chat.completion",
      created: now,
      model: model,
      choices: choice
        ? [
            {
              index: 0,
              message: {
                role: "assistant",
                content: choice.content.parts[0].text,
              },
              finish_reason: finishReasonMap[choice.finishReason] || "stop",
            },
          ]
        : [],
      usage: {
        prompt_tokens: geminiResponse.usageMetadata.promptTokenCount,
        completion_tokens:
          geminiResponse.usageMetadata.candidatesTokenCount || 0,
        total_tokens: geminiResponse.usageMetadata.totalTokenCount,
      },
    };
  }

  async createStreamCompletion(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: OpenAIChatRequest
  ): Promise<ReadableStream> {
    // TODO: Implement streaming chat completion logic
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue("data: [DONE]\n\n");
        controller.close();
      },
    });
    return stream;
  }
}

export const chatService = new ChatService();
