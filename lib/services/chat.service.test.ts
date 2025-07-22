import { describe, expect, it } from "vitest";
import type { GeminiChatResponse } from "./chat.service";
import { ChatService } from "./chat.service";

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Helper class to expose the private method for testing
class TestableChatService extends ChatService {
  public testConvertOpenAIMessagesToGemini(messages: OpenAIMessage[]) {
    // @ts-expect-error - Accessing private method for testing
    return this.convertOpenAIMessagesToGemini(messages);
  }

  public testConvertGeminiResponseToOpenAI(geminiResponse: GeminiChatResponse) {
    // @ts-expect-error - Accessing private method for testing
    return this.convertGeminiResponseToOpenAI(geminiResponse);
  }
}

describe("ChatService", () => {
  const chatService = new TestableChatService();

  describe("convertOpenAIMessagesToGemini", () => {
    it("should convert messages without a system message correctly", () => {
      const openAIMessages: OpenAIMessage[] = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
        { role: "user", content: "How are you?" },
      ];

      const expectedGeminiRequest = {
        contents: [
          { role: "user", parts: [{ text: "Hello" }] },
          { role: "model", parts: [{ text: "Hi there!" }] },
          { role: "user", parts: [{ text: "How are you?" }] },
        ],
      };

      const result =
        chatService.testConvertOpenAIMessagesToGemini(openAIMessages);
      expect(result).toEqual(expectedGeminiRequest);
    });

    it("should handle a system message correctly", () => {
      const openAIMessages: OpenAIMessage[] = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello" },
      ];

      const expectedGeminiRequest = {
        systemInstruction: {
          role: "system",
          parts: [{ text: "You are a helpful assistant." }],
        },
        contents: [{ role: "user", parts: [{ text: "Hello" }] }],
      };

      const result =
        chatService.testConvertOpenAIMessagesToGemini(openAIMessages);
      expect(result).toEqual(expectedGeminiRequest);
    });

    it("should handle an empty message array", () => {
      const openAIMessages: OpenAIMessage[] = [];
      const expectedGeminiRequest = {
        contents: [],
      };
      const result =
        chatService.testConvertOpenAIMessagesToGemini(openAIMessages);
      expect(result).toEqual(expectedGeminiRequest);
    });
  });

  describe("convertGeminiResponseToOpenAI", () => {
    it("should convert a standard Gemini response to the OpenAI format", () => {
      const geminiResponse: GeminiChatResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: "Hello, world!" }],
              role: "model",
            },
            finishReason: "STOP",
            index: 0,
            safetyRatings: [
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                probability: "NEGLIGIBLE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                probability: "NEGLIGIBLE",
              },
              {
                category: "HARM_CATEGORY_HARASSMENT",
                probability: "NEGLIGIBLE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                probability: "NEGLIGIBLE",
              },
            ],
          },
        ],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 20,
          totalTokenCount: 30,
        },
      };

      const result =
        chatService.testConvertGeminiResponseToOpenAI(geminiResponse);

      expect(result.id).toMatch(/^chatcmpl-/); // Check if ID has the correct prefix
      expect(result.object).toBe("chat.completion");
      expect(result.created).toBeCloseTo(Date.now() / 1000, -2);
      expect(result.model).toBe(""); // As per proposal, model is not part of the conversion
      expect(result.choices).toHaveLength(1);
      expect(result.choices[0].index).toBe(0);
      expect(result.choices[0].message.role).toBe("assistant");
      expect(result.choices[0].message.content).toBe("Hello, world!");
      expect(result.choices[0].finish_reason).toBe("stop");
      expect(result.usage.prompt_tokens).toBe(10);
      expect(result.usage.completion_tokens).toBe(20);
      expect(result.usage.total_tokens).toBe(30);
    });

    it("should handle Gemini response with no candidates", () => {
      const geminiResponse: GeminiChatResponse = {
        candidates: [],
        usageMetadata: {
          promptTokenCount: 5,
          candidatesTokenCount: 0,
          totalTokenCount: 5,
        },
      };

      const result =
        chatService.testConvertGeminiResponseToOpenAI(geminiResponse);

      expect(result.choices).toHaveLength(0);
      expect(result.usage.prompt_tokens).toBe(5);
      expect(result.usage.completion_tokens).toBe(0);
      expect(result.usage.total_tokens).toBe(5);
    });

    it("should map finishReason correctly", () => {
      const geminiResponse: GeminiChatResponse = {
        candidates: [
          {
            content: { parts: [{ text: "..." }], role: "model" },
            finishReason: "MAX_TOKENS",
            index: 0,
            safetyRatings: [],
          },
        ],
        usageMetadata: {
          promptTokenCount: 1,
          candidatesTokenCount: 1,
          totalTokenCount: 2,
        },
      };

      const result =
        chatService.testConvertGeminiResponseToOpenAI(geminiResponse);
      expect(result.choices[0].finish_reason).toBe("length");
    });
  });
});
