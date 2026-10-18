"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import Hls from "hls.js";
import {
  Play,
  Star,
  Clapperboard,
  ChevronLeft,
  ChevronRight,
  Server,
  Download,
  Share2,
  Bookmark,
  Tv,
  Film,
  Maximize2,
  X,
  PictureInPicture2,
} from "lucide-react";
import { REAL_DRAKOR_TRENDING } from "@/lib/services/realDataFallback";
import AutoNextCountdown from "@/components/AutoNextCountdown";
import { SleepTimerButton, SleepTimerOverlay } from "@/components/SleepTimerControl";
import BookmarkButton from "@/components/BookmarkButton";
import { saveWatchHistory, getSavedResumeTime } from "@/lib/services/watchHistory";
import { useVideoShortcuts, VideoShortcutToast } from "@/lib/hooks/useVideoShortcuts";
import { useMiniPlayer } from "@/lib/hooks/useMiniPlayer";
import { useSleepTimer } from "@/lib/hooks/useSleepTimer";

export default function DrakorDetailPage({ params }: { params: { slug: string } }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [selectedServer, setSelectedServer] = useState<"lite" | "max" | "fast">("max");
  const [drakorData, setDrakorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Player state
  const [playerUrl, setPlayerUrl] = useState<string>("");
  const [directStreamUrl, setDirectStreamUrl] = useState<string>("");
  const [loadingPlayer, setLoadingPlayer] = useState(true);
  const [playerMode, setPlayerMode] = useState<"embed" | "direct">("embed");
  const [showAutoNext, setShowAutoNext] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch(`/api/drakor?action=detail&slug=${params.slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.detail) setDrakorData(d.detail);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug]);

  // Fetch real video player stream for the episode & server
  useEffect(() => {
    if (!params.slug) return;
    setShowAutoNext(false);
    setLoadingPlayer(true);
    fetch(
      `/api/drakor?action=stream&slug=${encodeURIComponent(
        params.slug
      )}&ep=${currentEpisode}&server=${selectedServer}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPlayerUrl(d.iframe || d.fallback_url || "");
          setDirectStreamUrl(d.stream || "");
        } else {
          setPlayerUrl(`https://drakorid.co/watch-${selectedServer}/${params.slug}/${currentEpisode}`);
          setDirectStreamUrl("");
        }
      })
      .catch((err) => {
        console.error("Error loading drakor stream:", err);
        setPlayerUrl(`https://drakorid.co/watch-${selectedServer}/${params.slug}/${currentEpisode}`);
        setDirectStreamUrl("");
      })
      .finally(() => setLoadingPlayer(false));
  }, [params.slug, currentEpisode, selectedServer]);

  // Attach direct HLS or MP4 stream if in direct mode
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !directStreamUrl || playerMode !== "direct") return;

    let hls: Hls | null = null;
    if (directStreamUrl.includes(".m3u8")) {
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(directStreamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = directStreamUrl;
        video.play().catch(() => {});
      }
    } else {
      video.src = directStreamUrl;
      video.play().catch(() => {});
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [directStreamUrl, playerMode]);

  const currentDrama =
    drakorData ||
    REAL_DRAKOR_TRENDING.find((d) => d.slug === params.slug) ||
    REAL_DRAKOR_TRENDING[0];

  const episodes = currentDrama.episodes || Array.from({ length: 16 }, (_, i) => ({
    episode: i + 1,
    label: `Episode ${i + 1}`,
  }));

  const servers = [
    { id: "max", name: "Server Watch Max (1080p)", tag: "HD" },
    { id: "fast", name: "Server Watch Fast (720p)", tag: "Fast" },
    { id: "lite", name: "Server Watch Lite (360p)", tag: "Lite" },
  ];

  const currentEpData = episodes.find((e: any) => e.episode === currentEpisode);
  const downloadUrl =
    directStreamUrl ||
    currentEpData?.embed?.download_fast ||
    currentEpData?.embed?.download_lite ||
    `https://drakorid.co/download-fast/${params.slug}/${currentEpisode}`;

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const {
    isMini,
    sentinelRef,
    scrollToPlayer,
    dismissMini,
    togglePictureInPicture,
    isPipActive,
  } = useMiniPlayer({
    videoRef,
    containerRef: playerContainerRef,
    title: `${currentDrama.title} - Episode ${currentEpisode}`,
    poster: currentDrama.poster || "",
    onNext: () => setCurrentEpisode((prev) => Math.min(episodes.length, prev + 1)),
    onPrev: () => setCurrentEpisode((prev) => Math.max(1, prev - 1)),
  });

  const { toast: shortcutToast, isIframeFocused, refocus, skipIntro } = useVideoShortcuts({
    videoRef,
    containerRef: playerContainerRef,
    onNext: () => setCurrentEpisode((prev) => Math.min(episodes.length, prev + 1)),
    onPrev: () => setCurrentEpisode((prev) => Math.max(1, prev - 1)),
  });

  const sleepTimer = useSleepTimer({
    videoRef,
    onSleep: () => setShowAutoNext(false),
  });

  useEffect(() => {
    if (!currentDrama?.title) return;
    saveWatchHistory({
      id: `drakor-${params.slug}`,
      title: currentDrama.title,
      category: "drakor",
      episodeNumber: currentEpisode,
      poster: currentDrama.poster || "",
      watchUrl: `/drakor/${params.slug}?ep=${currentEpisode}`,
      currentTime: 0,
      duration: 0,
    });
  }, [currentDrama, currentEpisode, params.slug]);

  return (
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-amber-300">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/drakor" className="hover:text-blue-300">
            Drakor
          </Link>
          <span>/</span>
          <span className="text-blue-400 truncate max-w-xs">{currentDrama.title}</span>
        </div>

        {/* Sentinel for Sticky Mini-Player */}
        <div ref={sentinelRef} className="w-full h-px pointer-events-none -mt-px" />

        {/* Placeholder when in Mini-Player mode */}
        {isMini && (
          <div className="aspect-video w-full rounded-2xl bg-[#0D0D14] border border-dashed border-blue-500/30 flex flex-col items-center justify-center gap-2 text-xs text-blue-300">
            <div className="flex items-center gap-2">
              <Clapperboard className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>Video diputar di Mini-Player (Pojok Layar)</span>
            </div>
            <button
              onClick={scrollToPlayer}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold text-[11px] transition-colors"
            >
              Kembali ke Layar Penuh
            </button>
          </div>
        )}

        {/* Video Player */}
        <div
          ref={playerContainerRef}
          className={`transition-all duration-300 overflow-hidden bg-[#0D0D14] ${
            isMini
              ? "fixed bottom-5 right-5 z-50 w-72 sm:w-96 rounded-2xl border-2 border-blue-500/50 shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95"
              : "rounded-2xl border border-white/10 shadow-2xl"
          }`}
        >
          {/* Top Bar Video Info */}
          <div className="p-3 bg-[#13131D] border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-white truncate max-w-[220px]">
              <Clapperboard className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="truncate">
                {currentDrama.title} — Episode {currentEpisode}
              </span>
            </div>

            {isMini ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={scrollToPlayer}
                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  title="Perbesar Layar"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={togglePictureInPicture}
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-white/20 text-white transition-colors"
                  title="Pop-out Floating Window (Tetap mengambang saat Chrome diminimalkan)"
                >
                  <PictureInPicture2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={dismissMini}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-600 text-white transition-colors"
                  title="Tutup Mini Player"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentEpisode((prev) => Math.max(1, prev - 1))}
                  disabled={currentEpisode <= 1}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev Ep
                </button>
                <button
                  onClick={() => setCurrentEpisode((prev) => Math.min(episodes.length, prev + 1))}
                  disabled={currentEpisode >= episodes.length}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 flex items-center gap-1"
                >
                  Next Ep <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {currentEpisode < episodes.length && (
                  <button
                    type="button"
                    onClick={() => setShowAutoNext(true)}
                    className="px-2 py-1 rounded bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 flex items-center gap-1 text-[11px] font-bold transition-colors"
                    title="Putar episode berikutnya otomatis"
                  >
                    <span>⚡ Auto-Next</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => skipIntro(85)}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 flex items-center gap-1 text-[11px] font-bold transition-colors"
                  title="Lewati Lagu Opening / Intro (+85 detik)"
                >
                  <span>⏩ +85s</span>
                </button>

                <SleepTimerButton
                  sleepOption={sleepTimer.sleepOption}
                  formattedRemaining={sleepTimer.formattedRemaining}
                  isMenuOpen={sleepTimer.isMenuOpen}
                  onToggleMenu={sleepTimer.toggleMenu}
                  onSelectOption={sleepTimer.setTimer}
                  accentColor="blue"
                />

                <BookmarkButton
                  item={{
                    id: `drakor-${params.slug}`,
                    title: currentDrama.title,
                    category: "drakor",
                    poster: currentDrama.poster || "",
                    url: `/drakor/${params.slug}`,
                    totalEpisodes: episodes.length ? `${episodes.length} Ep` : undefined,
                  }}
                  accentColor="blue"
                />
              </div>
            )}
          </div>

          {/* Player Frame (Real DrakorID Player) */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
            {loadingPlayer ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 gap-3 z-20">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-blue-300 font-bold">
                  Memuat Player Drakor.id Episode {currentEpisode}...
                </p>
                <p className="text-[10px] text-gray-500">Menghubungkan stream Bunny CDN real...</p>
              </div>
            ) : playerMode === "direct" && directStreamUrl ? (
              <video
                ref={videoRef}
                controls
                playsInline
                className="w-full h-full object-contain"
                onEnded={() => {
                  const slept = sleepTimer.notifyEpisodeEnded();
                  if (!slept && currentEpisode < episodes.length) {
                    setShowAutoNext(true);
                  }
                }}
              />
            ) : playerUrl ? (
              !sleepTimer.isSleeping ? (
                <iframe
                  src={playerUrl}
                  title={`Nonton ${currentDrama.title} Episode ${currentEpisode}`}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                  referrerPolicy="no-referrer"
                  className="w-full h-full border-0"
                />
              ) : null
            ) : (
              <div className="text-center p-6 text-gray-400 text-xs">
                Gagal memuat player video. Silakan pilih episode atau server lain.
              </div>
            )}

            {/* Auto-Next Episode Overlay */}
            <AutoNextCountdown
              show={showAutoNext}
              nextEpisodeTitle={`Episode ${currentEpisode + 1}`}
              countdownSeconds={5}
              accentColor="blue"
              onPlayNow={() => {
                setShowAutoNext(false);
                setCurrentEpisode((prev) => Math.min(episodes.length, prev + 1));
              }}
              onCancel={() => setShowAutoNext(false)}
            />

            {/* Sleep Timer Overlay */}
            <SleepTimerOverlay
              show={sleepTimer.isSleeping}
              onWakeUp={sleepTimer.wakeUp}
              accentColor="blue"
            />

            {/* Keyboard Shortcuts Toast & Iframe Focus Recovery */}
            <VideoShortcutToast
              toast={shortcutToast}
              isIframeFocused={isIframeFocused}
              onRefocus={refocus}
            />
          </div>

          {/* Server Selector Bar */}
          <div className="p-3 bg-[#13131D] border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 font-semibold">
              <span className="text-gray-400 flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-blue-400" /> Server Drakor:
              </span>
              {servers.map((srv) => (
                <button
                  key={srv.id}
                  onClick={() => setSelectedServer(srv.id as any)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    selectedServer === srv.id
                      ? "bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {srv.name}
                </button>
              ))}

              {/* Mode Toggle (Embed vs Direct) */}
              {directStreamUrl && (
                <button
                  onClick={() =>
                    setPlayerMode((prev) => (prev === "embed" ? "direct" : "embed"))
                  }
                  className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all flex items-center gap-1 ${
                    playerMode === "direct"
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-white/5 text-gray-300 border-white/10 hover:text-white"
                  }`}
                >
                  {playerMode === "direct" ? (
                    <>
                      <Tv className="w-3 h-3" /> Direct HLS Player
                    </>
                  ) : (
                    <>
                      <Film className="w-3 h-3" /> Switch to Direct Player
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePictureInPicture}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                  isPipActive
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                }`}
                title="Mini Player / Picture-in-Picture (Tetap Berjalan saat Minimize)"
              >
                <PictureInPicture2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Mini Player / PiP</span>
              </button>

              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" /> Unduh Episode {currentEpisode}
              </a>
            </div>
          </div>
        </div>

        {/* Drama Info & Episode List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 rounded-2xl bg-[#121218] border border-white/10 p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
              <div className="w-28 sm:w-36 aspect-[2/3] rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10 shadow-lg">
                <img src={currentDrama.poster} alt={currentDrama.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    K-Drama Ongoing
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    9.6
                  </span>
                </div>

                <h1 className="text-lg sm:text-2xl font-black text-white break-words leading-tight">{currentDrama.title}</h1>

                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  {(currentDrama.genres || ["Romance", "Drama", "Crime", "Mystery"]).map(
                    (g: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/5"
                      >
                        {g}
                      </span>
                    )
                  )}
                </div>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mt-3 break-words line-clamp-3 sm:line-clamp-none">
                  {currentDrama.synopsis ||
                    "Serial drama Korea pilihan dengan alur cerita menarik, kualitas visual sinematik, serta subtitle Indonesia terlengkap."}
                </p>
              </div>
            </div>
          </div>

          {/* Episode List */}
          <div className="lg:col-span-4 rounded-2xl bg-[#121218] border border-white/10 p-4 sm:p-5 flex flex-col max-h-[500px]">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-white/10 mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-400" />
              <span>Daftar Episode ({episodes.length})</span>
            </h3>

            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {episodes.map((ep: any) => {
                const epNum = ep.episode;
                const isActive = currentEpisode === epNum;
                return (
                  <button
                    key={epNum}
                    onClick={() => setCurrentEpisode(epNum)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      isActive
                        ? "bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20"
                        : "bg-white/5 hover:bg-white/10 text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Play className={`w-3.5 h-3.5 ${isActive ? "fill-white" : "text-blue-400"}`} />
                      <span>Episode {epNum}</span>
                    </div>
                    <span className={isActive ? "text-white" : "text-gray-500"}>Sub Indo</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
