import { NextResponse } from "next/server";
import type {
  GitHubActivityEvent,
  GitHubActivityPayload,
  GitHubProfileSummary,
} from "@/lib/github/types";

const GITHUB_API = "https://api.github.com";

type RawGitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
};

type RawGitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string; url: string };
  payload?: Record<string, unknown>;
};

function githubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "DevTweetHub",
  };
  const token = process.env.GITHUB_API_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function summarizeEvent(event: RawGitHubEvent): string {
  const repo = event.repo.name;
  const payload = event.payload ?? {};

  switch (event.type) {
    case "PushEvent": {
      const commits = Array.isArray(payload.commits) ? payload.commits.length : 0;
      const ref = typeof payload.ref === "string" ? payload.ref.replace("refs/heads/", "") : "branch";
      return commits > 0
        ? `Pushed ${commits} commit${commits === 1 ? "" : "s"} to ${ref}`
        : `Pushed to ${ref}`;
    }
    case "PullRequestEvent": {
      const action = typeof payload.action === "string" ? payload.action : "updated";
      return `${action} a pull request in ${repo}`;
    }
    case "IssuesEvent": {
      const action = typeof payload.action === "string" ? payload.action : "updated";
      return `${action} an issue in ${repo}`;
    }
    case "WatchEvent":
      return `Starred ${repo}`;
    case "ForkEvent":
      return `Forked ${repo}`;
    case "CreateEvent": {
      const refType = typeof payload.ref_type === "string" ? payload.ref_type : "resource";
      return `Created ${refType} in ${repo}`;
    }
    case "DeleteEvent": {
      const refType = typeof payload.ref_type === "string" ? payload.ref_type : "resource";
      return `Deleted ${refType} in ${repo}`;
    }
    case "ReleaseEvent": {
      const action = typeof payload.action === "string" ? payload.action : "published";
      return `${action} a release in ${repo}`;
    }
    case "PublicEvent":
      return `Made ${repo} public`;
    default:
      return `${event.type.replace(/Event$/, "")} in ${repo}`;
  }
}

function normalizeProfile(raw: RawGitHubUser): GitHubProfileSummary {
  return {
    login: raw.login,
    name: raw.name,
    avatarUrl: raw.avatar_url,
    htmlUrl: raw.html_url,
    bio: raw.bio,
    publicRepos: raw.public_repos,
    followers: raw.followers,
    following: raw.following,
  };
}

function normalizeEvents(raw: RawGitHubEvent[]): GitHubActivityEvent[] {
  return raw.map((event) => ({
    id: String(event.id),
    type: event.type,
    createdAt: event.created_at,
    repoName: event.repo.name,
    repoUrl: `https://github.com/${event.repo.name}`,
    summary: summarizeEvent(event),
  }));
}

/** Proxies GitHub profile + public events — outside `/api` to avoid NestJS rewrite. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const login = username.trim().toLowerCase();

  if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(login)) {
    return NextResponse.json({ error: "Invalid GitHub username" }, { status: 400 });
  }

  try {
    const [profileRes, eventsRes] = await Promise.all([
      fetch(`${GITHUB_API}/users/${encodeURIComponent(login)}`, {
        headers: githubHeaders(),
        next: { revalidate: 60 },
      }),
      fetch(
        `${GITHUB_API}/users/${encodeURIComponent(login)}/events/public?per_page=15`,
        { headers: githubHeaders(), next: { revalidate: 60 } },
      ),
    ]);

    if (profileRes.status === 404) {
      return NextResponse.json({ error: "GitHub user not found" }, { status: 404 });
    }

    if (!profileRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub profile" },
        { status: 502 },
      );
    }

    const profileRaw = (await profileRes.json()) as RawGitHubUser;
    const eventsRaw = eventsRes.ok
      ? ((await eventsRes.json()) as RawGitHubEvent[])
      : [];

    const payload: GitHubActivityPayload = {
      profile: normalizeProfile(profileRaw),
      events: normalizeEvents(eventsRaw),
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitHub activity" },
      { status: 502 },
    );
  }
}
