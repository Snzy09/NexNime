"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Tv,
  Play,
  RotateCcw,
  Download,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Server,
  PictureInPicture2,
} from "lucide-react";
import { Suspense } from "react";
import { SamehadakuEpisodeStream } from "@/lib/services/samehadakuService";
import { useMiniPlayer } from "@/lib/hooks/useMiniPlayer";

function SamehadakuReaderContent({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get("url") || "";
  const animeTitle = searchParams.get("animeTitle") || "";

  const [loading, setLoading] = useState(true);
  const [streamData, setStreamData] = useState<SamehadakuEpisodeStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeServerIdx, setActiveServerIdx] = useState(0);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const { isPipActive, togglePictureInPicture } = useMiniPlayer({
    containerRef: playerContainerRef,
    title: streamData?.title || animeTitle || params.slug,
  });

  useEffect(() => {
    setLoading(true);
    const targetSlug = rawUrl || params.slug;
    fetch(`/api/samehadaku?action=episode&slug=${encodeURIComponent(targetSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stream) {
          setStreamData(data.stream);
        } else {
          setError(data.error || "Gagal memuat player episode Samehadaku");
        }
      })
      .catch((err) => {
        setError(err.message || "Gagal menghubungi scraper episode");
      })
      .finally(() => setLoading(false));
  }, [params.slug, rawUrl]);

  const activeServer = streamData?.servers?.[activeServerIdx];

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-amber-400 selection:text-black">
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-50 bg-[#0C0C12]/95 backdrop-blur-md border-b border-white/10 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Back link */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <div className="border-l border-white/10 pl-3">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                SAMEHADAKU ANIME STREAMING PLAYER
              </span>
              <h1 className="text-xs sm:text-sm font-black text-white truncate max-w-xs sm:max-w-md">
                {streamData?.title || animeTitle || params.slug}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={togglePictureInPicture}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isPipActive
                ? "bg-amber-400 text-black border-amber-400 font-bold"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-200"
            }`}
            title="Mini Floating Player (Tetap tampil saat Chrome diminimalkan)"
          >
            <PictureInPicture2 className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Floating Player</span>
          </button>
        </div>
      </header>

      {/* Main Streaming & Reading Stage */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full space-y-6">
        {/* Loading State: Skeleton Loader */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="aspect-video w-full rounded-2xl bg-white/10 border border-white/5 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/15 mx-auto" />
                <div className="h-4 w-48 bg-white/15 rounded mx-auto" />
                <div className="h-3 w-32 bg-white/10 rounded mx-auto" />
              </div>
            </div>
            <div className="h-14 rounded-xl bg-white/5 p-4 flex gap-3">
              <div className="h-8 w-24 bg-white/10 rounded-lg" />
              <div className="h-8 w-24 bg-white/10 rounded-lg" />
              <div className="h-8 w-24 bg-white/10 rounded-lg" />
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl bg-rose-950/30 border border-rose-500/30 p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Gagal Memuat Stream</h2>
            <p className="text-sm text-gray-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-full bg-amber-400 text-black font-bold text-xs"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Real Stream Player & Viewport */}
        {!loading && streamData && (
          <div className="space-y-6">
            {/* Video / Embed Frame */}
            <div
              ref={playerContainerRef}
              className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl"
            >
              {activeServer?.url ? (
                <iframe
                  src={activeServer.url}
                  className="w-full h-full border-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                />
              ) : activeServer?.embed ? (
                <div
                  dangerouslySetInnerHTML={{ __html: activeServer.embed }}
                  className="w-full h-full flex items-center justify-center"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <Play className="w-12 h-12 text-amber-400" />
                  <p className="text-sm text-gray-300">
                    Pilih server aktif dari daftar server di bawah untuk memutar episode ini.
                  </p>
                </div>
              )}
            </div>

            {/* Server Selector Bar */}
            <div className="rounded-2xl bg-[#12121A] border border-white/10 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-amber-400" />
                  <span>PILIH SERVER STREAMING REAL (SAMEHADAKU):</span>
                </span>
                <span className="text-[10px] text-gray-400">
                  {streamData.servers.length} Server Tersedia
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {streamData.servers.map((srv, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveServerIdx(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      activeServerIdx === idx
                        ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                        : "bg-[#181824] text-gray-300 hover:bg-[#202030] border border-white/5"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <span>{srv.server || `Server ${idx + 1}`}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Downloads list from Scraper (if available) */}
            {streamData.downloads && streamData.downloads.length > 0 && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-4 sm:p-5 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>DOWNLOAD EPISODE LENGKAP:</span>
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {streamData.downloads.map((dl, idx) => (
                    <a
                      key={idx}
                      href={dl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 text-xs font-semibold text-gray-300 hover:text-emerald-300 flex items-center justify-between transition-colors"
                    >
                      <span className="truncate">{dl.host}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SamehadakuReaderPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070A] text-white flex items-center justify-center">
          <div className="text-center space-y-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-amber-400/20 mx-auto" />
            <p className="text-xs text-amber-300 font-mono">Memuat Samehadaku Reader...</p>
          </div>
        </div>
      }
    >
      <SamehadakuReaderContent params={params} />
    </Suspense>
  );
}
