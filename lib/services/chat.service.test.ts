import { describe, expect, it } from "vitest";
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
}

describe("ChatService", () => {
  const chatService = new TestableChatService();

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
