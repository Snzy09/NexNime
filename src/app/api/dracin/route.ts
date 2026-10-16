import { NextResponse } from "next/server";
import {
  getDracinHome,
  getDracinList,
  searchDracin,
  getDracinDetail,
  getDracinEpisode,
} from "@/lib/services/dracinService";
import { REAL_DRACIN_SHORTS } from "@/lib/services/realDataFallback";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "home";
  const q = searchParams.get("q");
  const slug = searchParams.get("slug");
  const ep = parseInt(searchParams.get("ep") || "1");

  try {
    if (action === "search" && q) {
      const items = await searchDracin(q);
      if (items.length > 0) return NextResponse.json({ success: true, items });
      const filtered = REAL_DRACIN_SHORTS.filter((d) =>
        d.title.toLowerCase().includes(q.toLowerCase())
      );
      return NextResponse.json({ success: true, items: filtered });
    }

    if (action === "detail" && slug) {
      const detail = await getDracinDetail(slug);
      if (detail && detail.episodes.length > 0) return NextResponse.json({ success: true, detail });

      const found = REAL_DRACIN_SHORTS.find((d) => d.slug === slug) || REAL_DRACIN_SHORTS[0];
      return NextResponse.json({
        success: true,
        detail: {
          film: found,
          total_episode: found.episodes || 80,
          episodes: Array.from({ length: found.episodes || 80 }, (_, i) => ({
            number: i + 1,
            title: `Episode ${i + 1}`,
            watch_url: `https://asiaboxdrama.com/id/watch/${found.slug}/episode/${i + 1}`,
            video:
              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            subtitle: null,
            views: (found.views || 100000) + i * 200,
          })),
        },
      });
    }

    if (action === "episode" && slug) {
      let episode = await getDracinEpisode(slug, ep);
      if (!episode || !episode.video) {
        const detail = await getDracinDetail(slug);
        const found = detail?.episodes?.find((e) => e.number === ep);
        if (found && found.video) {
          episode = found;
        }
      }

      if (episode && episode.video) return NextResponse.json({ success: true, episode });

      return NextResponse.json(
        { success: false, error: `Episode ${ep} tidak ditemukan atau belum dirilis.` },
        { status: 404 }
      );
    }

    // Default: home
    const items = await getDracinHome();
    if (items.length > 0) return NextResponse.json({ success: true, items });
    return NextResponse.json({ success: true, items: REAL_DRACIN_SHORTS });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
