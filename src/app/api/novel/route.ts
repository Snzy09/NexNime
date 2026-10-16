import { NextRequest, NextResponse } from "next/server";
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
