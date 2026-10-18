"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  ListOrdered,
  Eye,
  Heart,
  Share2,
  AlertCircle,
  X,
  Sparkles,
  Layers,
  Video,
  Maximize2,
  Minimize2,
  PictureInPicture2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import { ReelShortDetail, ReelShortStream } from "@/lib/services/reelshortService";
import { useMiniPlayer } from "@/lib/hooks/useMiniPlayer";
import Hls from "hls.js";

function ReelShortWatchContent() {
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id") || "";
  const initialTitle = searchParams.get("title") || "";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ReelShortDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Player controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5 | 2>(1);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedStreamQuality, setSelectedStreamQuality] = useState<string>("720p");

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerContainerRef.current?.requestFullscreen) {
        playerContainerRef.current.requestFullscreen().catch(() => {});
      } else if ((playerContainerRef.current as any)?.webkitRequestFullscreen) {
        (playerContainerRef.current as any).webkitRequestFullscreen();
      }
      setIsNativeFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any)?.webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      setIsNativeFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => {
      setIsNativeFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  useEffect(() => {
    if (!rawId) return;
    setLoading(true);
    fetch(`/api/reelshort?action=detail&id=${encodeURIComponent(rawId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.detail) {
          setDetail(data.detail);
          if (data.detail.sample_streams && data.detail.sample_streams.length > 0) {
            setSelectedStreamQuality(data.detail.sample_streams[0].quality);
          }
        } else {
          setError(data.error || "Gagal memuat detail drama ReelShort");
        }
      })
      .catch((err) => {
        setError(err.message || "Gagal terhubung ke scraper ReelShort");
      })
      .finally(() => setLoading(false));
  }, [rawId]);

  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState("0:00");
  const [durationStr, setDurationStr] = useState("0:00");

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      if (dur > 0) {
        setProgress((cur / dur) * 100);
        setCurrentTimeStr(formatTime(cur));
        setDurationStr(formatTime(dur));
      }
    }
  };

  const activeStream =
    detail?.sample_streams?.find((s) => s.quality === selectedStreamQuality) ||
    detail?.sample_streams?.[0];

  // Video element playback speed and mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.muted = isMuted;
    }
  }, [playbackSpeed, isMuted]);

  // HLS stream attach
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeStream?.stream_url) return;

    let hls: Hls | null = null;
    const streamUrl = activeStream.stream_url;

    if (streamUrl.includes(".m3u8")) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isPlaying) video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls?.recoverMediaError();
                break;
              default:
                hls?.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        if (isPlaying) video.play().catch(() => {});
      }
    } else {
      video.src = streamUrl;
      if (isPlaying) video.play().catch(() => {});
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [activeStream?.stream_url]);

  const episodes = detail?.episodes || [];
  const currentEp = episodes[currentEpisodeIndex] || {
    episode: currentEpisodeIndex + 1,
    likes: 12000,
  };

  const handleNextEpisode = () => {
    const maxEp = episodes.length > 0 ? episodes.length : (detail?.total_episodes || 70);
    if (currentEpisodeIndex < maxEp - 1) {
      setCurrentEpisodeIndex((prev) => prev + 1);
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisodeIndex > 0) {
      setCurrentEpisodeIndex((prev) => prev - 1);
    }
  };

  const { isPipActive, togglePictureInPicture } = useMiniPlayer({
    videoRef,
    containerRef: playerContainerRef,
    title: detail?.title ? `${detail.title} - Ep ${currentEpisodeIndex + 1}` : "ReelShort Drama",
    poster: detail?.cover || "",
    onNext: handleNextEpisode,
    onPrev: handlePrevEpisode,
  });

  // Mobile Vertical Swipe & PC Scroll / Drag to change episodes
  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const isSwipingRef = useRef(false);
  const [swipeToast, setSwipeToast] = useState<{
    type: "next" | "prev";
    text: string;
  } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    touchStartXRef.current = e.touches[0].clientX;
    isSwipingRef.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null || touchStartXRef.current === null) return;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const maxEp = episodes.length > 0 ? episodes.length : (detail?.total_episodes || 70);

    // Predominantly vertical swipe and distance > 45px
    if (Math.abs(diffY) > 45 && Math.abs(diffY) > Math.abs(diffX) * 1.2) {
      isSwipingRef.current = true;
      if (diffY > 0) {
        // Swiped UP -> Next Episode
        if (currentEpisodeIndex < maxEp - 1) {
          setSwipeToast({
            type: "next",
            text: `Episode ${currentEpisodeIndex + 2}`,
          });
          handleNextEpisode();
        }
      } else {
        // Swiped DOWN -> Previous Episode
        if (currentEpisodeIndex > 0) {
          setSwipeToast({
            type: "prev",
            text: `Episode ${currentEpisodeIndex}`,
          });
          handlePrevEpisode();
        }
      }
      setTimeout(() => setSwipeToast(null), 850);
    } else if (Math.abs(diffX) > 55 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      isSwipingRef.current = true;
      if (diffX > 0) {
        // Swiped LEFT -> Next Episode
        if (currentEpisodeIndex < maxEp - 1) {
          setSwipeToast({
            type: "next",
            text: `Episode ${currentEpisodeIndex + 2}`,
          });
          handleNextEpisode();
        }
      } else {
        // Swiped RIGHT -> Previous Episode
        if (currentEpisodeIndex > 0) {
          setSwipeToast({
            type: "prev",
            text: `Episode ${currentEpisodeIndex}`,
          });
          handlePrevEpisode();
        }
      }
      setTimeout(() => setSwipeToast(null), 850);
    }
    touchStartYRef.current = null;
    touchStartXRef.current = null;
  };

  // Mouse wheel and drag navigation on PC
  const lastWheelTimeRef = useRef<number>(0);
  const mouseStartYRef = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a, input, select")) return;
    mouseStartYRef.current = e.clientY;
    isSwipingRef.current = false;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartYRef.current === null) return;
    const diffY = mouseStartYRef.current - e.clientY;
    const maxEp = episodes.length > 0 ? episodes.length : (detail?.total_episodes || 70);

    if (Math.abs(diffY) > 50) {
      isSwipingRef.current = true;
      if (diffY > 0 && currentEpisodeIndex < maxEp - 1) {
        setSwipeToast({
          type: "next",
          text: `Episode ${currentEpisodeIndex + 2}`,
        });
        handleNextEpisode();
      } else if (diffY < 0 && currentEpisodeIndex > 0) {
        setSwipeToast({
          type: "prev",
          text: `Episode ${currentEpisodeIndex}`,
        });
        handlePrevEpisode();
      }
      setTimeout(() => setSwipeToast(null), 850);
    }
    mouseStartYRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 650) return;
    const maxEp = episodes.length > 0 ? episodes.length : (detail?.total_episodes || 70);

    if (Math.abs(e.deltaY) > 35) {
      lastWheelTimeRef.current = now;
      if (e.deltaY > 0 && currentEpisodeIndex < maxEp - 1) {
        setSwipeToast({
          type: "next",
          text: `Episode ${currentEpisodeIndex + 2}`,
        });
        handleNextEpisode();
      } else if (e.deltaY < 0 && currentEpisodeIndex > 0) {
        setSwipeToast({
          type: "prev",
          text: `Episode ${currentEpisodeIndex}`,
        });
        handlePrevEpisode();
      }
      setTimeout(() => setSwipeToast(null), 850);
    }
  };

  const handleVideoClick = () => {
    if (isSwipingRef.current) {
      isSwipingRef.current = false;
      return;
    }
    togglePlayPause();
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-40 bg-[#0C0C12]/95 backdrop-blur-md border-b border-white/10 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/reelshort"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali ke ReelShort</span>
            </Link>

            <div className="border-l border-white/10 pl-3">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
                REELSHORT VIDEO PENDEK
              </span>
              <h1 className="text-xs sm:text-sm font-black text-white truncate max-w-xs sm:max-w-md">
                {detail?.title || initialTitle || "Memuat Drama..."}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Presets */}
            <div className="flex items-center bg-[#151520] p-1 rounded-lg border border-white/5 text-xs">
              {([1, 1.25, 1.5, 2] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                    playbackSpeed === spd
                      ? "bg-rose-500 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Quality switcher */}
            {detail?.sample_streams && (
              <select
                value={selectedStreamQuality}
                onChange={(e) => setSelectedStreamQuality(e.target.value)}
                className="bg-[#151520] text-xs text-rose-300 border border-white/10 rounded-lg px-2 py-1 focus:outline-none"
              >
                {detail.sample_streams.map((s) => (
                  <option key={s.quality} value={s.quality}>
                    {s.quality}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </header>

      {/* Main 9:16 Reel Player Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 w-full max-w-5xl mx-auto">
        {/* Loading State: Skeleton Loader */}
        {loading && (
          <div className="w-full max-w-[380px] aspect-[9/16] rounded-3xl bg-white/5 border border-white/10 animate-pulse flex flex-col justify-between p-6">
            <div className="flex justify-between">
              <div className="h-6 w-24 bg-white/10 rounded-full" />
              <div className="h-6 w-16 bg-white/10 rounded-full" />
            </div>
            <div className="w-16 h-16 rounded-full bg-white/10 mx-auto" />
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-white/15 rounded" />
              <div className="h-3 w-1/2 bg-white/10 rounded" />
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl bg-rose-950/30 border border-rose-500/30 p-8 text-center space-y-4 max-w-md">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Gagal Memutar Drama</h2>
            <p className="text-sm text-gray-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-full bg-rose-500 text-white font-bold text-xs"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Real 9:16 ReelShort Player */}
        {!loading && detail && (
          <div
            ref={playerContainerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            className="max-sm:fixed max-sm:inset-0 max-sm:z-50 max-sm:w-full max-sm:h-[100dvh] max-sm:max-w-none max-sm:rounded-none max-sm:border-0 sm:relative sm:w-full sm:max-w-[390px] sm:aspect-[9/16] sm:rounded-3xl sm:border sm:border-white/15 overflow-hidden bg-black shadow-2xl shadow-rose-950/50 group select-none flex flex-col justify-between transition-all cursor-grab active:cursor-grabbing"
          >
            {/* Animated Swipe Toast Notification Feedback */}
            {swipeToast && (
              <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none animate-in fade-in zoom-in-90 duration-200">
                <div className="px-5 py-3 rounded-2xl bg-black/85 backdrop-blur-md border border-rose-500/50 text-white flex items-center gap-2.5 shadow-2xl shadow-rose-950/50">
                  {swipeToast.type === "next" ? (
                    <ChevronUp className="w-5 h-5 text-rose-400 animate-bounce" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-rose-400 animate-bounce" />
                  )}
                  <span className="font-extrabold text-sm tracking-wide">
                    {swipeToast.text}
                  </span>
                </div>
              </div>
            )}

            {/* Mobile swipe hint */}
            <div className="sm:hidden absolute bottom-20 left-4 right-4 z-20 pointer-events-none text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold text-rose-200 bg-black/60 backdrop-blur-md border border-white/10 opacity-70">
                <span>Geser ke atas untuk episode berikutnya</span>
                <ChevronUp className="w-3 h-3 text-rose-400" />
              </span>
            </div>

            {/* Video Element with Decrypted CDN Stream URL */}
            {activeStream?.stream_url ? (
              <>
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  loop
                  autoPlay
                  playsInline
                  onClick={handleVideoClick}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                {!isPlaying && (
                  <div
                    onClick={togglePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-2xl scale-110 transition-transform">
                      <Play className="w-7 h-7 fill-white ml-1" />
                    </div>
                  </div>
                )}
              </>
            ) : detail.cover ? (
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={detail.cover}
                  alt={detail.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <Play className="w-14 h-14 text-rose-400" />
                  <p className="text-xs text-gray-300">
                    Memuat stream dekripsi ReelShort...
                  </p>
                </div>
              </div>
            ) : null}

            {/* Top Overlay Gradient & Badges with Mobile Controls */}
            <div className="relative z-20 p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <Link
                  href="/reelshort"
                  className="sm:hidden px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all flex items-center gap-1 text-xs font-bold"
                  title="Kembali"
                >
                  <ChevronLeft className="w-4 h-4 text-rose-400" />
                  <span>Katalog</span>
                </Link>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/80 text-white uppercase tracking-wider backdrop-blur-md">
                  REELSHORT • EP {currentEpisodeIndex + 1}/{detail.total_episodes}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePictureInPicture}
                  className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                    isPipActive
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/40"
                      : "bg-black/50 hover:bg-black/80 text-white"
                  }`}
                  title="Picture-in-Picture (Tetap Mengambang saat Chrome Diminimalkan)"
                >
                  <PictureInPicture2 className="w-4 h-4 text-rose-300" />
                </button>

                <button
                  onClick={toggleNativeFullscreen}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                  title="Fullscreen"
                >
                  {isNativeFullscreen ? <Minimize2 className="w-4 h-4 text-rose-400" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setShowInfoModal(true)}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                  title="Detail Drama"
                >
                  <Sparkles className="w-4 h-4 text-rose-400" />
                </button>
              </div>
            </div>

            {/* Right Action Icons (TikTok / Reels Style) */}
            <div className="relative z-10 flex flex-col items-end p-4 space-y-4 self-end pointer-events-auto">
              {/* Episode Drawer Trigger */}
              <button
                onClick={() => setShowEpisodeDrawer(true)}
                className="flex flex-col items-center gap-1 group/btn"
              >
                <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white group-hover/btn:bg-rose-500 transition-colors">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-gray-200">Episode</span>
              </button>

              {/* Prev Episode */}
              <button
                onClick={handlePrevEpisode}
                disabled={currentEpisodeIndex === 0}
                className="flex flex-col items-center gap-1 group/btn disabled:opacity-30"
              >
                <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white group-hover/btn:bg-white/20 transition-colors">
                  <ChevronUp className="w-5 h-5" />
                </div>
                <span className="text-[9px] text-gray-300">Prev</span>
              </button>

              {/* Next Episode */}
              <button
                onClick={handleNextEpisode}
                disabled={currentEpisodeIndex >= (episodes.length > 0 ? episodes.length - 1 : 70)}
                className="flex flex-col items-center gap-1 group/btn disabled:opacity-30"
              >
                <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white group-hover/btn:bg-white/20 transition-colors">
                  <ChevronDown className="w-5 h-5" />
                </div>
                <span className="text-[9px] text-gray-300">Next</span>
              </button>

              {/* Likes */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-rose-400">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <span className="text-[10px] font-bold text-gray-200">
                  {currentEp.likes ? (currentEp.likes > 1000 ? `${(currentEp.likes / 1000).toFixed(0)}k` : currentEp.likes) : "12k"}
                </span>
              </div>
            </div>

            {/* Bottom Overlay Gradient & Drama Title */}
            <div className="relative z-10 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent space-y-1.5 pointer-events-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase border border-rose-500/30">
                  {detail.tags?.[0] || "Vertikal Short"}
                </span>
                {detail.read_count && (
                  <span className="text-[10px] text-gray-300 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-rose-400" />
                    {(detail.read_count / 1000000).toFixed(1)}M Views
                  </span>
                )}
              </div>

              <h2 className="text-sm font-black text-white line-clamp-1">
                {detail.title}
              </h2>

              <p className="text-[11px] text-gray-300 line-clamp-2 leading-tight">
                {detail.description}
              </p>

              {/* Seek / Progress Bar */}
              <div className="w-full pt-1 flex items-center gap-2">
                <div
                  className="relative flex-1 h-1 bg-white/20 rounded-full cursor-pointer overflow-hidden"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    if (videoRef.current && videoRef.current.duration) {
                      videoRef.current.currentTime = pos * videoRef.current.duration;
                    }
                  }}
                >
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-gray-400 shrink-0">
                  {currentTimeStr} / {durationStr}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Episode Selector Drawer Modal */}
        {showEpisodeDrawer && detail && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full max-w-lg bg-[#14141E] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[75vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-rose-400" />
                  <h3 className="text-sm font-bold text-white">
                    Daftar Episode ReelShort ({detail.total_episodes} Total)
                  </h3>
                </div>
                <button
                  onClick={() => setShowEpisodeDrawer(false)}
                  className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid of episodes */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-y-auto pr-1 flex-1">
                {(episodes.length > 0 ? episodes : Array.from({ length: detail.total_episodes || 70 }, (_, i) => ({ episode: i + 1, likes: 0, thumbnail: "", chapter_id: "" }))).map((ep, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentEpisodeIndex(idx);
                      setShowEpisodeDrawer(false);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left flex flex-col justify-between ${
                      currentEpisodeIndex === idx
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                        : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5"
                    }`}
                  >
                    <span className="text-[11px]">Episode {ep.episode}</span>
                    <span className="text-[9px] opacity-75 font-normal mt-1 flex items-center gap-0.5">
                      <Play className="w-2.5 h-2.5 fill-current" /> Putar
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ReelShortWatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070A] text-white flex items-center justify-center">
          <div className="text-center space-y-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 mx-auto" />
            <p className="text-xs text-rose-400 font-mono">Memuat ReelShort Drama...</p>
          </div>
        </div>
      }
    >
      <ReelShortWatchContent />
    </Suspense>
  );
}
