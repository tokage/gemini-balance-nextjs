// region: Types
interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIChatRequest {
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
// endregion: Types

export class ChatService {
  async createCompletion(
    request: OpenAIChatRequest
  ): Promise<Record<string, unknown>> {
    const geminiRequest = this.convertOpenAIMessagesToGemini(request.messages);

    // For now, we just log the converted request to verify the logic
    console.log(JSON.stringify(geminiRequest, null, 2));

    // TODO: Implement steps 3-5
    return {};
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
