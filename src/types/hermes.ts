export interface CodeLine {
  lineNumber: number;
  content: string;
  isHighlighted?: boolean;
}

export interface CodeFile {
  filePath: string;
  language: string;
  description: string;
  lines: CodeLine[];
}

export interface CommitContext {
  id: string;
  hash: string;
  message: string;
  author: string;
  date: string;
  relatedFiles: string[];
  summary: string;
}

export interface PullRequestContext {
  id: string;
  number: number;
  title: string;
  body: string;
  author: string;
  mergedAt: string;
  relatedFiles: string[];
  reviewComments: string[];
}

export interface HandOffDocument {
  id: string;
  source: "notion" | "confluence" | "markdown";
  title: string;
  content: string;
  relatedFiles: string[];
}

export interface RagSource {
  type: "code" | "commit" | "pull_request" | "review" | "document";
  title: string;
  summary: string;
  filePath?: string;
}

export interface RagAnswer {
  answer: string;
  filePath: string;
  startLine: number;
  endLine: number;
  sources: RagSource[];
}

export interface RepositoryAnalysis {
  repositoryName: string;
  repositoryUrl: string;
  status: "idle" | "analyzing" | "completed" | "failed";
  summary: string;
  totalFiles: number;
  totalCommits: number;
  totalPullRequests: number;
  analyzedAt: string;
}

export interface HotSpotFile {
  rank: number;
  filePath: string;
  riskScore: number;
  changeCount: number;
  sideEffectCount: number;
  reason: string;
}

export interface CoreFile {
  rank: number;
  filePath: string;
  summary: string;
  whyReadFirst: string;
}

export interface ArchitectureNode {
  id: string;
  name: string;
  type: "folder" | "file" | "api" | "service" | "database" | "external";
  description?: string;
  children?: ArchitectureNode[];
}

export interface OnboardingDashboard {
  hotSpotFiles: HotSpotFile[];
  coreFiles: CoreFile[];
  architecture: ArchitectureNode[];
}

export interface SuggestedQuestionsResponse {
  questions: string[];
  source: "gemini" | "fallback";
}
