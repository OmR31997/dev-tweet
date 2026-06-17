import type { GitHubActivityPayload } from "./types";

export async function fetchGithubActivity(
  username: string,
): Promise<GitHubActivityPayload> {
  const res = await fetch(`/github-data/${encodeURIComponent(username)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to load GitHub activity");
  }

  return res.json() as Promise<GitHubActivityPayload>;
}
