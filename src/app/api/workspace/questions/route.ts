import { NextResponse } from "next/server";
import { mockOnboardingDashboard } from "@/lib/mock-data";
import type { SuggestedQuestionsResponse } from "@/types/hermes";

type QuestionRequestBody = {
  repositoryUrl?: string;
  repositoryName?: string;
};

function extractRepoNameFromUrl(repositoryUrl?: string): string | null {
  if (!repositoryUrl) return null;
  try {
    const parsed = new URL(repositoryUrl);
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      return `${segments[0]}/${segments[1]}`;
    }
  } catch {
    return null;
  }
  return null;
}

function buildFallbackQuestions(
  repositoryName: string,
): SuggestedQuestionsResponse["questions"] {
  const topHotspot = mockOnboardingDashboard.hotSpotFiles[0];
  const topCoreFile = mockOnboardingDashboard.coreFiles[0];

  return [
    `${repositoryName}에서 신규 개발자가 가장 먼저 읽어야 할 파일 3개를 우선순위와 이유와 함께 알려줘.`,
    `${topHotspot?.filePath ?? "핵심 고위험 파일"}가 위험 파일로 분류된 이유를 커밋 맥락까지 포함해서 설명해줘.`,
    "최근 장애 대응 히스토리(커밋/PR/리뷰 코멘트) 기준으로 다시 사고가 날 가능성이 높은 구간을 알려줘.",
    `${topCoreFile?.filePath ?? "워크스페이스 핵심 파일"}를 중심으로 아키텍처 데이터 플로우를 입문자 시점에서 설명해줘.`,
    "이번 저장소에서 온보딩 첫 주에 반드시 점검해야 할 체크리스트를 질문 형태로 만들어줘.",
  ];
}

function parseJsonArrayText(rawText: string): string[] | null {
  const trimmed = rawText.trim();
  const direct = trimmed.match(/\[[\s\S]*\]/);
  const candidate = direct ? direct[0] : trimmed;

  try {
    const parsed = JSON.parse(candidate) as unknown;
    if (!Array.isArray(parsed)) return null;
    const questions = parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
    return questions.length > 0 ? questions.slice(0, 5) : null;
  } catch {
    return null;
  }
}

function parseLineQuestions(rawText: string): string[] | null {
  const questions = rawText
    .split("\n")
    .map((line) => line.replace(/^\s*[-*\d.)]+\s*/, "").trim())
    .filter((line) => line.length > 0)
    .filter((line) => line.endsWith("?") || line.endsWith("요."));

  return questions.length > 0 ? questions.slice(0, 5) : null;
}

async function generateQuestionsWithGemini(
  repositoryName: string,
): Promise<{ questions: string[] | null; errorMessage?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { questions: null };

  const topHotspots = mockOnboardingDashboard.hotSpotFiles
    .slice(0, 3)
    .map((file) => `${file.filePath} (risk: ${file.riskScore})`)
    .join(", ");
  const topCoreFiles = mockOnboardingDashboard.coreFiles
    .slice(0, 3)
    .map((file) => file.filePath)
    .join(", ");

  const prompt = [
    `Repository: ${repositoryName}`,
    `Hotspot files: ${topHotspots}`,
    `Core files: ${topCoreFiles}`,
    "Generate exactly 5 onboarding questions in Korean.",
    "Questions must be specific and practical for a new developer onboarding to this repository.",
    "Return ONLY a JSON array of strings. No markdown, no explanations.",
  ].join("\n");

  const modelCandidates = [
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
  ];

  let lastError = "";

  for (const model of modelCandidates) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.6,
            responseMimeType: "application/json",
          },
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      lastError = await response.text().catch(() => "");
      continue;
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      lastError = `Gemini model ${model} returned empty content`;
      continue;
    }

    return {
      questions: parseJsonArrayText(content) ?? parseLineQuestions(content),
    };
  }

  return {
    questions: null,
    errorMessage: lastError || "No available Gemini model responded successfully",
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as QuestionRequestBody;
    const repositoryName =
      body.repositoryName ||
      extractRepoNameFromUrl(body.repositoryUrl) ||
      "team/project-hermes";

    const geminiResult = await generateQuestionsWithGemini(repositoryName);
    if (geminiResult.questions && geminiResult.questions.length > 0) {
      return NextResponse.json({
        questions: geminiResult.questions,
        source: "gemini",
      } satisfies SuggestedQuestionsResponse);
    }

    return NextResponse.json({
      questions: buildFallbackQuestions(repositoryName),
      source: "fallback",
    } satisfies SuggestedQuestionsResponse);
  } catch {
    return NextResponse.json(
      {
        questions: buildFallbackQuestions("team/project-hermes"),
        source: "fallback",
      } satisfies SuggestedQuestionsResponse,
      { status: 200 },
    );
  }
}
