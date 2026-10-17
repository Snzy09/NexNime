import { NextRequest, NextResponse } from "next/server";
import {
  getAnichinHome,
  getAnichinPopular,
  searchAnichin,
  getAnichinDetail,
  getAnichinEpisodes,
  getAnichinStream,
  getAnichinJadwal,
  getAnichinGenres,
  getAnichinByGenre,
  getAnichinSeasons,
  getAnichinBySeason,
} from "@/lib/services/anichinService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = (searchParams.get("action") || "home").toLowerCase();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const q = searchParams.get("q") || searchParams.get("query") || "";
  const slug = searchParams.get("slug") || searchParams.get("url") || "";
  const day = searchParams.get("day") || "";
  const genre = searchParams.get("genre") || searchParams.get("name") || "";
  const season = searchParams.get("season") || searchParams.get("name") || "";

  try {
    // 1. Image Proxy
    if (action === "image" || action === "proxy") {
      const imgUrl = searchParams.get("url") || "";
      if (!imgUrl) return new NextResponse("Missing url parameter", { status: 400 });

      let targetUrl = decodeURIComponent(imgUrl);
      if (targetUrl.startsWith("//")) targetUrl = "https:" + targetUrl;
      else if (!targetUrl.startsWith("http")) targetUrl = "https://anichin.moe/" + targetUrl.replace(/^\//, "");

      try {
        const res = await fetch(targetUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
            Referer: "https://anichin.moe/",
          },
        });
        if (!res.ok) return new NextResponse("Failed to load image", { status: res.status });
        const buf = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") || "image/webp";
        return new NextResponse(buf, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          },
        });
      } catch (err: any) {
        return new NextResponse("Error proxying image", { status: 500 });
      }
    }

    // 2. Home / Latest
    if (action === "home" || action === "latest") {
      const data = await getAnichinHome(page);
      return NextResponse.json({
        success: true,
        provider: "AniChin",
        ...data,
      });
    }

    // 3. Popular
    if (action === "popular" || action === "populer") {
      const items = await getAnichinPopular(page);
      return NextResponse.json({
        success: true,
        source: "AniChin Live Popular",
        page,
        count: items.length,
        items,
      });
    }

    // 4. Search
    if (action === "search") {
      if (!q.trim()) return NextResponse.json({ success: true, count: 0, items: [] });
      const items = await searchAnichin(q.trim(), page);
      return NextResponse.json({
        success: true,
        source: "AniChin Live Search",
        query: q,
        page,
        count: items.length,
        items,
      });
    }

    // 5. Detail
    if (action === "detail") {
      if (!slug) return NextResponse.json({ success: false, error: "Slug/URL anime wajib diisi" }, { status: 400 });
      const detail = await getAnichinDetail(slug);
      return NextResponse.json({
        success: !!detail,
        source: "AniChin Live Detail",
        detail,
      });
    }

    // 6. Episodes List
    if (action === "episode" || action === "episodes") {
      if (!slug) return NextResponse.json({ success: false, error: "Slug/URL anime wajib diisi" }, { status: 400 });
      const data = await getAnichinEpisodes(slug);
      return NextResponse.json({
        success: true,
        provider: "AniChin",
        ...data,
      });
    }

    // 7. Stream / Watch Episode
    if (action === "stream" || action === "watch") {
      if (!slug) return NextResponse.json({ success: false, error: "Slug/URL episode wajib diisi" }, { status: 400 });
      const stream = await getAnichinStream(slug);
      return NextResponse.json({
        success: !!stream,
        source: "AniChin Live Stream",
        stream,
      });
    }

    // 8. Jadwal
    if (action === "jadwal" || action === "schedule") {
      const data = await getAnichinJadwal(day);
      return NextResponse.json({
        success: true,
        provider: "AniChin",
        ...data,
      });
    }

    // 9. List Genres & Filter by Genre
    if (action === "listgenre" || action === "genres") {
      const items = await getAnichinGenres();
      return NextResponse.json({
        success: true,
        source: "AniChin Live Genres",
        count: items.length,
        items,
      });
    }

    if (action === "genre") {
      if (!genre) return NextResponse.json({ success: false, error: "Nama genre wajib diisi" }, { status: 400 });
      const data = await getAnichinByGenre(genre, page);
      return NextResponse.json({
        success: true,
        source: "AniChin Live Genre",
        ...data,
      });
    }

    // 10. List Seasons & Filter by Season
    if (action === "listseason" || action === "seasons") {
      const items = await getAnichinSeasons();
      return NextResponse.json({
        success: true,
        source: "AniChin Live Seasons",
        count: items.length,
        items,
      });
    }

    if (action === "season") {
      if (!season) return NextResponse.json({ success: false, error: "Nama season wajib diisi" }, { status: 400 });
      const data = await getAnichinBySeason(season, page);
      return NextResponse.json({
        success: true,
        source: "AniChin Live Season",
        ...data,
      });
    }

    return NextResponse.json({ success: false, error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error: any) {
    console.error("AniChin API route error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
