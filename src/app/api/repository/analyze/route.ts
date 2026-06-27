import { NextResponse } from "next/server";
import type { RepositoryAnalysis } from "@/types/hermes";

type ParsedRepo = {
  owner: string;
  repo: string;
  fullName: string;
  normalizedUrl: string;
};

type GithubRepoResponse = {
  full_name: string;
  default_branch: string;
  html_url: string;
};

function parseRepositoryUrl(repositoryUrl: string): ParsedRepo | null {
  const trimmed = repositoryUrl.trim().replace(/\.git$/, "");

  // Support shorthand like "owner/repo" as well as full URLs.
  const shorthandMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (shorthandMatch) {
    const owner = shorthandMatch[1];
    const repo = shorthandMatch[2];
    return {
      owner,
      repo,
      fullName: `${owner}/${repo}`,
      normalizedUrl: `https://github.com/${owner}/${repo}`,
    };
  }

  try {
    const { hostname, pathname } = new URL(trimmed);
    const normalizedHost = hostname.toLowerCase().replace(/^www\./, "");
    if (normalizedHost !== "github.com") {
      return null;
    }

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      const owner = segments[0];
      const repo = segments[1];
      return {
        owner,
        repo,
        fullName: `${owner}/${repo}`,
        normalizedUrl: `https://github.com/${owner}/${repo}`,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function getAuthHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Project-HERMES",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function extractLastPage(linkHeader: string | null): number | null {
  if (!linkHeader) return null;
  const match = linkHeader.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

async function fetchCountByPagination(
  url: string,
  headers: HeadersInit,
): Promise<number> {
  const response = await fetch(url, { headers, cache: "no-store" });
  if (response.status === 409 || response.status === 404) {
    return 0;
  }
  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status}`);
  }

  const lastPage = extractLastPage(response.headers.get("link"));
  if (lastPage !== null) {
    return lastPage;
  }

  const items = (await response.json()) as unknown[];
  return Array.isArray(items) ? items.length : 0;
}

async function fetchRepositoryFileCount(
  owner: string,
  repo: string,
  branch: string,
  headers: HeadersInit,
): Promise<number> {
  const branchResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}`,
    { headers, cache: "no-store" },
  );

  if (branchResponse.status === 404 || branchResponse.status === 409) {
    return 0;
  }
  if (!branchResponse.ok) {
    throw new Error(`GitHub branch request failed: ${branchResponse.status}`);
  }

  const branchData = (await branchResponse.json()) as {
    commit?: { commit?: { tree?: { sha?: string } } };
  };

  const treeSha = branchData.commit?.commit?.tree?.sha;
  if (!treeSha) return 0;

  const treeResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
    { headers, cache: "no-store" },
  );
  if (treeResponse.status === 404 || treeResponse.status === 409) {
    return 0;
  }
  if (!treeResponse.ok) {
    throw new Error(`GitHub tree request failed: ${treeResponse.status}`);
  }

  const treeData = (await treeResponse.json()) as {
    tree?: Array<{ type?: string }>;
  };

  const files = treeData.tree?.filter((node) => node.type === "blob") ?? [];
  return files.length;
}

export async function POST(request: Request) {
  try {
    const body = (await request
      .json()
      .catch(() => null)) as { repositoryUrl?: string } | null;
    if (!body) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 },
      );
    }
    const { repositoryUrl } = body;

    if (!repositoryUrl || typeof repositoryUrl !== "string") {
      return NextResponse.json(
        { message: "repositoryUrl is required" },
        { status: 400 },
      );
    }

    const parsed = parseRepositoryUrl(repositoryUrl);
    if (!parsed) {
      return NextResponse.json(
        { message: "유효한 GitHub 저장소 URL을 입력해 주세요." },
        { status: 400 },
      );
    }

    const headers = getAuthHeaders();
    const repoResponse = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
      { headers, cache: "no-store" },
    );

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return NextResponse.json(
          { message: "저장소를 찾을 수 없습니다. URL 또는 접근 권한을 확인해 주세요." },
          { status: 404 },
        );
      }
      if (repoResponse.status === 403) {
        return NextResponse.json(
          {
            message:
              "GitHub API 요청 한도를 초과했거나 접근 권한이 없습니다. GITHUB_TOKEN 설정을 확인해 주세요.",
          },
          { status: 403 },
        );
      }
      return NextResponse.json(
        { message: "GitHub 저장소 정보를 불러오지 못했습니다." },
        { status: 502 },
      );
    }

    const repoData = (await repoResponse.json()) as GithubRepoResponse;

    const defaultBranch = repoData.default_branch || "main";

    const [totalCommits, totalPullRequests, totalFiles] = await Promise.all([
      fetchCountByPagination(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits?per_page=1&sha=${encodeURIComponent(
          defaultBranch,
        )}`,
        headers,
      ),
      fetchCountByPagination(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls?state=all&per_page=1`,
        headers,
      ),
      fetchRepositoryFileCount(
        parsed.owner,
        parsed.repo,
        defaultBranch,
        headers,
      ),
    ]);

    const analyzedAt = new Date().toISOString();
    const result: RepositoryAnalysis = {
      repositoryName: repoData.full_name ?? parsed.fullName,
      repositoryUrl: repoData.html_url ?? parsed.normalizedUrl,
      status: "completed",
      summary: `${repoData.full_name ?? parsed.fullName} 분석 완료. 파일 ${totalFiles.toLocaleString()}개, 커밋 ${totalCommits.toLocaleString()}개, PR ${totalPullRequests.toLocaleString()}개를 확인했습니다.`,
      totalFiles,
      totalCommits,
      totalPullRequests,
      analyzedAt,
    };

    return NextResponse.json({
      ...result,
      message: "GitHub 저장소 분석이 완료되었습니다.",
    });
  } catch (error) {
    console.error("Repository analyze error:", error);
    return NextResponse.json(
      { message: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
