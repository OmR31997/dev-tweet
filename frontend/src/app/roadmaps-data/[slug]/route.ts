import { getRoadmapBySlug } from "@/lib/roadmaps/catalog";
import { fetchRoadmapJson } from "@/lib/roadmaps/fetch-roadmap";
import { NextResponse } from "next/server";

/** Serves roadmap.sh JSON — lives outside `/api` to avoid the NestJS proxy rewrite. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!getRoadmapBySlug(slug)) {
    return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
  }

  try {
    const data = await fetchRoadmapJson(slug);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch roadmap data" },
      { status: 502 },
    );
  }
}
