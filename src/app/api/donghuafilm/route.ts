import { NextRequest, NextResponse } from "next/server";
import {
  getDonghuaLatest,
  searchDonghua,
  getDonghuaDetail,
  getDonghuaEpisode,
  getDonghuaDownload,
} from "@/lib/services/donghuaFilmService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "latest";
  const q = searchParams.get("q") || "";
  const slug = searchParams.get("slug") || "";
  const ep = searchParams.get("ep") || "1";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("perPage") || "20", 10);

  try {
    if (action === "latest") {
      const data = await getDonghuaLatest(page, perPage);
      return NextResponse.json({
        ...data,
        items: data.results || [],
      });
    }

    if (action === "search") {
      if (!q.trim()) {
        return NextResponse.json({ items: [], results: [] });
      }
      const data = await searchDonghua(q.trim(), page, perPage);
      return NextResponse.json({
        ...data,
        items: data.results || [],
      });
    }

    if (action === "detail") {
      if (!slug.trim()) {
        return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
      }
      const data = await getDonghuaDetail(slug.trim());
      return NextResponse.json(data);
    }

    if (action === "episode") {
      if (!slug.trim()) {
        return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
      }
      const data = await getDonghuaEpisode(slug.trim(), ep);
      return NextResponse.json(data);
    }

    if (action === "dl" || action === "download") {
      if (!slug.trim()) {
        return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
      }
      const data = await getDonghuaDownload(slug.trim());
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("API DonghuaFilm error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
