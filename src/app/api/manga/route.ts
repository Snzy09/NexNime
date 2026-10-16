import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import {
  searchManga,
  getMangaDetail,
  getChapterPages,
  getChapterDl,
  getPopularManga,
  customAgent,
} from "@/lib/services/mangaService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "popular";
  const q = searchParams.get("q") || "";
  const id = searchParams.get("id") || "";
  const chapterId = searchParams.get("chapterId") || searchParams.get("url") || "";
  const lang = searchParams.get("lang") || "all";

  try {
    if (action === "image" || action === "proxy" || action === "cover") {
      const imgUrl = searchParams.get("url");
      if (!imgUrl) {
        return NextResponse.json({ error: "Missing url" }, { status: 400 });
      }

      try {
        let normalized = imgUrl.trim();
        if (normalized.startsWith("//")) normalized = "https:" + normalized;
        const parsed = new URL(normalized);
        const host = parsed.hostname.toLowerCase();
        const isAllowed =
          host === "uploads.mangadex.org" ||
          host === "mangadex.org" ||
          host.endsWith(".mangadex.network") ||
          host === "mangadex.network";

        if (!isAllowed) {
          return NextResponse.json({ error: "Forbidden host" }, { status: 403 });
        }

        const imgRes = await axios.get(normalized, {
          httpsAgent: customAgent,
          responseType: "arraybuffer",
          timeout: 20000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            Referer: "https://mangadex.org/",
          },
        });

        const contentType = String(imgRes.headers["content-type"] || "image/jpeg");
        return new NextResponse(Buffer.from(imgRes.data), {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          },
        });
      } catch (err: any) {
        console.error("Manga image proxy error:", err.message);
        return NextResponse.json({ error: "Failed to load image" }, { status: 502 });
      }
    }
    if (action === "popular") {
      const items = await getPopularManga();
      return NextResponse.json({ success: true, items });
    }

    if (action === "search") {
      if (!q.trim()) {
        const items = await getPopularManga();
        return NextResponse.json({ success: true, items });
      }
      const items = await searchManga(q.trim());
      return NextResponse.json({ success: true, items });
    }

    if (action === "detail") {
      if (!id.trim()) {
        return NextResponse.json({ success: false, error: "Missing manga id" }, { status: 400 });
      }
      const detail = await getMangaDetail(id.trim(), lang);
      if (!detail) {
        return NextResponse.json({ success: false, error: "Manga not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, detail });
    }

    if (action === "pages") {
      if (!chapterId.trim()) {
        return NextResponse.json({ success: false, error: "Missing chapterId" }, { status: 400 });
      }
      const pages = await getChapterPages(chapterId.trim());
      if (!pages) {
        return NextResponse.json({ success: false, error: "Chapter pages not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, pages });
    }

    if (action === "dl" || action === "download") {
      if (!chapterId.trim()) {
        return NextResponse.json({ success: false, error: "Missing chapterId or url" }, { status: 400 });
      }
      const dlData = await getChapterDl(chapterId.trim());
      if (!dlData) {
        return NextResponse.json({ success: false, error: "Failed to fetch chapter download data" }, { status: 404 });
      }
      return NextResponse.json({ success: true, ...dlData });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("API MangaDex error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
