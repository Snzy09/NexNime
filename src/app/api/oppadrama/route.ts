import { NextRequest, NextResponse } from "next/server";
import {
  getOppaDramaLatest,
  searchOppaDrama,
  getOppaDramaDetail,
  getOppaDramaEpisode,
} from "@/lib/services/oppadramaService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "latest";
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;

  try {
    if (action === "latest" || action === "home") {
      const data = await getOppaDramaLatest(page);
      return NextResponse.json({
        success: true,
        source: "OppaDrama Live Scraper",
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
      const data = await searchOppaDrama(query.trim(), page);
      return NextResponse.json({
        success: true,
        source: "OppaDrama Live Search",
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
      const detail = await getOppaDramaDetail(target);
      return NextResponse.json({
        success: true,
        source: "OppaDrama Live Detail",
        detail,
      });
    }

    if (action === "episode") {
      const target =
        searchParams.get("url") || searchParams.get("slug") || "";
      if (!target) {
        return NextResponse.json(
          { success: false, error: "Parameter url atau slug wajib disertakan" },
          { status: 400 }
        );
      }
      const episode = await getOppaDramaEpisode(target);
      return NextResponse.json({
        success: true,
        source: "OppaDrama Live Episode Player",
        episode,
      });
    }

    return NextResponse.json(
      { success: false, error: `Aksi '${action}' tidak dikenali` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("OppaDrama API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal memproses permintaan OppaDrama",
      },
      { status: 500 }
    );
  }
}
