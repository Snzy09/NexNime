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
  Download,
  Play,
  Film,
  Calendar,
  Info,
  Maximize2,
  X,
  PictureInPicture2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import AutoNextCountdown from "@/components/AutoNextCountdown";
import { SleepTimerButton, SleepTimerOverlay } from "@/components/SleepTimerControl";
import { DonghuaFilmDetail, DonghuaFilmEpisode } from "@/lib/services/donghuaFilmService";
import { saveWatchHistory } from "@/lib/services/watchHistory";
import { useVideoShortcuts, VideoShortcutToast } from "@/lib/hooks/useVideoShortcuts";
import { useMiniPlayer } from "@/lib/hooks/useMiniPlayer";
import { useSleepTimer } from "@/lib/hooks/useSleepTimer";

function DonghuaFilmWatchContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "";
  const initialEp = parseInt(searchParams.get("ep") || "1", 10);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<DonghuaFilmDetail | null>(null);
  const [currentEpNum, setCurrentEpNum] = useState<number>(initialEp);
  const [currentEpisode, setCurrentEpisode] = useState<DonghuaFilmEpisode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDownloads, setShowDownloads] = useState(false);
  const [playerMode, setPlayerMode] = useState<"embed" | "native">("embed");
  const [showAutoNext, setShowAutoNext] = useState(false);

  // Fetch Donghua Detail
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/donghuafilm?action=detail&slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status && data.episodes) {
          setDetail(data);
          // Find selected episode or the first available
          const epList = data.episodes as DonghuaFilmEpisode[];
          const target = epList.find((e) => e.number === currentEpNum) || epList[epList.length - 1] || epList[0];
          if (target) {
            setCurrentEpNum(target.number);
            setCurrentEpisode(target);
            if (target.stream_url && !target.embed_src) {
              setPlayerMode("native");
            } else {
              setPlayerMode("embed");
            }
          }
        } else {
          setError(data.error || "Gagal memuat detail Donghua");
        }
      })
      .catch((err) => {
        setError(err.message || "Gagal terhubung ke server DonghuaFilm");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // When episode changes, update current episode
  const handleSelectEpisode = (epNum: number) => {
    setShowAutoNext(false);
    setCurrentEpNum(epNum);
    if (detail?.episodes) {
      const found = detail.episodes.find((e) => e.number === epNum);
      if (found) {
        setCurrentEpisode(found);
        if (found.stream_url && !found.embed_src) {
          setPlayerMode("native");
        }
      }
    }
  };

  const sortedEpisodes = detail?.episodes
    ? [...detail.episodes].sort((a, b) => a.number - b.number)
    : [];

  const currentIndex = sortedEpisodes.findIndex((e) => e.number === currentEpNum);
  const prevEp = currentIndex > 0 ? sortedEpisodes[currentIndex - 1] : null;
  const nextEp = currentIndex >= 0 && currentIndex < sortedEpisodes.length - 1 ? sortedEpisodes[currentIndex + 1] : null;

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const {
    isMini,
    sentinelRef,
    scrollToPlayer,
    dismissMini,
    togglePictureInPicture,
    isPipActive,
  } = useMiniPlayer({
    containerRef: playerContainerRef,
    title: detail?.title ? `${detail.title} - Episode ${currentEpNum}` : "Donghua Film",
    poster: detail?.poster || "",
  });

  const { toast: shortcutToast, isIframeFocused, refocus } = useVideoShortcuts({
    containerRef: playerContainerRef,
    onNext: () => {
      if (nextEp) handleSelectEpisode(nextEp.number);
    },
    onPrev: () => {
      if (prevEp) handleSelectEpisode(prevEp.number);
    },
  });

  const sleepTimer = useSleepTimer({
    onSleep: () => setShowAutoNext(false),
  });

  useEffect(() => {
    if (!detail?.title) return;
    saveWatchHistory({
      id: `donghuafilm-${slug}`,
      title: detail.title,
      category: "donghua",
      episodeNumber: currentEpNum,
      poster: detail.poster || "",
      watchUrl: `/donghuafilm/watch?slug=${encodeURIComponent(slug)}&ep=${currentEpNum}`,
      currentTime: 0,
      duration: 0,
    });
  }, [detail, slug, currentEpNum]);

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-amber-400 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <Link
            href="/anime?source=donghuafilm"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg bg-white/5 border border-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Anime Hub</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 text-xs flex items-center gap-1">
              <Tv className="w-3.5 h-3.5" />
              DonghuaFilm HD
            </span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="aspect-video w-full rounded-2xl bg-[#13131A] border border-white/5 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-2" />
              <p className="text-sm text-gray-400">Memuat Pemutar Video DonghuaFilm...</p>
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
              href="/anime"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold"
            >
              Kembali ke Katalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sentinel for Sticky Mini-Player */}
            <div ref={sentinelRef} className="w-full h-px pointer-events-none -mt-px" />

            {/* Placeholder when in Mini-Player mode */}
            {isMini && (
              <div className="aspect-video w-full rounded-2xl bg-[#0D0D14] border border-dashed border-amber-500/30 flex flex-col items-center justify-center gap-2 text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Donghua diputar di Mini-Player (Pojok Layar)</span>
                </div>
                <button
                  onClick={scrollToPlayer}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-[11px] transition-colors"
                >
                  Kembali ke Layar Penuh
                </button>
              </div>
            )}

            {/* Video Player Frame */}
            <div
              ref={playerContainerRef}
              className={`overflow-hidden bg-black transition-all duration-300 ${
                isMini
                  ? "fixed bottom-5 right-5 z-50 w-72 sm:w-96 aspect-video rounded-2xl border-2 border-amber-500/50 shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95"
                  : "relative aspect-video w-full rounded-2xl border border-white/10 shadow-2xl shadow-amber-950/30"
              }`}
            >
              {/* Mini Player Header Controls */}
              {isMini && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5 z-30">
                  <button
                    type="button"
                    onClick={scrollToPlayer}
                    className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black shadow-lg transition-colors"
                    title="Perbesar Layar"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={togglePictureInPicture}
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-white/20 text-white shadow-lg transition-colors"
                    title="Pop-out Floating Window (Tetap mengambang saat Chrome diminimalkan)"
                  >
                    <PictureInPicture2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={dismissMini}
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-white/20 text-white shadow-lg transition-colors"
                    title="Tutup Mini Player"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {playerMode === "native" && currentEpisode?.stream_url ? (
                <video
                  src={currentEpisode.stream_url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                  onEnded={() => {
                    if (nextEp) {
                      setShowAutoNext(true);
                    }
                  }}
                />
              ) : currentEpisode?.embed_src ? (
                <iframe
                  src={currentEpisode.embed_src}
                  title={`${detail.title} - Episode ${currentEpNum}`}
                  className="w-full h-full border-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                />
              ) : currentEpisode?.stream_url ? (
                <video
                  src={currentEpisode.stream_url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                  onEnded={() => {
                    if (nextEp) {
                      setShowAutoNext(true);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#101018] text-center p-6 space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400" />
                  <p className="text-sm font-bold text-white">Stream belum tersedia untuk episode ini</p>
                  <p className="text-xs text-gray-400 max-w-md">
                    Silakan pilih episode lain atau gunakan link download jika tersedia.
                  </p>
                </div>
              )}

              {/* Auto-Next Episode Overlay */}
              <AutoNextCountdown
                show={showAutoNext}
                nextEpisodeTitle={nextEp ? `Episode ${nextEp.number}` : undefined}
                countdownSeconds={5}
                accentColor="amber"
                onPlayNow={() => {
                  setShowAutoNext(false);
                  if (nextEp) handleSelectEpisode(nextEp.number);
                }}
                onCancel={() => setShowAutoNext(false)}
              />

              {/* Sleep Timer Overlay */}
              <SleepTimerOverlay
                show={sleepTimer.isSleeping}
                onWakeUp={sleepTimer.wakeUp}
                accentColor="amber"
              />

              {/* Keyboard Shortcuts Feedback Toast & Iframe Focus Recovery */}
              <VideoShortcutToast
                toast={shortcutToast}
                isIframeFocused={isIframeFocused}
                onRefocus={refocus}
              />
            </div>

            {/* Video Player Toolbar & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#12121A] border border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                  Episode {currentEpNum}
                </span>

                {/* Server / Player Mode Switcher */}
                {currentEpisode?.stream_url && currentEpisode?.embed_src && (
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 text-xs">
                    <button
                      onClick={() => setPlayerMode("embed")}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        playerMode === "embed"
                          ? "bg-amber-400 text-black font-bold"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Embed Server
                    </button>
                    <button
                      onClick={() => setPlayerMode("native")}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        playerMode === "native"
                          ? "bg-amber-400 text-black font-bold"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Direct Stream
                    </button>
                  </div>
                )}
              </div>

              {/* Prev / Next Buttons & Download Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => prevEp && handleSelectEpisode(prevEp.number)}
                  disabled={!prevEp}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <button
                  onClick={() => nextEp && handleSelectEpisode(nextEp.number)}
                  disabled={!nextEp}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {nextEp && (
                  <button
                    type="button"
                    onClick={() => setShowAutoNext(true)}
                    className="px-2 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 flex items-center gap-1 text-xs font-bold transition-colors"
                    title="Putar episode berikutnya otomatis"
                  >
                    <span>⚡ Auto-Next</span>
                  </button>
                )}

                <SleepTimerButton
                  sleepOption={sleepTimer.sleepOption}
                  formattedRemaining={sleepTimer.formattedRemaining}
                  isMenuOpen={sleepTimer.isMenuOpen}
                  onToggleMenu={sleepTimer.toggleMenu}
                  onSelectOption={sleepTimer.setTimer}
                  accentColor="amber"
                />

                <button
                  type="button"
                  onClick={togglePictureInPicture}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isPipActive
                      ? "bg-amber-400/25 border-amber-400/40 text-amber-300"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
                  }`}
                  title={isPipActive ? "Tutup Mini Player" : "Aktifkan Mini / Floating Player (bisa diminimize)"}
                >
                  <PictureInPicture2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mini Player</span>
                </button>

                <button
                  onClick={() => setShowDownloads(!showDownloads)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    showDownloads
                      ? "bg-emerald-500 text-black font-bold"
                      : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Download Accordion Section */}
            {showDownloads && (
              <div className="p-4 rounded-xl bg-[#101915] border border-emerald-500/30 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>Link Download &amp; Stream Episode {currentEpNum}</span>
                  </h3>
                  <span className="text-[11px] text-gray-400">Pilih kualitas / direct link</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                  {currentEpisode?.download_url ? (
                    <a
                      href={currentEpisode.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/50 text-xs text-white font-semibold flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Direct Download</span>
                      </span>
                      <span className="text-[10px] text-emerald-300 font-bold">Unduh</span>
                    </a>
                  ) : null}

                  {currentEpisode?.stream_url ? (
                    <a
                      href={currentEpisode.stream_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white font-semibold flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-amber-400" />
                        <span>Direct MP4 Stream</span>
                      </span>
                      <span className="text-[10px] text-gray-400">Buka</span>
                    </a>
                  ) : null}

                  {currentEpisode?.embed_src ? (
                    <a
                      href={currentEpisode.embed_src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white font-semibold flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-cyan-400" />
                        <span>Embed Player URL</span>
                      </span>
                      <span className="text-[10px] text-gray-400">External</span>
                    </a>
                  ) : null}

                  {!currentEpisode?.download_url && !currentEpisode?.stream_url && !currentEpisode?.embed_src && (
                    <p className="text-xs text-gray-400 col-span-3">
                      Link download langsung belum diunggah untuk episode ini.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Donghua Information & Synopsis */}
            <div className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-[#12121A] border border-white/10">
              {detail.poster || detail.cover ? (
                <div className="w-32 sm:w-44 shrink-0 rounded-xl overflow-hidden aspect-[3/4] bg-black/60 shadow-lg border border-white/10">
                  <img
                    src={detail.poster || detail.cover}
                    alt={detail.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}

              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl font-black text-white">{detail.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
                    <span className="text-amber-400 font-bold uppercase">{detail.type || "Donghua"}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{detail.status_anime || "Ongoing"}</span>
                    {detail.rating ? (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-300 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" /> {detail.rating}
                        </span>
                      </>
                    ) : null}
                    {detail.release_day ? (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Calendar className="w-3 h-3" /> Rilis: {detail.release_day}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                {detail.synopsis && (
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl">
                    {detail.synopsis}
                  </p>
                )}
              </div>
            </div>

            {/* Episode Selector Grid */}
            <div className="space-y-3 p-6 rounded-2xl bg-[#12121A] border border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-amber-400" />
                  <span>Daftar Episode ({sortedEpisodes.length} Episode)</span>
                </h3>
                <span className="text-xs text-gray-400">Klik episode untuk memutar</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-72 overflow-y-auto pr-1">
                {sortedEpisodes.map((ep) => {
                  const isActive = ep.number === currentEpNum;
                  return (
                    <button
                      key={ep.id || ep.number}
                      onClick={() => handleSelectEpisode(ep.number)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                        isActive
                          ? "bg-amber-400 text-black shadow-lg shadow-amber-400/30 scale-105"
                          : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>Ep {ep.number}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function DonghuaFilmWatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070A] text-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      }
    >
      <DonghuaFilmWatchContent />
    </Suspense>
  );
}
