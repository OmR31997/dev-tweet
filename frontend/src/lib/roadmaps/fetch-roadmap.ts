import type { RoadmapJson } from "./types";

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/nilbuild/developer-roadmap/master/src/data/roadmaps";
const ROADMAP_SH_BASE = "https://roadmap.sh";

const CACHE_TTL_MS = 60 * 60 * 1000;

const cache = new Map<string, { data: RoadmapJson; expiresAt: number }>();

export function roadmapJsonUrl(slug: string): string {
  return `${GITHUB_RAW_BASE}/${slug}/${slug}.json`;
}

export function roadmapShJsonUrl(slug: string): string {
  return `${ROADMAP_SH_BASE}/${slug}.json`;
}

export async function fetchRoadmapJson(slug: string): Promise<RoadmapJson> {
  const cached = cache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  let response = await fetch(roadmapJsonUrl(slug), {
    next: { revalidate: 3600 },
  });

  // Some roadmaps (e.g. nextjs) no longer ship JSON in the GitHub repo.
  if (!response.ok) {
    response = await fetch(roadmapShJsonUrl(slug), {
      next: { revalidate: 3600 },
    });
  }

  if (!response.ok) {
    throw new Error(`Failed to load roadmap: ${slug}`);
  }

  const data = (await response.json()) as RoadmapJson;
  cache.set(slug, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}
