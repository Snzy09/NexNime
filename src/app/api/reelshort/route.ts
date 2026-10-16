import { NextRequest, NextResponse } from "next/server";
import {
  getPopularReelShort,
  searchReelShort,
  getReelShortDetail,
} from "@/lib/services/reelshortService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "popular";

  try {
    if (action === "popular") {
      const category = searchParams.get("category") || "Billionaire";
      const items = await getPopularReelShort(category);
      return NextResponse.json({
        success: true,
        source: "ReelShort Live Scraper",
        category,
        count: items.length,
        items,
      });
    }

    if (action === "search") {
      const query = searchParams.get("q") || "";
      const page = parseInt(searchParams.get("page") || "1", 10);
      if (!query.trim()) {
        return NextResponse.json({ success: true, count: 0, items: [] });
      }
      const data = await searchReelShort(query.trim(), page);
      return NextResponse.json({
        success: true,
        source: "ReelShort Live Search",
        query,
        total: data.total,
        count: data.results.length,
        items: data.results,
      });
    }

    if (action === "detail") {
      const id = searchParams.get("id") || searchParams.get("url") || "";
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Parameter id atau url drama wajib diberikan" },
          { status: 400 }
        );
      }
      const detail = await getReelShortDetail(id);
      return NextResponse.json({
        success: !!detail,
        source: "ReelShort Live Detail & Stream",
        detail,
      });
    }

    return NextResponse.json({ success: false, error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "ReelShort scraper error" },
      { status: 500 }
    );
  }
}
