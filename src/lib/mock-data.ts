import type {
  ArchitectureNode,
  CodeFile,
  CommitContext,
  CoreFile,
  HandOffDocument,
  HotSpotFile,
  OnboardingDashboard,
  PullRequestContext,
  RepositoryAnalysis,
} from "@/types/hermes";

const PAYMENT_SERVICE_PATH = "src/services/payment.service.ts";

function buildPaymentServiceLines(): CodeFile["lines"] {
  const rawLines = [
    'import { OrderService } from "./order.service";',
    'import { PgClient } from "../lib/pg-client";',
    "",
    "export type PaymentRequest = {",
    "  orderId: string;",
    "  amount: number;",
    "  currency: string;",
    "  pgToken: string;",
    "};",
    "",
    "export type PaymentValidationResult = { valid: boolean; reason?: string };",
    "export async function validatePayment(",
    "  orderService: OrderService,",
    "  request: PaymentRequest,",
    "  pgResponse: Record<string, unknown>",
    "): Promise<PaymentValidationResult> {",
    "  const order = await orderService.getOrder(request.orderId);",
    "  if (order.status !== \"pending_payment\") {",
    "    return { valid: false, reason: \"주문 상태가 결제 가능 상태가 아닙니다.\" };",
    "  }",
    "  if (order.totalAmount !== request.amount) {",
    "    return { valid: false, reason: \"결제 금액이 주문 금액과 일치하지 않습니다.\" };",
    "  }",
    "  if (!pgResponse.approvalCode || pgResponse.status !== \"approved\") {",
    "    return { valid: false, reason: \"PG 응답값이 유효하지 않습니다.\" };",
    "  }",
    "  // 2025년 10월 PG 장애 이후 추가된 fallback 예외 처리",
    "  try {",
    "    return { valid: true };",
    "  } catch (error) {",
    "    return applyPgFallbackPolicy(request, pgResponse, error);",
    "  }",
    "}",
    "",
    "export async function requestPgApproval(",
    "  pgClient: PgClient,",
    "  request: PaymentRequest,",
    "): Promise<Record<string, unknown>> {",
    "  return pgClient.requestApproval({",
    "    orderId: request.orderId,",
    "    amount: request.amount,",
    "    token: request.pgToken,",
    "  });",
    "}",
    "",
    "export function applyPgFallbackPolicy(",
    "  request: PaymentRequest,",
    "  pgResponse: Record<string, unknown>,",
    "  error: unknown,",
    "): PaymentValidationResult {",
    "  const isPgOutage = pgResponse.status === \"timeout\" || pgResponse.status === \"unavailable\";",
    "  if (isPgOutage) {",
    "    console.warn(\"[payment] PG 장애 fallback 적용\", { orderId: request.orderId, error });",
    "    return { valid: true, reason: \"PG 장애 fallback으로 승인 처리됨\" };",
    "  }",
    "  return { valid: false, reason: \"결제 검증에 실패했습니다.\" };",
    "}",
  ];

  return rawLines.map((content, index) => {
    const lineNumber = index + 1;
    const isHighlighted = lineNumber >= 12 && lineNumber <= 34;
    return { lineNumber, content, isHighlighted };
  });
}

export const mockCodeFiles: CodeFile[] = [
  {
    filePath: PAYMENT_SERVICE_PATH,
    language: "typescript",
    description:
      "주문 상태 확인, 결제 금액 검증, PG 응답 검증 및 fallback 정책을 담당하는 결제 서비스",
    lines: buildPaymentServiceLines(),
  },
  {
    filePath: "src/services/order.service.ts",
    language: "typescript",
    description: "주문 생성·조회 및 결제 상태 전이를 관리하는 주문 서비스",
    lines: [
      { lineNumber: 1, content: 'import { db } from "../lib/db";' },
      { lineNumber: 2, content: "" },
      { lineNumber: 3, content: "export class OrderService {" },
      { lineNumber: 4, content: "  async getOrder(orderId: string) {" },
      { lineNumber: 5, content: "    return db.order.findUnique({ where: { id: orderId } });" },
      { lineNumber: 6, content: "  }" },
      { lineNumber: 7, content: "}" },
    ],
  },
];

