import { NextRequest, NextResponse } from "next/server";
import {
  getSamehadakuPopular,
  searchSamehadaku,
  getSamehadakuDetail,
  getSamehadakuEpisode,
} from "@/lib/services/samehadakuService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "popular";

  try {
    if (action === "popular") {
      const items = await getSamehadakuPopular(20);
      return NextResponse.json({
        success: true,
        source: "Samehadaku Live Scraper",
        count: items.length,
        items,
      });
    }

    if (action === "search") {
      const query = searchParams.get("q") || "";
      if (!query.trim()) {
        return NextResponse.json({ success: true, count: 0, items: [] });
      }
      const items = await searchSamehadaku(query.trim());
      return NextResponse.json({
        success: true,
        source: "Samehadaku Live Search",
        query,
        count: items.length,
        items,
      });
    }

    if (action === "detail") {
      const slug = searchParams.get("slug") || searchParams.get("url") || "";
      if (!slug) {
        return NextResponse.json(
          { success: false, error: "Slug atau URL wajib diberikan" },
          { status: 400 }
        );
      }
      const detail = await getSamehadakuDetail(slug);
      return NextResponse.json({
        success: !!detail,
        source: "Samehadaku Live Detail",
        detail,
      });
    }

    if (action === "episode") {
      const slug = searchParams.get("slug") || searchParams.get("url") || "";
      if (!slug) {
        return NextResponse.json(
          { success: false, error: "Slug atau URL episode wajib diberikan" },
          { status: 400 }
        );
      }
      const stream = await getSamehadakuEpisode(slug);
      return NextResponse.json({
        success: !!stream,
        source: "Samehadaku Live Episode",
        stream,
      });
    }

    return NextResponse.json({ success: false, error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Samehadaku scraper error" },
      { status: 500 }
    );
  }
}
