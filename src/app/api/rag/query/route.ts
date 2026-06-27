import { NextResponse } from "next/server";
import { queryMockRag } from "@/lib/mock-rag";

export async function POST(request: Request) {
  try {
    const body = (await request
      .json()
      .catch(() => null)) as { question?: string } | null;
    if (!body) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const { question } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { message: "question is required" },
        { status: 400 },
      );
    }

    return NextResponse.json(queryMockRag(question));
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
