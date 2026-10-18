import { NextRequest, NextResponse } from "next/server";

interface SyncRecord {
  history: any[];
  expiresAt: number;
}

// In-memory global store with 24h TTL
const syncStore: Map<string, SyncRecord> =
  (globalThis as any).__syncHistoryStore || new Map();
(globalThis as any).__syncHistoryStore = syncStore;

function cleanupExpired() {
  const now = Date.now();
  for (const [code, record] of syncStore.entries()) {
    if (record.expiresAt < now) {
      syncStore.delete(code);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    cleanupExpired();
    const body = await req.json();
    const history = body?.history;

    if (!Array.isArray(history) || history.length === 0) {
      return NextResponse.json(
        { success: false, error: "Riwayat tontonan kosong atau tidak valid." },
        { status: 400 }
      );
    }

    // Generate unique 6-digit sync code
    let code = "";
    for (let i = 0; i < 5; i++) {
      const candidate = Math.floor(100000 + Math.random() * 900000).toString();
      if (!syncStore.has(candidate)) {
        code = candidate;
        break;
      }
    }
    if (!code) {
      code = Date.now().toString().slice(-6);
    }

    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    syncStore.set(code, {
      history,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      code,
      itemCount: history.length,
      expiresAt,
      message: `Kode sinkronisasi ${code} berhasil dibuat (berlaku 24 jam).`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Gagal membuat kode sinkronisasi." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    cleanupExpired();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Parameter kode wajib disertakan." },
        { status: 400 }
      );
    }

    const record = syncStore.get(code);
    if (!record || record.expiresAt < Date.now()) {
      return NextResponse.json(
        {
          success: false,
          error: "Kode sinkronisasi tidak ditemukan atau telah kedaluwarsa.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      history: record.history,
      itemCount: record.history.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Gagal mengambil data sinkronisasi." },
      { status: 500 }
    );
  }
}
