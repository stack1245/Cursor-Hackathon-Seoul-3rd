import { NextResponse } from "next/server";
import { mockOnboardingDashboard } from "@/lib/mock-data";

export async function GET() {
  try {
    return NextResponse.json(mockOnboardingDashboard);
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
