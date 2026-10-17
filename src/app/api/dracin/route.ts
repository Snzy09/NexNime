import { NextResponse } from "next/server";
import {
  getDracinHome,
  getDracinList,
  searchDracin,
  getDracinDetail,
  getDracinEpisode,
} from "@/lib/services/dracinService";
import {
  getFreeReelsFeed,
  getFreeReelsPopular,
  getFreeReelsSoon,
  getFreeReelsFreeSoon,
  getFreeReelsCategories,
  getFreeReelsCategory,
  getFreeReelsTrending,
  searchFreeReels,
  getFreeReelsInfo,
  getFreeReelsEpisodes,
  getFreeReelsStream,
  getPineDramaLanguages,
  getPineDramaPopular,
  getPineDramaTrending,
  getPineDramaCategories,
  searchPineDrama,
  getPineDramaInfo,
  getPineDramaEpisodes,
  getPineDramaStream,
  getMeloloCategories,
  searchMelolo,
  getMeloloEpisodes,
  getMeloloStream,
} from "@/lib/services/dramoxService";
import { REAL_DRACIN_SHORTS } from "@/lib/services/realDataFallback";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = (searchParams.get("provider") || "").toLowerCase();
  const action = searchParams.get("action") || "home";
  const q = searchParams.get("q") || "";
  const id = searchParams.get("id") || searchParams.get("slug") || "";
  const ep = searchParams.get("ep") || "1";
  const lang = searchParams.get("lang") || "id";
  const limit = parseInt(searchParams.get("limit") || "15", 10);

  try {
    // -------------------------------------------------------------
    // Universal: Subtitle Proxy (SRT to WebVTT with CORS)
    // -------------------------------------------------------------
    if (action === "subtitle") {
      const subUrl = searchParams.get("url");
      if (!subUrl) {
        return new NextResponse("Missing url parameter", { status: 400 });
      }
      try {
        const subRes = await fetch(subUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        if (!subRes.ok) {
          return new NextResponse("Failed to fetch upstream subtitle", { status: subRes.status });
        }
        const text = await subRes.text();
        let vtt = text;
        if (!text.trim().startsWith("WEBVTT")) {
          const content = text.replace(/\r\n|\r/g, "\n").trim();
          const converted = content.replace(
            /(\d{2}:\d{2}:\d{2}),(\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}),(\d{3})/g,
            "$1.$2 --> $3.$4"
          );
          vtt = `WEBVTT\n\n${converted}`;
        }
        return new NextResponse(vtt, {
          status: 200,
          headers: {
            "Content-Type": "text/vtt; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      } catch (err: any) {
        return new NextResponse("Error fetching subtitle: " + err?.message, { status: 500 });
      }
    }

    // -------------------------------------------------------------
    // Provider: FreeReels
    // -------------------------------------------------------------
    if (provider === "freereels") {
      if (action === "feed" || action === "home") {
        const items = await getFreeReelsFeed(limit);
        return NextResponse.json({ success: true, items });
      }
      if (action === "popular") {
        const items = await getFreeReelsPopular(limit);
        return NextResponse.json({ success: true, items });
      }
      if (action === "soon") {
        const items = await getFreeReelsSoon(limit);
        return NextResponse.json({ success: true, items });
      }
      if (action === "freesoon") {
        const items = await getFreeReelsFreeSoon(limit);
        return NextResponse.json({ success: true, items });
      }
      if (action === "categories") {
        const categories = await getFreeReelsCategories();
        return NextResponse.json({ success: true, categories });
      }
      if (action === "category" && id) {
        const items = await getFreeReelsCategory(id, limit);
        return NextResponse.json({ success: true, items });
      }
      if (action === "trending") {
        const trending = await getFreeReelsTrending();
        return NextResponse.json({ success: true, trending });
      }
      if (action === "search" && q) {
        const items = await searchFreeReels(q, limit);
        return NextResponse.json({ success: true, items });
      }
      if ((action === "detail" || action === "episodes") && id) {
        const episodes = await getFreeReelsEpisodes(id);
        const info = await getFreeReelsInfo(id);
        return NextResponse.json({
          success: true,
          episodes: episodes && episodes.success !== false ? episodes : null,
          info: info && info.success !== false ? info : null,
        });
      }
      if (action === "stream" && id) {
        const stream = await getFreeReelsStream(id, ep);
        if (stream && (stream.stream_url || stream.proxy_stream_url || stream.raw_stream_url)) {
          return NextResponse.json({ success: true, stream });
        }
        return NextResponse.json({ success: false, error: "Stream video FreeReels tidak tersedia." }, { status: 404 });
      }
    }

    // -------------------------------------------------------------
    // Provider: PineDrama
    // -------------------------------------------------------------
    if (provider === "pinedrama") {
      if (action === "languages") {
        const languages = await getPineDramaLanguages();
        return NextResponse.json({ success: true, languages });
      }
      if (action === "popular" || action === "home") {
        const items = await getPineDramaPopular(lang, limit);
        return NextResponse.json({ success: true, items });
      }
      if (action === "trending") {
        const items = await getPineDramaTrending(lang, limit);
        return NextResponse.json({ success: true, items });
      }
      if (action === "categories") {
        const categories = await getPineDramaCategories(lang);
        return NextResponse.json({ success: true, categories });
      }
      if (action === "search" && q) {
        const items = await searchPineDrama(q, lang, limit);
        return NextResponse.json({ success: true, items });
      }
      if ((action === "detail" || action === "episodes") && id) {
        const episodes = await getPineDramaEpisodes(id);
        const info = await getPineDramaInfo(id, lang);
        return NextResponse.json({ success: true, episodes, info });
      }
      if (action === "stream" && id) {
        const stream = await getPineDramaStream(id, ep, lang);
        if (stream && (stream.stream_url || stream.success)) {
          return NextResponse.json({ success: true, stream });
        }
        return NextResponse.json({ success: false, error: "Stream video PineDrama tidak tersedia." }, { status: 404 });
      }
    }

    // -------------------------------------------------------------
    // Provider: Melolo
    // -------------------------------------------------------------
    if (provider === "melolo") {
      if (action === "categories") {
        const categories = await getMeloloCategories();
        return NextResponse.json({ success: true, categories });
      }
      if (action === "search" && q) {
        const items = await searchMelolo(q, limit, lang);
        return NextResponse.json({ success: true, items });
      }
      if (action === "episodes" && id) {
        const episodes = await getMeloloEpisodes(id);
        return NextResponse.json({ success: true, episodes });
      }
      if (action === "stream" && id) {
        const stream = await getMeloloStream(id, ep, lang);
        if (stream && (stream.stream_url || stream.success)) {
          return NextResponse.json({ success: true, stream });
        }
        return NextResponse.json({ success: false, error: "Stream video Melolo tidak tersedia." }, { status: 404 });
      }
    }

    // -------------------------------------------------------------
    // Default & Multi-Provider Search
    // -------------------------------------------------------------
    if (action === "search" && q) {
      const [asiaItems, freeReelsItems, pineItems] = await Promise.all([
        searchDracin(q).catch(() => []),
        searchFreeReels(q, 10).catch(() => []),
        searchPineDrama(q, "id", 10).catch(() => []),
      ]);

      const normalizedFreeReels = freeReelsItems.map((f) => ({
        id: f.id || f.key,
        title: f.name || f.title,
        slug: f.id || f.key,
        image: f.cover,
        episodes: 80,
        provider: "freereels",
        url: `/dracin/watch?provider=freereels&id=${encodeURIComponent(f.id || f.key || "")}&title=${encodeURIComponent(f.name || f.title || "")}`,
      }));

      const normalizedPine = pineItems.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.id,
        image: p.cover,
        episodes: p.total || 50,
        provider: "pinedrama",
        url: `/dracin/watch?provider=pinedrama&id=${encodeURIComponent(p.id)}&title=${encodeURIComponent(p.title)}`,
      }));

      const combined = [...asiaItems, ...normalizedFreeReels, ...normalizedPine];
      if (combined.length > 0) return NextResponse.json({ success: true, items: combined });

      const filtered = REAL_DRACIN_SHORTS.filter((d) =>
        d.title.toLowerCase().includes(q.toLowerCase())
      );
      return NextResponse.json({ success: true, items: filtered });
    }

    // AsiaBox Fallback endpoints
    if (action === "detail" && id) {
      const detail = await getDracinDetail(id);
      if (detail && detail.episodes.length > 0) return NextResponse.json({ success: true, detail });

      const found = REAL_DRACIN_SHORTS.find((d) => d.slug === id) || REAL_DRACIN_SHORTS[0];
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

    if (action === "episode" && id) {
      const epNum = parseInt(ep, 10);
      let episode = await getDracinEpisode(id, epNum);
      if (!episode || !episode.video) {
        const detail = await getDracinDetail(id);
        const found = detail?.episodes?.find((e) => e.number === epNum);
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

    // Default: AsiaBox Home
    const items = await getDracinHome();
    if (items.length > 0) return NextResponse.json({ success: true, items });
    return NextResponse.json({ success: true, items: REAL_DRACIN_SHORTS });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
