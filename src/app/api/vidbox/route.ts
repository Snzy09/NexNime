import { NextRequest, NextResponse } from "next/server";
import {
  getVidboxCatalog,
  searchVidbox,
  getVidboxDetail,
  getVidboxEpisode,
} from "@/lib/services/vidboxService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "catalog";

  try {
    if (action === "catalog") {
      const category = (searchParams.get("category") as "movies" | "series") || "movies";
      const items = await getVidboxCatalog(category);
      return NextResponse.json({
        success: true,
        source: "VidBox Live Catalog",
        category,
        count: items.length,
        items,
      });
    }

    if (action === "search") {
      const query = searchParams.get("q") || "";
      if (!query.trim()) {
        return NextResponse.json({ success: true, count: 0, items: [] });
      }
      const type = searchParams.get("type") || "all";
      const items = await searchVidbox(query.trim(), type);
      return NextResponse.json({
        success: true,
        source: "VidBox Live Search",
        query,
        count: items.length,
        items,
      });
    }

    if (action === "detail") {
      const path = searchParams.get("path") || searchParams.get("url") || "";
      if (!path) {
        return NextResponse.json(
          { success: false, error: "Parameter path/url film wajib diberikan" },
          { status: 400 }
        );
      }
      const detail = await getVidboxDetail(path);
      return NextResponse.json({
        success: !!detail,
        source: "VidBox Live Detail",
        detail,
      });
    }

    if (action === "episode") {
      const target = searchParams.get("target") || "";
      const season = searchParams.get("season") || "1";
      const ep = searchParams.get("ep") || "1";
      if (!target) {
        return NextResponse.json(
          { success: false, error: "Target series wajib diberikan" },
          { status: 400 }
        );
      }
      const data = await getVidboxEpisode(target, season, ep);
      return NextResponse.json({
        success: data.status,
        source: "VidBox Live Episode",
        data: data.data,
      });
    }

    return NextResponse.json({ success: false, error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "VidBox scraper error" },
      { status: 500 }
    );
  }
}
