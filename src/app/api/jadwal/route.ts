import { NextRequest, NextResponse } from "next/server";
import { getUnifiedSchedule } from "@/lib/services/jadwalService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || searchParams.get("cat") || "all";
  const day = searchParams.get("day") || "all";

  try {
    const data = await getUnifiedSchedule(category, day);
    return NextResponse.json(
      {
        success: true,
        category,
        day,
        ...data,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err: any) {
    console.error("Error in /api/jadwal:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to load schedule",
      },
      { status: 500 }
    );
  }
}