export const mockCommitContexts: CommitContext[] = [
  {
    id: "commit-pg-fallback-001",
    hash: "a3f9c2d1e8b74f6a",
    message: "fix: PG 장애 대응 임시 우회 로직 추가",
    author: "Lead Dev A",
    date: "2025-10-18T14:32:00+09:00",
    relatedFiles: [PAYMENT_SERVICE_PATH],
    summary:
      "2025년 10월 외부 PG사 장애로 인해 결제 검증 실패 시 fallback 처리를 추가함",
  },
  {
    id: "commit-order-status-002",
    hash: "b7e1a4c9d2f83e05",
    message: "refactor: 주문 상태 검증 로직 payment 서비스로 이동",
    author: "Ben",
    date: "2025-09-02T10:15:00+09:00",
    relatedFiles: [PAYMENT_SERVICE_PATH, "src/services/order.service.ts"],
    summary: "결제 전 주문 상태 확인 로직을 payment.service.ts로 통합하여 중복을 제거함",
  },
];

export const mockPullRequestContexts: PullRequestContext[] = [
  {
    id: "pr-payment-fallback-17234",
    number: 17234,
    title: "Payment fallback hotfix",
    body: "외부 PG사 응답 지연으로 인해 주문 생성이 중단되는 문제를 방지하기 위해 fallback 정책을 추가함",
    author: "Lead Dev A",
    mergedAt: "2025-10-19T09:45:00+09:00",
    relatedFiles: [PAYMENT_SERVICE_PATH],
    reviewComments: [
      "임시 우회 로직이므로 추후 PG 안정화 이후 제거 여부를 검토해야 함",
      "fallback 적용 시 로그 레벨을 warn으로 남겨 모니터링 가능하게 해주세요.",
    ],
  },
  {
    id: "pr-order-validation-16890",
    number: 16890,
    title: "Consolidate order validation in payment flow",
    body: "주문 상태 검증을 payment 서비스 단일 진입점으로 모아 결제 실패율을 줄임",
    author: "Ben",
    mergedAt: "2025-09-05T16:20:00+09:00",
    relatedFiles: [PAYMENT_SERVICE_PATH, "src/services/order.service.ts"],
    reviewComments: ["order.service와 payment.service 간 책임 분리가 더 명확해졌습니다."],
  },
];

export const mockHandOffDocuments: HandOffDocument[] = [
  {
    id: "handoff-payment-module-001",
    source: "notion",
    title: "결제 모듈 인수인계 문서",
    content:
      "payment.service.ts는 주문, 결제 승인, PG fallback 정책이 함께 묶여 있어 수정 시 사이드 이펙트 가능성이 높다.",
    relatedFiles: [PAYMENT_SERVICE_PATH],
  },
  {
    id: "handoff-onboarding-002",
    source: "markdown",
    title: "신규 입사자 온보딩 체크리스트",
    content:
      "workspace 페이지에서 코드 뷰어·AI 채팅·온보딩 대시보드를 순서대로 확인하세요.",
    relatedFiles: [
      "src/app/workspace/page.tsx",
      "src/lib/mock-data.ts",
    ],
  },
];

export const mockHotSpotFiles: HotSpotFile[] = [
  {
    rank: 1,
    filePath: "src/services/payment.service.ts",
    riskScore: 92,
    changeCount: 47,
    sideEffectCount: 8,
    reason:
      "PG 장애 대응 fallback, 결제 검증, 승인 요청이 한 파일에 집중되어 변경 영향 범위가 넓음",
  },
  {
    rank: 2,
    filePath: "src/services/order.service.ts",
    riskScore: 78,
    changeCount: 31,
    sideEffectCount: 5,
    reason:
      "주문 상태 전이가 결제·배송·취소 플로우와 연결되어 있어 수정 시 연쇄 장애 가능성 있음",
  },
  {
    rank: 3,
    filePath: "src/lib/auth/session-manager.ts",
    riskScore: 71,
    changeCount: 24,
    sideEffectCount: 6,
    reason:
      "세션 만료·갱신 로직 변경 시 API Gateway 및 프론트엔드 인증 흐름에 동시 영향",
  },
];

