"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { mockCodeFiles } from "@/lib/mock-data";
import type {
  ArchitectureNode,
  CodeLine,
  OnboardingDashboard,
  RagAnswer,
} from "@/types/hermes";

const navItems = [
  { id: "dashboard", label: "Workspace", icon: DashboardIcon, active: true },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const DEMO_QUESTIONS = [
  "결제 검증 로직은 어디서 처리하나요?",
  "2025년 10월 PG 장애 때문에 추가된 코드는 어디인가요?",
  "왜 payment.service.ts가 위험 파일인가요?",
  "신입 개발자가 제일 먼저 봐야 할 파일은 뭐예요?",
  "이 프로젝트의 전체 아키텍처 흐름을 설명해줘",
];

const PAYMENT_FILE_PATH = "src/services/payment.service.ts";

const paymentFile = mockCodeFiles.find(
  (file) => file.filePath === PAYMENT_FILE_PATH,
);

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: RagAnswer["sources"];
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getCodeLinesForFile(filePath: string): CodeLine[] {
  const file = mockCodeFiles.find((item) => item.filePath === filePath);
  return file?.lines ?? paymentFile?.lines ?? [];
}

export default function WorkspacePage() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [highlightedFilePath, setHighlightedFilePath] = useState(PAYMENT_FILE_PATH);
  const [highlightedStartLine, setHighlightedStartLine] = useState(12);
  const [highlightedEndLine, setHighlightedEndLine] = useState(34);
  const [onboardingDashboard, setOnboardingDashboard] =
    useState<OnboardingDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);
  const [repositoryUrl, setRepositoryUrl] = useState(
    "https://github.com/team/project-hermes",
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const codeContainerRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const codeLines = getCodeLinesForFile(highlightedFilePath);

  useEffect(() => {
    async function fetchOnboarding() {
      try {
        const response = await fetch("/api/onboarding");
        if (!response.ok) {
          throw new Error("Failed to fetch onboarding dashboard");
        }
        const data = (await response.json()) as OnboardingDashboard;
        setOnboardingDashboard(data);
      } catch (error) {
        console.error("Failed to load onboarding dashboard:", error);
      }
    }

    fetchOnboarding();
  }, []);

  useEffect(() => {
    const target = lineRefs.current[highlightedStartLine];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedStartLine, highlightedEndLine, highlightedFilePath]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisStatus(null);
    try {
      const response = await fetch("/api/repository/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryUrl }),
      });
      if (!response.ok) {
        throw new Error("Failed to analyze repository");
      }
      await response.json();
      setAnalysisStatus(
        "분석 완료: Git commit, PR, 리뷰 댓글, 인수인계 문서 기반 Mock Context 생성 완료",
      );
    } catch (error) {
      console.error("Failed to analyze repository:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [repositoryUrl]);

  const submitQuestion = useCallback(
    async (inputQuestion: string) => {
      const trimmed = inputQuestion.trim();
      if (!trimmed || isLoading) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      setMessages((prev) => [...prev, userMessage]);
      setQuestion("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/rag/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed }),
        });

        if (!response.ok) {
          throw new Error("Failed to query RAG");
        }

        const data = (await response.json()) as RagAnswer;

        setHighlightedFilePath(data.filePath);
        setHighlightedStartLine(data.startLine);
        setHighlightedEndLine(data.endLine);

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.answer,
            sources: data.sources,
          },
        ]);
      } catch (error) {
        console.error("Failed to query RAG:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-error-${Date.now()}`,
            role: "assistant",
            content:
              "답변을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const handleSend = () => {
    submitQuestion(question);
  };

  const hotSpotFiles = onboardingDashboard?.hotSpotFiles ?? [];
  const coreFiles = onboardingDashboard?.coreFiles ?? [];
  const architecture = onboardingDashboard?.architecture ?? [];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0e1117] text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className="flex w-52 flex-col border-r border-white/10 bg-[#0b0d12]">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10">
            <span className="text-xs font-bold text-zinc-200">H</span>
          </div>
          <span className="text-sm font-semibold tracking-wider text-zinc-100">
            Project-HERMES
          </span>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                activeNav === item.id
                  ? "bg-white/10 text-zinc-100 font-medium"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="border-b border-white/10 bg-[#0b0d12] px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-lg font-bold tracking-widest text-zinc-100">
              WELCOME, BEN!
            </h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 tracking-wide">
                  Onboarding Progress
                </span>
                <div className="relative h-2 w-36 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full bg-zinc-300"
                    initial={{ width: 0 }}
                    animate={{ width: analysisStatus ? "75%" : "45%" }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Lead Dev Persona</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-600 text-xs font-bold text-white">
                  A
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/team/project-hermes"
              className="min-w-[280px] flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 outline-none focus:border-white/25"
            />
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="rounded-lg border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/15 disabled:opacity-50"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </button>
            {analysisStatus && (
              <span className="text-[11px] text-green-400">{analysisStatus}</span>
            )}
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Code viewer + Chat panel */}
          <div className="flex h-[420px] border-b border-white/10">
            {/* Code & Context Viewer (60%) */}
            <div className="flex w-[60%] flex-col border-r border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 bg-[#0d0f15]">
                <span className="text-xs font-semibold tracking-widest text-zinc-300 uppercase">
                  Code &amp; Context Viewer
                </span>
                <span className="text-xs text-zinc-500">LEFT PANE (60%)</span>
              </div>

              {/* File tab */}
              <div className="flex items-center gap-2 border-b border-white/10 bg-[#0d0f15] px-4 py-1.5">
                <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-zinc-300 font-mono">
                  {highlightedFilePath.split("/").pop()} ✕
                </span>
                <span className="truncate text-[10px] text-zinc-500">
                  {highlightedFilePath}
                </span>
              </div>

              {/* Code content */}
              <div
                ref={codeContainerRef}
                className="relative flex-1 overflow-y-auto bg-[#090b0f] font-mono text-xs leading-5"
              >
                {codeLines.map((line) => {
                  const isHighlighted =
                    line.lineNumber >= highlightedStartLine &&
                    line.lineNumber <= highlightedEndLine;

                  return (
                    <div
                      key={line.lineNumber}
                      ref={(el) => {
                        lineRefs.current[line.lineNumber] = el;
                      }}
                      className={`flex ${
                        isHighlighted
                          ? "border-l-2 border-yellow-400 bg-yellow-500/20"
                          : ""
                      }`}
                    >
                      <span className="w-10 flex-shrink-0 select-none pr-3 text-right text-zinc-600">
                        {line.lineNumber}
                      </span>
                      <span
                        className={`${
                          isHighlighted ? "text-zinc-100" : "text-zinc-400"
                        }`}
                      >
                        {line.content}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Chat & History (40%) */}
            <div className="flex w-[40%] flex-col">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 bg-[#0d0f15]">
                <span className="text-xs font-semibold tracking-widest text-zinc-300 uppercase">
                  AI Chat &amp; History
                </span>
                <span className="text-xs text-zinc-500">RIGHT PANE (40%)</span>
              </div>

              {/* Persona tag */}
              <div className="border-b border-white/10 bg-[#0d0f15] px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-zinc-600 flex items-center justify-center text-[10px] font-bold text-white">
                    A
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      Persona: &apos;A (Lead Dev)&apos;
                    </p>
                    <p className="text-[10px] text-green-400">● Available</p>
                  </div>
                </div>
              </div>

              {/* Chat label */}
              <div className="border-b border-white/10 px-4 py-1.5 bg-[#0d0f15]">
                <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
                  Chat History
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 px-4 py-3 bg-[#090b0f]">
                {messages.length === 0 && (
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    AI 사수에게 결제, PG 장애, 위험 파일, 아키텍처에 대해 질문해
                    보세요.
                  </p>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className="flex gap-2">
                    <div
                      className={`h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                        msg.role === "assistant" ? "bg-zinc-600" : "bg-blue-700"
                      }`}
                    >
                      {msg.role === "assistant" ? "A" : "B"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-zinc-200">
                          {msg.role === "assistant" ? "A" : "Ben"}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {formatTime(new Date())}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {msg.sources.map((source, index) => (
                            <div
                              key={`${msg.id}-source-${index}`}
                              className="rounded border border-white/10 bg-white/5 p-2"
                            >
                              <p className="text-[9px] font-semibold uppercase tracking-wider text-yellow-400/90">
                                {source.type}
                              </p>
                              <p className="text-[10px] font-semibold text-zinc-200 mt-0.5">
                                {source.title}
                              </p>
                              <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                                {source.summary}
                              </p>
                              {source.filePath && (
                                <p className="text-[9px] text-zinc-500 font-mono mt-1">
                                  {source.filePath}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.role === "assistant" && (
                      <button
                        type="button"
                        className="flex-shrink-0 text-zinc-600 hover:text-zinc-400"
                      >
                        <span className="text-xs">⋯</span>
                      </button>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2">
                    <div className="h-6 w-6 flex-shrink-0 rounded-full bg-zinc-600 flex items-center justify-center text-[10px] font-bold text-white">
                      A
                    </div>
                    <p className="text-xs text-zinc-500">답변 생성 중...</p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Demo questions */}
              <div className="border-t border-white/10 px-4 py-2 bg-[#0d0f15]">
                <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                  시연 질문
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DEMO_QUESTIONS.map((demoQuestion) => (
                    <button
                      key={demoQuestion}
                      type="button"
                      onClick={() => submitQuestion(demoQuestion)}
                      disabled={isLoading}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[9px] text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-200 disabled:opacity-50"
                    >
                      {demoQuestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat input */}
              <div className="border-t border-white/10 px-4 py-3 bg-[#0d0f15]">
                <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                    placeholder="AI 사수에게 질문하세요..."
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-xs text-zinc-300 placeholder-zinc-600 outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isLoading || !question.trim()}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
                  >
                    <SendIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Onboarding Roadmap */}
          <div className="px-6 py-6">
            <h2 className="mb-5 text-sm font-bold tracking-widest text-zinc-200 uppercase">
              Onboarding Roadmap
            </h2>

            <div className="grid grid-cols-3 gap-5">
              {/* Section 1: Risk Map */}
              <div className="rounded-xl border border-white/10 bg-[#0d0f15] p-4">
                <div className="mb-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                  Section 1: Risk Map
                </div>
                <div className="mb-3 text-xs font-semibold text-zinc-200">
                  Volatile Files{" "}
                  <span className="font-normal text-zinc-500">(Last 8 Months)</span>
                </div>
                <div className="mb-2 text-[10px] text-zinc-500">
                  TOP 3 Complex/Volatile files
                </div>

                <div className="space-y-2.5">
                  {hotSpotFiles.length === 0 && (
                    <p className="text-[10px] text-zinc-500">데이터 로딩 중...</p>
                  )}
                  {hotSpotFiles.map((file) => {
                    const isHighRisk = file.riskScore >= 70;
                    const fileName = file.filePath.split("/").pop() ?? file.filePath;

                    return (
                      <div key={file.filePath} className="group relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-zinc-300 font-mono truncate pr-2">
                            {fileName}
                          </span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] text-zinc-400">
                              {file.riskScore}
                            </span>
                            {isHighRisk ? (
                              <span className="rounded px-1 py-0.5 text-[9px] font-semibold bg-red-500/20 text-red-400">
                                High
                              </span>
                            ) : (
                              <span className="rounded px-1 py-0.5 text-[9px] font-semibold bg-yellow-500/20 text-yellow-400">
                                Med
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${
                              isHighRisk ? "bg-red-500" : "bg-yellow-500"
                            }`}
                            style={{ width: `${Math.min(file.riskScore, 100)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[9px] text-zinc-500 line-clamp-2">
                          #{file.rank} · {file.reason}
                        </p>
                        {isHighRisk && file.rank === 1 && (
                          <div className="absolute left-0 top-full z-10 mt-1 hidden w-44 rounded border border-white/10 bg-[#1a1d24] p-2 shadow-xl group-hover:block">
                            <p className="text-[10px] font-semibold text-zinc-200 mb-0.5">
                              High Risk, and Complexity
                            </p>
                            <p className="text-[9px] text-zinc-400">{file.reason}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Architecture */}
              <div className="rounded-xl border border-white/10 bg-[#0d0f15] p-4">
                <div className="mb-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                  Section 2: Data Flow Architecture
                </div>
                <div className="mb-4 text-xs font-semibold text-zinc-200">
                  시스템 구조
                </div>

                {architecture.length === 0 ? (
                  <p className="text-[10px] text-zinc-500">데이터 로딩 중...</p>
                ) : (
                  <ArchitectureTree nodes={architecture} />
                )}
              </div>

              {/* Section 3: Core Project Files */}
              <div className="rounded-xl border border-white/10 bg-[#0d0f15] p-4">
                <div className="mb-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                  Section 3: Your Core Project Files
                </div>
                <div className="mb-3 text-xs font-semibold text-zinc-200">
                  필수 파일{" "}
                  <span className="font-normal text-zinc-500">(Mandatory)</span>
                </div>

                <div className="space-y-2">
                  {coreFiles.length === 0 && (
                    <p className="text-[10px] text-zinc-500">데이터 로딩 중...</p>
                  )}
                  {coreFiles.map((file) => {
                    const fileName = file.filePath.split("/").pop() ?? file.filePath;

                    return (
                      <div
                        key={file.filePath}
                        className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 hover:border-white/20 hover:bg-white/[0.06] transition-colors cursor-pointer"
                      >
                        <FileIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-zinc-500" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-mono font-semibold text-zinc-200">
                            #{file.rank} {fileName}
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate">
                            {file.summary}
                          </p>
                          <p className="text-[9px] text-zinc-600 mt-0.5 line-clamp-2">
                            {file.whyReadFirst}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchitectureTree({
  nodes,
  depth = 0,
}: {
  nodes: ArchitectureNode[];
  depth?: number;
}) {
  return (
    <ul
      className={
        depth === 0
          ? "space-y-2"
          : "ml-3 mt-1 space-y-1.5 border-l border-white/10 pl-2"
      }
    >
      {nodes.map((node) => (
        <li key={node.id}>
          <div className="flex items-start gap-1.5">
            <span className="mt-0.5 rounded bg-white/10 px-1 py-0.5 text-[8px] uppercase tracking-wider text-zinc-500">
              {node.type}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-zinc-200">{node.name}</p>
              {node.description && (
                <p className="text-[9px] text-zinc-500 leading-relaxed">
                  {node.description}
                </p>
              )}
            </div>
          </div>
          {node.children && node.children.length > 0 && (
            <ArchitectureTree nodes={node.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

/* ────────────── SVG Icons ────────────── */
function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
