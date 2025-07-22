import { chatService } from "@/lib/services/chat.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { model, ...rest } = body;
    const chatCompletion = await chatService.createCompletion(rest, { model });
    return NextResponse.json(chatCompletion);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
