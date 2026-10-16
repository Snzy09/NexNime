import { NextRequest, NextResponse } from "next/server";
import {
  getNetShortList,
  searchNetShort,
  getNetShortDetail,
  getNetShortStream,
} from "@/lib/services/netshortService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "list";

  try {
    if (action === "list" || action === "popular" || action === "all") {
      const items = await getNetShortList();
      return NextResponse.json({
        success: true,
        source: "NetShort Live Scraper",
        count: items.length,
        items,
      });
    }

    if (action === "search") {
      const query = searchParams.get("q") || "";
      if (!query.trim()) {
        return NextResponse.json({ success: true, count: 0, items: [] });
      }
      const data = await searchNetShort(query.trim());
      return NextResponse.json({
        success: true,
        source: "NetShort Live Search",
        query,
        total: data.total,
        count: data.results.length,
        items: data.results,
      });
    }

    if (action === "detail") {
      const slug = searchParams.get("slug") || searchParams.get("url") || "";
      if (!slug) {
        return NextResponse.json(
          { success: false, error: "Parameter slug atau url drama wajib diberikan" },
          { status: 400 }
        );
      }
      const detail = await getNetShortDetail(slug);
      return NextResponse.json({
        success: !!detail,
        source: "NetShort Live Detail & Stream",
        detail,
      });
    }

    if (action === "stream") {
      const slug = searchParams.get("slug") || "";
      if (!slug) {
        return NextResponse.json(
          { success: false, error: "Parameter slug episode wajib diberikan" },
          { status: 400 }
        );
      }
      const stream = await getNetShortStream(slug);
      return NextResponse.json({
        success: stream.success,
        source: "NetShort Live Video Stream",
        slug: stream.slug,
        stream_url: stream.stream_url,
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
        error: error.message || "Gagal mengambil data dari NetShort",
      },
      { status: 500 }
    );
  }
}