export const mockCoreFiles: CoreFile[] = [
  {
    rank: 1,
    filePath: "src/app/workspace/page.tsx",
    summary: "온보딩 워크스페이스 UI — 코드 뷰어, AI 채팅, 대시보드가 통합된 메인 화면",
    whyReadFirst: "신규 입사자가 Project-HERMES를 처음 사용할 때 진입하는 핵심 화면이므로 전체 UX 흐름 파악에 필수",
  },
  {
    rank: 2,
    filePath: "src/services/payment.service.ts",
    summary: "결제 검증·PG 승인·fallback 정책을 담당하는 고위험 핵심 비즈니스 모듈",
    whyReadFirst: "최근 PG 장애 hotfix가 적용된 파일로, 결제 장애 대응 맥락을 이해하는 데 가장 중요",
  },
  {
    rank: 3,
    filePath: "src/services/order.service.ts",
    summary: "주문 생성·조회 및 결제 상태 관리를 담당하는 주문 도메인 서비스",
    whyReadFirst: "payment.service.ts와 밀접하게 연동되므로 결제 플로우 이해 전에 함께 읽어야 함",
  },
  {
    rank: 4,
    filePath: "src/app/api/rag/query/route.ts",
    summary: "Mock RAG 질의 API — 코드·커밋·PR·인수인계 문서 컨텍스트를 조합해 답변 반환",
    whyReadFirst: "AI 사수 채팅의 백엔드 진입점으로, RAG 응답 구조를 파악하는 데 필요",
  },
  {
    rank: 5,
    filePath: "src/lib/mock-rag.ts",
    summary: "Mock RAG 엔진 — 외부 Vector DB 없이 로컬 Mock 데이터로 답변을 생성",
    whyReadFirst: "실제 OpenAI·Vector DB 연동 전 Mock RAG 동작 방식과 소스 매칭 로직을 확인하기 위해 선행 학습 권장",
  },
];

export const mockArchitecture: ArchitectureNode[] = [
  {
    id: "frontend",
    name: "Frontend",
    type: "folder",
    description: "Next.js App Router 기반 사용자 인터페이스",
    children: [
      {
        id: "frontend-landing",
        name: "Landing Page",
        type: "file",
        description: "src/app/page.tsx — 프로젝트 소개 및 워크스페이스 진입",
      },
      {
        id: "frontend-workspace",
        name: "Workspace UI",
        type: "file",
        description: "src/app/workspace/page.tsx — 온보딩 메인 워크스페이스",
      },
      {
        id: "frontend-code-viewer",
        name: "Code Viewer",
        type: "file",
        description: "코드·컨텍스트 뷰어 패널 (좌측 60%)",
      },
      {
        id: "frontend-ai-chat",
        name: "AI Chat Panel",
        type: "file",
        description: "AI 사수 채팅 및 히스토리 패널 (우측 40%)",
      },
      {
        id: "frontend-onboarding-dashboard",
        name: "Onboarding Dashboard",
        type: "file",
        description: "위험 파일·아키텍처·핵심 학습 파일 대시보드",
      },
    ],
  },
  {
    id: "backend-api",
    name: "Backend API",
    type: "folder",
    description: "Next.js Route Handlers 기반 Mock API",
    children: [
      {
        id: "api-repository-analyze",
        name: "Repository Analyze API",
        type: "api",
        description: "저장소 분석 상태 및 요약 반환",
      },
      {
        id: "api-rag-query",
        name: "Mock RAG Query API",
        type: "api",
        description: "src/app/api/rag/query/route.ts — RAG 질의 처리",
      },
      {
        id: "api-onboarding-dashboard",
        name: "Onboarding Dashboard API",
        type: "api",
        description: "온보딩 대시보드 Mock 데이터 제공",
      },
    ],
  },
  {
    id: "mock-rag-engine",
    name: "Mock RAG Engine",
    type: "service",
    description: "외부 API 없이 로컬 Mock 데이터로 RAG 응답 생성",
    children: [
      {
        id: "rag-mock-code",
        name: "Mock Code Context",
        type: "file",
        description: "mockCodeFiles — 코드 파일 및 하이라이트 라인",
      },
      {
        id: "rag-mock-git",
        name: "Mock Git History",
        type: "file",
        description: "mockCommitContexts — 커밋 맥락 및 요약",
      },
      {
        id: "rag-mock-pr",
        name: "Mock PR Review Context",
        type: "file",
        description: "mockPullRequestContexts — PR 본문 및 리뷰 코멘트",
      },
      {
        id: "rag-mock-handoff",
        name: "Mock HandOff Documents",
        type: "file",
        description: "mockHandOffDocuments — Notion·Confluence 인수인계 문서",
      },
    ],
  },
];

export const mockOnboardingDashboard: OnboardingDashboard = {
  hotSpotFiles: mockHotSpotFiles,
  coreFiles: mockCoreFiles,
  architecture: mockArchitecture,
};

export const mockRepositoryAnalysis: RepositoryAnalysis = {
  repositoryName: "stack1245/Cursor-Hackathon-Seoul-3rd",
  repositoryUrl: "https://github.com/stack1245/Cursor-Hackathon-Seoul-3rd",
  status: "completed",
  summary:
    "Project-HERMES Mock 저장소 분석 완료. 결제 모듈(payment.service.ts)이 최고 위험 파일이며, PG 장애 대응 fallback hotfix 이력이 확인됨.",
  totalFiles: 42,
  totalCommits: 128,
  totalPullRequests: 34,
  analyzedAt: "2025-06-27T12:00:00+09:00",
};
