import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import {
  getAnimeXinLatest,
  searchAnimeXin,
  getAnimeXinDetail,
} from "@/lib/services/animexinService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "latest";

  try {
    if (action === "image" || action === "proxy" || action === "poster") {
      const imgUrl = searchParams.get("url") || "";
      if (!imgUrl) {
        return new NextResponse("Missing url parameter", { status: 400 });
      }

      let targetUrl = decodeURIComponent(imgUrl);
      if (targetUrl.startsWith("//")) {
        targetUrl = "https:" + targetUrl;
      } else if (!targetUrl.startsWith("http")) {
        targetUrl = "https://animexin.dev/" + targetUrl.replace(/^\//, "");
      }

      try {
        const imgRes = await axios.get(targetUrl, {
          responseType: "arraybuffer",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            Referer: "https://animexin.dev/",
            Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          },
          timeout: 15000,
        });

        const contentType = String(imgRes.headers["content-type"] || "image/jpeg");
        return new NextResponse(Buffer.from(imgRes.data), {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control":
              "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          },
        });
      } catch (err: any) {
        console.error("AnimeXin image proxy error:", err.message);
        return new NextResponse("Failed to load image", { status: 404 });
      }
    }

    if (action === "latest" || action === "home" || action === "popular") {
      const items = await getAnimeXinLatest();
      return NextResponse.json({
        success: true,
        source: "AnimeXin Live Scraper",
        count: items.length,
        items,
      });
    }

    if (action === "search") {
      const query = searchParams.get("q") || "";
      if (!query.trim()) {
        return NextResponse.json({ success: true, count: 0, items: [] });
      }
      const items = await searchAnimeXin(query.trim());
      return NextResponse.json({
        success: true,
        source: "AnimeXin Live Search",
        query,
        count: items.length,
        items,
      });
    }

    if (action === "detail") {
      const url =
        searchParams.get("url") || searchParams.get("slug") || "";
      if (!url) {
        return NextResponse.json(
          { success: false, error: "Parameter url atau slug wajib diberikan" },
          { status: 400 }
        );
      }
      const detail = await getAnimeXinDetail(url);
      return NextResponse.json({
        success: !!detail,
        source: "AnimeXin Live Detail & Stream",
        detail,
      });
    }

    return NextResponse.json(
      { success: false, error: "Aksi tidak dikenali" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal mengambil data dari AnimeXin",
      },
      { status: 500 }
    );
  }
}
