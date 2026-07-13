import { NextRequest, NextResponse } from "next/server";

// Node.js runtime for better env var loading

interface SearchRequest {
  query: string;
  maxResults?: number;
}

interface OpenAlexWork {
  id: string;
  title: string;
  authorships: { author: { display_name: string } }[];
  publication_year: number | null;
  host_venue?: { display_name: string };
  doi: string | null;
  abstract_inverted_index?: Record<string, number[]>;
  primary_location?: { source?: { display_name: string }; is_oa?: boolean };
  cited_by_count?: number;
  relevance_score?: number;
  type?: string;
}

function reconstructAbstract(invertedIndex?: Record<string, number[]>): string {
  if (!invertedIndex) return "";
  const positions: { word: string; pos: number }[] = [];
  for (const [word, indices] of Object.entries(invertedIndex)) {
    for (const pos of indices) {
      positions.push({ word, pos });
    }
  }
  positions.sort((a, b) => a.pos - b.pos);
  return positions.map((p) => p.word).join(" ");
}

export async function POST(req: NextRequest) {
  const body: SearchRequest = await req.json();

  if (!body.query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const maxResults = body.maxResults ?? 20;
  const query = encodeURIComponent(body.query);

  // Filter: articles only, from 2020 onwards, has abstract, sorted by relevance
  const currentYear = new Date().getFullYear();
  const filters = [
    "type:article",
    `from_publication_date:2020-01-01`,
    `to_publication_date:${currentYear}-12-31`,
    "has_abstract:true",
  ];

  try {
    const url = `https://api.openalex.org/works?search=${query}&per-page=${maxResults}&sort=relevance_score:desc&filter=${filters.join(",")}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "ResearchAI-Hub/1.0 (mailto:research@unilicungo.ac.ao)",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `OpenAlex API error: ${res.status} — ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const works: OpenAlexWork[] = data?.results ?? [];

    const articles = works.map((work, idx) => {
      const authors = work.authorships
        ?.map((a) => a.author?.display_name)
        .filter(Boolean)
        .join(", ") || "Unknown";

      const abstract = reconstructAbstract(work.abstract_inverted_index);

      return {
        id: `art-${idx + 1}-${Date.now()}`,
        title: work.title || "Untitled",
        authors,
        year: work.publication_year?.toString() || "—",
        source: work.primary_location?.source?.display_name || work.host_venue?.display_name || "Unknown",
        doi: work.doi || undefined,
        abstract: abstract || undefined,
        searchQuery: body.query,
        relevanceScore: work.relevance_score ?? 0,
        citedByCount: work.cited_by_count ?? 0,
        isOpenAccess: work.primary_location?.is_oa ?? false,
      };
    });

    return NextResponse.json({
      articles,
      count: articles.length,
      success: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
