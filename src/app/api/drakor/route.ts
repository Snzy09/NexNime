import { NextResponse } from "next/server";
import {
  getDrakorTrending,
  getDrakorOngoing,
  getDrakorList,
  searchDrakor,
  getDrakorDetail,
  getDrakorStream,
} from "@/lib/services/drakorService";
import { REAL_DRAKOR_TRENDING } from "@/lib/services/realDataFallback";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "trending";
  const q = searchParams.get("q");
  const slug = searchParams.get("slug");
  const page = parseInt(searchParams.get("page") || "1");

  try {
    if (action === "stream" && slug) {
      const ep = parseInt(searchParams.get("ep") || "1");
      const server = searchParams.get("server") || "max";
      const streamData = await getDrakorStream(slug, ep, server);
      if (streamData) {
        return NextResponse.json({ success: true, ...streamData });
      }
      return NextResponse.json(
        { success: false, error: "Stream video episode tidak ditemukan" },
        { status: 404 }
      );
    }

    if (action === "search" && q) {
      const items = await searchDrakor(q);
      if (items.length > 0) return NextResponse.json({ success: true, items });
      const filtered = REAL_DRAKOR_TRENDING.filter((d) =>
        d.title.toLowerCase().includes(q.toLowerCase())
      );
      return NextResponse.json({ success: true, items: filtered });
    }

    if (action === "detail" && slug) {
      const detail = await getDrakorDetail(slug);
      if (detail) return NextResponse.json({ success: true, detail });

      const found = REAL_DRAKOR_TRENDING.find((d) => d.slug === slug);
      if (found) {
        return NextResponse.json({
          success: true,
          detail: {
            title: found.title,
            poster: found.poster,
            synopsis: "Drama Korea romantis & misteri seru dengan subtitle Indonesia lengkap.",
            genres: ["Romance", "Drama", "Mystery"],
            total_episodes: 16,
            episodes: Array.from({ length: 16 }, (_, i) => ({
              episode: i + 1,
              label: `Episode ${i + 1}`,
              embed: {
                watch_lite: `https://drakorid.co/watch-lite/${found.slug}/${i + 1}`,
                watch_max: `https://drakorid.co/watch-max/${found.slug}/${i + 1}`,
                watch_fast: `https://drakorid.co/watch-fast/${found.slug}/${i + 1}`,
              },
            })),
          },
        });
      }
    }

    if (action === "ongoing") {
      const items = await getDrakorOngoing();
      if (items.length > 0) return NextResponse.json({ success: true, items });
      return NextResponse.json({ success: true, items: REAL_DRAKOR_TRENDING });
    }

    if (action === "list") {
      const res = await getDrakorList(page);
      if (res.items.length > 0) return NextResponse.json({ success: true, ...res });
      return NextResponse.json({ success: true, page: 1, items: REAL_DRAKOR_TRENDING });
    }

    // Default: trending
    const items = await getDrakorTrending();
    if (items.length > 0) return NextResponse.json({ success: true, items });
    return NextResponse.json({ success: true, items: REAL_DRAKOR_TRENDING });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
