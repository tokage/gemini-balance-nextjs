import { chatService } from "@/lib/services/chat.service";
import { withRetryHandling } from "@/lib/utils/withRetryHandling";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { model, ...rest } = body;

    const handler = (apiKey: string) =>
      chatService.createCompletion(rest, { model, apiKey });

    const chatCompletion = await withRetryHandling(handler);
    return NextResponse.json(chatCompletion);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
