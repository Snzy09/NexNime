import { NextRequest, NextResponse } from "next/server";
import {
  getAnimeSailLatest,
  searchAnimeSail,
  getAnimeSailMovie,
  getAnimeSailDonghua,
  getAnimeSailSchedule,
  getAnimeSailEpisode,
  getAnimeSailDetail,
} from "@/lib/services/animesailService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "latest";
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;

  try {
    if (action === "latest" || action === "home") {
      const result = await getAnimeSailLatest(page);
      return NextResponse.json({
        success: true,
        source: "AnimeSail Live Scraper",
        ...result,
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
      const result = await searchAnimeSail(query.trim(), page);
      return NextResponse.json({
        success: true,
        source: "AnimeSail Live Search",
        ...result,
      });
    }

    if (action === "movie") {
      const result = await getAnimeSailMovie(page);
      return NextResponse.json({
        success: true,
        source: "AnimeSail Movie Scraper",
        ...result,
      });
    }

    if (action === "donghua") {
      const result = await getAnimeSailDonghua(page);
      return NextResponse.json({
        success: true,
        source: "AnimeSail Donghua Scraper",
        ...result,
      });
    }

    if (action === "schedule") {
      const result = await getAnimeSailSchedule();
      return NextResponse.json({
        success: true,
        source: "AnimeSail Schedule Scraper",
        ...result,
      });
    }

    if (action === "episode") {
      const url = searchParams.get("url") || searchParams.get("slug") || "";
      if (!url) {
        return NextResponse.json(
          { success: false, error: "Parameter url atau slug wajib disertakan" },
          { status: 400 }
        );
      }
      const epData = await getAnimeSailEpisode(url);
      return NextResponse.json({
        success: true,
        source: "AnimeSail Live Episode Player",
        episode: epData,
      });
    }

    if (action === "detail") {
      const url = searchParams.get("url") || searchParams.get("slug") || "";
      if (!url) {
        return NextResponse.json(
          { success: false, error: "Parameter url atau slug wajib disertakan" },
          { status: 400 }
        );
      }
      const animeData = await getAnimeSailDetail(url);
      return NextResponse.json({
        success: true,
        source: "AnimeSail Live Detail",
        detail: animeData,
      });
    }

    return NextResponse.json(
      { success: false, error: `Aksi '${action}' tidak dikenali` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("AnimeSail API Route Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal memproses permintaan AnimeSail",
      },
      { status: 500 }
    );
  }
}
