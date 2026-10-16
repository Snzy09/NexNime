import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import {
  getNovelLatest,
  searchNovel,
  getNovelDetail,
  readNovelChapter,
} from "@/lib/services/novelService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "latest";
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;

  try {
    // 1. Image Proxy to bypass hotlink protection & CORS for novel covers
    if (action === "image" || action === "proxy" || action === "poster") {
      const imgUrl = searchParams.get("url") || "";
      if (!imgUrl) {
        return new NextResponse("Missing url parameter", { status: 400 });
      }

      let targetUrl = decodeURIComponent(imgUrl);
      if (targetUrl.startsWith("//")) {
        targetUrl = "https:" + targetUrl;
      } else if (!targetUrl.startsWith("http")) {
        targetUrl = "https://bacaln.com/" + targetUrl.replace(/^\//, "");
      }

      try {
        const imgRes = await axios.get(targetUrl, {
          responseType: "arraybuffer",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
            Referer: "https://bacaln.com/",
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
        console.error("Novel image proxy error:", err.message);
        return new NextResponse("Failed to load image", { status: 404 });
      }
    }

    if (action === "latest" || action === "home") {
      const data = await getNovelLatest(page);
      return NextResponse.json({
        success: true,
        source: "BacaLN Live Scraper",
        page: data.page,
        totalItems: data.total,
        items: data.results,
      });
    }

    if (action === "search") {
      const query = searchParams.get("q") || "";
      if (!query.trim()) {
        return NextResponse.json({
          success: true,
          query: "",
          page: 1,
          totalItems: 0,
          items: [],
        });
      }
      const data = await searchNovel(query.trim(), page);
      return NextResponse.json({
        success: true,
        source: "BacaLN Live Search",
        query: data.query,
        page: data.page,
        totalItems: data.total,
        items: data.results,
      });
    }

    if (action === "detail") {
      const target =
        searchParams.get("url") || searchParams.get("slug") || "";
      if (!target) {
        return NextResponse.json(
          { success: false, error: "Parameter url atau slug wajib disertakan" },
          { status: 400 }
        );
      }
      const detail = await getNovelDetail(target);
      return NextResponse.json({
        success: true,
        source: "BacaLN Live Detail",
        detail,
      });
    }

    if (action === "read") {
      const target =
        searchParams.get("url") || searchParams.get("slug") || "";
      if (!target) {
        return NextResponse.json(
          { success: false, error: "Parameter url atau slug wajib disertakan" },
          { status: 400 }
        );
      }
      const chapterData = await readNovelChapter(target);
      return NextResponse.json({
        success: true,
        source: "BacaLN Live Chapter Reader",
        chapter: chapterData,
      });
    }

    return NextResponse.json(
      { success: false, error: `Aksi '${action}' tidak dikenali` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Novel API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal memproses permintaan Novel",
      },
      { status: 500 }
    );
  }
}
