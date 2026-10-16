"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  ListOrdered,
  Sparkles,
  Info,
  X,
  Video,
  AlertCircle,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Heart,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import { DracinItem, DracinDetail } from "@/lib/services/dracinService";
import { REAL_DRACIN_SHORTS } from "@/lib/services/realDataFallback";

function DracinWatchContent() {
  const searchParams = useSearchParams();
  const rawSlug = searchParams.get("slug") || "";
  const initialTitle = searchParams.get("title") || "";
  const initialEp = parseInt(searchParams.get("ep") || "1", 10);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [detail, setDetail] = useState<DracinDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [currentEpisodeNum, setCurrentEpisodeNum] = useState<number>(initialEp > 0 ? initialEp : 1);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [loadingVideo, setLoadingVideo] = useState(true);

  // Player controls state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5 | 2>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Fallback drama metadata if API takes time or is offline
  const fallbackDrama: DracinItem =
    REAL_DRACIN_SHORTS.find((d) => d.slug === rawSlug) || {
      slug: rawSlug,
      title: initialTitle || "Short Drama AsiaBox",
      url: `https://asiaboxdrama.com/id/movie/${rawSlug}`,
      episodes: 80,
      description: "Serial drama pendek vertikal 9:16 dengan teks bahasa Indonesia.",
    };

  const activeDrama = detail?.film || fallbackDrama;
  const totalEpisodes = detail?.total_episode || activeDrama.episodes || 80;

  // 1. Fetch Drama Details
  useEffect(() => {
    if (!rawSlug) return;
    setLoadingDetail(true);
    fetch(`/api/dracin?action=detail&slug=${encodeURIComponent(rawSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.detail) {
          setDetail(data.detail);
        }
      })
      .catch((err) => console.error("Error loading dracin detail:", err))
      .finally(() => setLoadingDetail(false));
  }, [rawSlug]);

  // 2. Fetch Episode Video Stream
  useEffect(() => {
    if (!rawSlug) return;
    setLoadingVideo(true);
    setVideoUrl("");

    fetch(
      `/api/dracin?action=episode&slug=${encodeURIComponent(
        rawSlug
      )}&ep=${currentEpisodeNum}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.episode?.video) {
          setVideoUrl(d.episode.video);
        } else {
          setVideoUrl("");
        }
      })
      .catch((err) => {
        console.error("Failed to load episode video:", err);
        setVideoUrl("");
      })
      .finally(() => setLoadingVideo(false));
  }, [rawSlug, currentEpisodeNum]);

  // 3. Attach HLS or direct stream to video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    let hls: Hls | null = null;
    if (videoUrl.includes(".m3u8")) {
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
          setIsPlaying(true);
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        video.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      video.src = videoUrl;
      video.play().catch(() => {});
      setIsPlaying(true);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoUrl]);

  // Speed and Mute effects
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.muted = isMuted;
    }
  }, [playbackSpeed, isMuted, videoUrl]);

  // Fullscreen event listener
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

  const handleNextEpisode = () => {
    if (currentEpisodeNum < totalEpisodes) {
      setCurrentEpisodeNum((prev) => prev + 1);
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisodeNum > 1) {
      setCurrentEpisodeNum((prev) => prev - 1);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTo;
      setCurrentTime(seekTo);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Vertical Touch / Mouse Drag / Wheel swipe navigation
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

    if (Math.abs(diffY) > 45 && Math.abs(diffY) > Math.abs(diffX) * 1.2) {
      isSwipingRef.current = true;
      if (diffY > 0) {
        if (currentEpisodeNum < totalEpisodes) {
          setSwipeToast({ type: "next", text: `Episode ${currentEpisodeNum + 1}` });
          handleNextEpisode();
        }
      } else {
        if (currentEpisodeNum > 1) {
          setSwipeToast({ type: "prev", text: `Episode ${currentEpisodeNum - 1}` });
          handlePrevEpisode();
        }
      }
      setTimeout(() => setSwipeToast(null), 850);
    }
    touchStartYRef.current = null;
    touchStartXRef.current = null;
  };

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
    if (Math.abs(diffY) > 50) {
      isSwipingRef.current = true;
      if (diffY > 0 && currentEpisodeNum < totalEpisodes) {
        setSwipeToast({ type: "next", text: `Episode ${currentEpisodeNum + 1}` });
        handleNextEpisode();
      } else if (diffY < 0 && currentEpisodeNum > 1) {
        setSwipeToast({ type: "prev", text: `Episode ${currentEpisodeNum - 1}` });
        handlePrevEpisode();
      }
      setTimeout(() => setSwipeToast(null), 850);
    }
    mouseStartYRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 650) return;
    if (Math.abs(e.deltaY) > 35) {
      lastWheelTimeRef.current = now;
      if (e.deltaY > 0 && currentEpisodeNum < totalEpisodes) {
        setSwipeToast({ type: "next", text: `Episode ${currentEpisodeNum + 1}` });
        handleNextEpisode();
      } else if (e.deltaY < 0 && currentEpisodeNum > 1) {
        setSwipeToast({ type: "prev", text: `Episode ${currentEpisodeNum - 1}` });
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
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Main Watch Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 relative my-2 sm:my-4">
        {/* Navigation Bar above Player */}
        <div className="w-full max-w-[360px] sm:max-w-[420px] mb-2 px-1 flex items-center justify-between">
          <Link
            href="/dracin"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-rose-400" />
            <span>Kembali ke Katalog</span>
          </Link>

          <span className="text-[11px] font-medium text-gray-400">
            AsiaBox 9:16
          </span>
        </div>

        {/* 9:16 Vertical Video Frame */}
        <div
          ref={playerContainerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="relative w-full max-w-[340px] sm:max-w-[380px] md:max-w-[400px] aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden bg-black flex items-center justify-center group select-none border border-white/10 shadow-2xl shadow-rose-950/20 cursor-grab active:cursor-grabbing"
        >
          {/* Swipe Toast Feedback */}
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

          {/* Swipe Hint */}
          <div className="sm:hidden absolute bottom-20 left-4 right-4 z-20 pointer-events-none text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold text-rose-200 bg-black/60 backdrop-blur-md border border-white/10 opacity-70">
              <ChevronUp className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              Geser ke atas untuk episode berikutnya
            </span>
          </div>

          {/* Loading / Error States */}
          {loadingVideo ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 animate-pulse">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-rose-300 font-bold">
                  Memuat Video Episode {currentEpisodeNum}...
                </p>
                <div className="h-3 w-40 rounded bg-white/10 mx-auto" />
              </div>
            </div>
          ) : !videoUrl ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20 p-6 text-center">
              <div className="space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <p className="text-sm font-bold text-white">
                  Video Episode {currentEpisodeNum} Belum Tersedia
                </p>
                <p className="text-xs text-gray-400">
                  Stream dari server AsiaBox sedang offline atau belum diunggah.
                </p>
                <button
                  onClick={() => setCurrentEpisodeNum(1)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-all inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kembali ke Episode 1</span>
                </button>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              loop={false}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleTimeUpdate}
              onEnded={handleNextEpisode}
              onClick={handleVideoClick}
              className="w-full h-full object-cover cursor-pointer"
            />
          )}

          {/* Centered Play button overlay when paused */}
          {!isPlaying && videoUrl && !loadingVideo && (
            <div
              onClick={handleVideoClick}
              className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl scale-110 backdrop-blur-sm">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />

          {/* Top Bar Controls */}
          <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between z-30">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/90 text-white backdrop-blur-md">
                AsiaBox 9:16
              </span>
              <span className="text-xs font-semibold text-gray-200 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-md">
                Ep {currentEpisodeNum}/{totalEpisodes}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleNativeFullscreen}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all pointer-events-auto"
                title="Fullscreen"
              >
                {isNativeFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-rose-400" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all pointer-events-auto"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => setShowInfoModal(true)}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all pointer-events-auto"
                title="Detail Drama"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Action Icons (TikTok / Reels Style) */}
          <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-10 pointer-events-auto">
            <button
              onClick={handlePrevEpisode}
              disabled={currentEpisodeNum <= 1}
              className="flex flex-col items-center gap-1 group disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white group-hover:bg-rose-500/30 group-hover:border-rose-500 transition-all">
                <ChevronUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-gray-300">Prev Ep</span>
            </button>

            <button
              onClick={handleNextEpisode}
              disabled={currentEpisodeNum >= totalEpisodes}
              className="flex flex-col items-center gap-1 group disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white group-hover:bg-rose-500/30 group-hover:border-rose-500 transition-all">
                <ChevronDown className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-gray-300">Next Ep</span>
            </button>

            <button
              onClick={() => setShowEpisodeDrawer(true)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <ListOrdered className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-gray-300">Daftar</span>
            </button>

            <button
              onClick={() => {
                const speeds: (1 | 1.25 | 1.5 | 2)[] = [1, 1.25, 1.5, 2];
                const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                setPlaybackSpeed(speeds[nextIndex]);
              }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-amber-300 font-bold text-xs group-hover:border-amber-400 transition-all">
                {playbackSpeed}x
              </div>
              <span className="text-[10px] font-medium text-gray-300">Speed</span>
            </button>
          </div>

          {/* Bottom Scrubber Progress Bar */}
          <div className="absolute bottom-14 left-4 right-16 z-20 flex flex-col gap-1 pointer-events-auto">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:h-1.5 transition-all"
            />
            <div className="flex items-center justify-between text-[10px] text-gray-300 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Bottom Title & Synopsis */}
          <div className="absolute bottom-3 left-4 right-16 z-10">
            <h2 className="text-sm sm:text-base font-extrabold text-white line-clamp-1">
              {activeDrama.title}
            </h2>
            <p className="text-[11px] text-gray-300 line-clamp-1 mt-0.5 opacity-90">
              {activeDrama.description || "Drama pendek populer romantis & balas dendam."}
            </p>
          </div>
        </div>

        {/* Episode Selector Drawer Modal */}
        {showEpisodeDrawer && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-sm bg-[#12121A] h-full p-6 flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-bold text-white text-base">Pilih Episode</h3>
                  <p className="text-xs text-gray-400">
                    Total {totalEpisodes} Episode Tersedia
                  </p>
                </div>
                <button
                  onClick={() => setShowEpisodeDrawer(false)}
                  className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 grid grid-cols-4 gap-2">
                {Array.from({ length: totalEpisodes }).map((_, i) => {
                  const ep = i + 1;
                  const isActive = ep === currentEpisodeNum;
                  return (
                    <button
                      key={ep}
                      onClick={() => {
                        setCurrentEpisodeNum(ep);
                        setShowEpisodeDrawer(false);
                      }}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105"
                          : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {ep}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Info Modal */}
        {showInfoModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#12121A] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-white">
                  {activeDrama.title}
                </h3>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {activeDrama.description ||
                  "Drama pendek vertikal dengan subtitle bahasa Indonesia."}
              </p>
              <div className="pt-2 text-xs text-rose-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Kualitas HD • Rasio 9:16 Layar Penuh</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function DracinWatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070A] text-white flex items-center justify-center">
          <div className="text-center space-y-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 mx-auto" />
            <p className="text-xs text-rose-400 font-mono">
              Memuat AsiaBox Short Drama...
            </p>
          </div>
        </div>
      }
    >
      <DracinWatchContent />
    </Suspense>
  );
}
