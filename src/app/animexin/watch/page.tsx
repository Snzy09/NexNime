"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Tv,
  Star,
  Layers,
  Server,
  ListOrdered,
  AlertCircle,
  Share2,
  Sparkles,
  Loader2,
  ChevronRight,
  PictureInPicture2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import { AnimeXinDetail } from "@/lib/services/animexinService";
import { useMiniPlayer } from "@/lib/hooks/useMiniPlayer";
import { useSleepTimer } from "@/lib/hooks/useSleepTimer";
import { SleepTimerButton, SleepTimerOverlay } from "@/components/SleepTimerControl";

function AnimeXinWatchContent() {
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get("url") || "";
  const initialTitle = searchParams.get("title") || "";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<AnimeXinDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeServerIndex, setActiveServerIndex] = useState(0);

  useEffect(() => {
    if (!rawUrl) return;
    setLoading(true);
    fetch(`/api/animexin?action=detail&url=${encodeURIComponent(rawUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.detail) {
          setDetail(data.detail);
          setActiveServerIndex(0);
        } else {
          setError(data.error || "Gagal memuat detail Donghua AnimeXin");
        }
      })
      .catch((err) => {
        setError(err.message || "Gagal terhubung ke scraper AnimeXin");
      })
      .finally(() => setLoading(false));
  }, [rawUrl]);

  const activeServer =
    detail?.servers && detail.servers[activeServerIndex]
      ? detail.servers[activeServerIndex]
      : null;

  const streamSrc = activeServer?.embed_url || detail?.current_stream || "";
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const { isPipActive, togglePictureInPicture } = useMiniPlayer({
    containerRef: playerContainerRef,
    title: detail?.title || initialTitle || "AnimeXin Donghua",
    poster: detail?.poster || "",
  });

  const sleepTimer = useSleepTimer();

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-cyan-500 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <Link
            href="/animexin"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg bg-white/5 border border-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Katalog Donghua</span>
          </Link>

          <div className="flex items-center gap-2">
            <SleepTimerButton
              sleepOption={sleepTimer.sleepOption}
              formattedRemaining={sleepTimer.formattedRemaining}
              isMenuOpen={sleepTimer.isMenuOpen}
              onToggleMenu={sleepTimer.toggleMenu}
              onSelectOption={sleepTimer.setTimer}
              accentColor="cyan"
            />
            <button
              type="button"
              onClick={togglePictureInPicture}
              className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isPipActive
                  ? "bg-cyan-500 text-black border-cyan-400 font-bold"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-200"
              }`}
              title="Mini Floating Player (Tetap tampil saat Chrome diminimalkan)"
            >
              <PictureInPicture2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Floating Player</span>
            </button>
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 text-xs flex items-center gap-1">
              <Tv className="w-3.5 h-3.5" />
              AnimeXin Donghua
            </span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="aspect-video w-full rounded-2xl bg-[#13131A] border border-white/5 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-2" />
              <p className="text-sm text-gray-400">Memuat Pemutar Video AnimeXin...</p>
            </div>
            <div className="h-8 bg-white/5 rounded-xl w-1/2" />
            <div className="h-4 bg-white/5 rounded-lg w-3/4" />
          </div>
        ) : error || !detail ? (
          <div className="p-8 rounded-2xl bg-red-950/20 border border-red-500/30 text-center my-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Gagal Memutar Donghua</h3>
            <p className="text-xs text-gray-300 mb-4">{error || "Data tidak ditemukan"}</p>
            <Link
              href="/animexin"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-black transition-colors"
            >
              Lihat Judul Lainnya
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Player & Info */}
            <div className="lg:col-span-2 space-y-4">
              {/* 16:9 Video Player Container */}
              <div
                ref={playerContainerRef}
                className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl shadow-cyan-950/30"
              >
                {streamSrc ? (
                  !sleepTimer.isSleeping ? (
                    <iframe
                      src={streamSrc}
                      allowFullScreen
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                    />
                  ) : null
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-black/90">
                    <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                    <p className="text-sm font-bold text-white mb-1">Server Video Belum Tersedia</p>
                    <p className="text-xs text-gray-400">
                      Silakan pilih server alternatif pada pilihan server di bawah.
                    </p>
                  </div>
                )}

                {/* Sleep Timer Overlay */}
                <SleepTimerOverlay
                  show={sleepTimer.isSleeping}
                  onWakeUp={sleepTimer.wakeUp}
                  accentColor="cyan"
                />
              </div>

              {/* Server Switcher Bar */}
              {detail.servers && detail.servers.length > 0 && (
                <div className="rounded-xl bg-[#121218] border border-white/5 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Pilih Server Mirror / Subtitle:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detail.servers.map((srv, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveServerIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          activeServerIndex === idx
                            ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30"
                            : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                        }`}
                      >
                        {srv.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title & Actions */}
              <div className="rounded-2xl bg-[#121218] border border-white/5 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white">
                      {detail.title || initialTitle}
                    </h1>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                        {detail.type || "Donghua"}
                      </span>
                      <span>•</span>
                      <span className="text-amber-400 flex items-center gap-1 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {detail.rating || "8.9"}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400">{detail.status || "Ongoing"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: detail.title,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Tautan video berhasil disalin!");
                      }
                    }}
                    className="self-start sm:self-center px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 flex items-center gap-1.5 border border-white/5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan</span>
                  </button>
                </div>

                {/* Genres */}
                {detail.genres && detail.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {detail.genres.map((g, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 text-xs border border-white/5"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {/* Synopsis */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Sinopsis
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    {detail.synopsis}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col: Episode List Drawer */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#121218] border border-white/5 p-4 flex flex-col max-h-[750px]">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-cyan-400" />
                    <span>Daftar Episode ({detail.episodes.length})</span>
                  </h3>
                  <span className="text-[11px] text-gray-400">Pilih Episode</span>
                </div>

                {detail.episodes.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 text-center">
                    Episode tidak ditemukan atau hanya memiliki 1 episode tunggal.
                  </p>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                    {detail.episodes.map((ep, idx) => {
                      const isActive = rawUrl === ep.url;
                      return (
                        <Link
                          key={idx}
                          href={`/animexin/watch?url=${encodeURIComponent(ep.url)}&title=${encodeURIComponent(ep.title)}`}
                          className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all ${
                            isActive
                              ? "bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30"
                              : "bg-white/5 hover:bg-white/10 text-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-md font-mono ${
                                isActive ? "bg-black/30 text-white" : "bg-black/40 text-cyan-300"
                              }`}
                            >
                              #{idx + 1}
                            </span>
                            <span className="text-xs truncate">{ep.title}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function AnimeXinWatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070A] text-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      }
    >
      <AnimeXinWatchContent />
    </Suspense>
  );
}
