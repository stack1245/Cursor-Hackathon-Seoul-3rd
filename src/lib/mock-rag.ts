import {
  mockCodeFiles,
  mockCommitContexts,
  mockHandOffDocuments,
  mockPullRequestContexts,
} from "@/lib/mock-data";
import type { RagAnswer, RagSource } from "@/types/hermes";

const PAYMENT_SERVICE_PATH = "src/services/payment.service.ts";
const WORKSPACE_PAGE_PATH = "src/app/workspace/page.tsx";

const PAYMENT_COMMIT = mockCommitContexts[0];
const PAYMENT_PR = mockPullRequestContexts[0];
const PAYMENT_DOCUMENT = mockHandOffDocuments[0];
const PAYMENT_CODE = mockCodeFiles.find(
  (file) => file.filePath === PAYMENT_SERVICE_PATH,
)!;
const ONBOARDING_DOCUMENT = mockHandOffDocuments[1];

function matchesAny(question: string, keywords: string[]): boolean {
  const normalized = question.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function codeSource(title: string, summary: string, filePath: string): RagSource {
  return { type: "code", title, summary, filePath };
}

function commitSource(): RagSource {
  return {
    type: "commit",
    title: PAYMENT_COMMIT.message,
    summary: PAYMENT_COMMIT.summary,
    filePath: PAYMENT_SERVICE_PATH,
  };
}

function pullRequestSource(): RagSource {
  return {
    type: "pull_request",
    title: PAYMENT_PR.title,
    summary: PAYMENT_PR.body,
    filePath: PAYMENT_SERVICE_PATH,
  };
}

function reviewSource(): RagSource {
  return {
    type: "review",
    title: `PR #${PAYMENT_PR.number} Review Comment`,
    summary: PAYMENT_PR.reviewComments[0],
    filePath: PAYMENT_SERVICE_PATH,
  };
}

function documentSource(
  document: (typeof mockHandOffDocuments)[number],
): RagSource {
  return {
    type: "document",
    title: document.title,
    summary: document.content,
    filePath: document.relatedFiles[0],
  };
}

function answerPaymentValidation(): RagAnswer {
  return {
    answer:
      "결제 검증 로직은 src/services/payment.service.ts의 validatePayment() 함수에서 처리됩니다. 이 함수는 주문 상태, 결제 금액, PG 승인 응답값을 검증하며, 2025년 10월 외부 PG사 장애 이후 fallback 예외 처리도 함께 포함하고 있습니다.",
    filePath: PAYMENT_SERVICE_PATH,
    startLine: 12,
    endLine: 34,
    sources: [
      codeSource(
        PAYMENT_CODE.filePath,
        PAYMENT_CODE.description,
        PAYMENT_SERVICE_PATH,
      ),
      commitSource(),
      pullRequestSource(),
      documentSource(PAYMENT_DOCUMENT),
    ],
  };
}

function answerPgFallback(): RagAnswer {
  return {
    answer:
      "2025년 10월 외부 PG사 장애로 인해 결제 승인 응답이 지연되거나 실패하는 문제가 발생했습니다. 이때 주문 생성 전체가 중단되지 않도록 payment.service.ts에 applyPgFallbackPolicy() 임시 우회 로직이 추가되었습니다. PR 리뷰에서는 이 로직이 장기 해결책이 아니라 임시 대응이므로 추후 제거 여부를 검토해야 한다고 기록되어 있습니다.",
    filePath: PAYMENT_SERVICE_PATH,
    startLine: 28,
    endLine: 44,
    sources: [commitSource(), pullRequestSource(), reviewSource()],
  };
}

function answerHotSpot(): RagAnswer {
  return {
    answer:
      "가장 위험도가 높은 파일은 src/services/payment.service.ts입니다. 최근 6개월간 변경 빈도가 높고 주문, 정산, 알림 모듈과 연결되어 있어 수정 시 사이드 이펙트 가능성이 큽니다. 따라서 신입 개발자는 이 파일을 수정하기 전에 order.service.ts와 관련 PR 히스토리를 함께 확인해야 합니다.",
    filePath: PAYMENT_SERVICE_PATH,
    startLine: 1,
    endLine: 50,
    sources: [
      codeSource(
        PAYMENT_CODE.filePath,
        PAYMENT_CODE.description,
        PAYMENT_SERVICE_PATH,
      ),
      commitSource(),
      documentSource(PAYMENT_DOCUMENT),
    ],
  };
}

function answerArchitecture(): RagAnswer {
  return {
    answer:
      "Project-HERMES는 Frontend Workspace UI, Next.js API Route, Mock RAG Engine으로 나뉩니다. 사용자가 질문을 입력하면 Workspace의 AI Chat Panel이 /api/rag/query를 호출하고, API Route는 mock-rag.ts를 통해 코드, 커밋, PR, 인수인계 문서 Mock Context를 검색한 뒤 답변과 코드 하이라이트 위치를 반환합니다.",
    filePath: WORKSPACE_PAGE_PATH,
    startLine: 1,
    endLine: 80,
    sources: [
      documentSource(ONBOARDING_DOCUMENT),
      codeSource(
        WORKSPACE_PAGE_PATH,
        "온보딩 워크스페이스 UI — 코드 뷰어, AI 채팅, 대시보드가 통합된 메인 화면",
        WORKSPACE_PAGE_PATH,
      ),
    ],
  };
}

function answerOnboarding(): RagAnswer {
  return {
    answer:
      "신입 개발자는 먼저 src/app/workspace/page.tsx를 통해 전체 사용자 흐름을 이해하고, 이후 src/services/payment.service.ts와 src/services/order.service.ts를 함께 보는 것이 좋습니다. payment.service.ts는 위험도가 높지만 비즈니스 핵심 로직이 모여 있어 온보딩 초기에 반드시 이해해야 하는 파일입니다.",
    filePath: WORKSPACE_PAGE_PATH,
    startLine: 1,
    endLine: 60,
    sources: [
      documentSource(ONBOARDING_DOCUMENT),
      codeSource(
        WORKSPACE_PAGE_PATH,
        "온보딩 워크스페이스 UI — 코드 뷰어, AI 채팅, 대시보드가 통합된 메인 화면",
        WORKSPACE_PAGE_PATH,
      ),
    ],
  };
}

function answerFallback(): RagAnswer {
  return {
    answer:
      '현재 Mock RAG는 결제 모듈, PG 장애 이력, 위험 파일, 핵심 학습 파일, 아키텍처 흐름에 대한 질문을 중심으로 답변할 수 있습니다. 예를 들어 "결제 검증 로직은 어디인가요?" 또는 "왜 payment.service.ts가 위험 파일인가요?"처럼 질문해보세요.',
    filePath: PAYMENT_SERVICE_PATH,
    startLine: 1,
    endLine: 10,
    sources: [],
  };
}

export function queryMockRag(question: string): RagAnswer {
  const trimmed = question.trim();

  // 구체적인 맥락 조건을 먼저 검사해 오분류를 방지한다.
  if (matchesAny(trimmed, ["먼저", "처음", "신입", "학습", "봐야"])) {
    return answerOnboarding();
  }

  if (matchesAny(trimmed, ["위험", "복잡", "hotspot", "핫스팟", "위험 파일", "risk"])) {
    return answerHotSpot();
  }

  if (matchesAny(trimmed, ["아키텍처", "구조", "흐름", "architecture", "flow"])) {
    return answerArchitecture();
  }

  if (matchesAny(trimmed, ["PG", "장애", "우회", "fallback", "임시"])) {
    return answerPgFallback();
  }

  if (matchesAny(trimmed, ["결제", "검증", "payment", "validate"])) {
    return answerPaymentValidation();
  }

  return answerFallback();
}
