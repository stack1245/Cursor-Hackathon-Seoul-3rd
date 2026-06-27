import { NextResponse } from "next/server";
import { mockRepositoryAnalysis } from "@/lib/mock-data";

function extractRepositoryName(repositoryUrl: string): string {
  try {
    const { pathname } = new URL(repositoryUrl);
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      return `${segments[0]}/${segments[1]}`;
    }
  } catch {
    // fall through to mock default
  }
  return mockRepositoryAnalysis.repositoryName;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { repositoryUrl?: string };
    const { repositoryUrl } = body;

    if (!repositoryUrl || typeof repositoryUrl !== "string") {
      return NextResponse.json(
        { message: "repositoryUrl is required" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ...mockRepositoryAnalysis,
      repositoryName: extractRepositoryName(repositoryUrl),
      repositoryUrl,
      status: "completed" as const,
    });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
