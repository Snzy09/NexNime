import { NextResponse } from "next/server";
import {
  getAnimeHome,
  getDonghuaHome,
  searchAnime,
  getAnimeDetail,
  getAnimeWatch,
  getAnimeSchedule,
} from "@/lib/services/animeService";
import { REAL_ANIME_POPULAR, REAL_SCHEDULE } from "@/lib/services/realDataFallback";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "popular";
  const q = searchParams.get("q");
  const slug = searchParams.get("slug");
  const watchUrl = searchParams.get("watchUrl");

  try {
    if (action === "search" && q) {
      const items = await searchAnime(q);
      if (items.length > 0) return NextResponse.json({ success: true, items });
      const filtered = REAL_ANIME_POPULAR.filter((a) =>
        a.title.toLowerCase().includes(q.toLowerCase())
      );
      return NextResponse.json({ success: true, items: filtered });
    }

    if (action === "detail" && slug) {
      const detail = await getAnimeDetail(slug);
      if (detail) return NextResponse.json({ success: true, detail });
      const found = REAL_ANIME_POPULAR.find((a) => a.slug === slug);
      if (found) {
        return NextResponse.json({
          success: true,
          detail: {
            title: found.title,
            slug: found.slug,
            url: found.url,
            poster: found.poster,
            synopsis: found.info || "Sinopsis anime subtitle Indonesia resmi.",
            genres: found.genres || ["Action", "Fantasy"],
            facts: { Tipe: found.type || "TV", Status: found.status || "Ongoing", Skor: found.rating || "9.0" },
            total_episode: 24,
            episodes: Array.from({ length: 24 }, (_, i) => ({
              episode: `Episode ${i + 1}`,
              url: `${found.url}episode-${i + 1}`,
              slug: `${found.slug}-episode-${i + 1}`,
            })),
          },
        });
      }
    }

    if (action === "watch" && watchUrl) {
      const stream = await getAnimeWatch(watchUrl);
      if (stream) return NextResponse.json({ success: true, stream });
    }

    if (action === "donghua") {
      const items = await getDonghuaHome();
      if (items.length > 0) return NextResponse.json({ success: true, items });
    }

    if (action === "schedule") {
      const schedule = await getAnimeSchedule();
      return NextResponse.json({ success: true, schedule });
    }

    // Default: Scrape real live ongoing & popular anime from AnimeIndo
    const liveAnime = await getAnimeHome();
    if (liveAnime.length > 0) {
      return NextResponse.json({ success: true, items: liveAnime });
    }

    return NextResponse.json({ success: true, items: REAL_ANIME_POPULAR });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
