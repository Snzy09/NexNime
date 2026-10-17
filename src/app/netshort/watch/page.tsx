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
  Loader2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import { NetShortDetail, NetShortEpisode } from "@/lib/services/netshortService";
import Hls from "hls.js";

function NetShortWatchContent() {
  const searchParams = useSearchParams();
  const rawSlug = searchParams.get("slug") || "";
  const initialTitle = searchParams.get("title") || "";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<NetShortDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Video & Stream state
  const [activeStreamUrl, setActiveStreamUrl] = useState<string | null>(null);
  const [loadingStream, setLoadingStream] = useState(false);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);

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

  // Player controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5 | 2>(1);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(8920);

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

  // 1. Fetch initial detail
  useEffect(() => {
    if (!rawSlug) return;
    setLoading(true);
    fetch(`/api/netshort?action=detail&slug=${encodeURIComponent(rawSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.detail) {
          setDetail(data.detail);
          setActiveStreamUrl(data.detail.stream_url);
        } else {
          setError(data.error || "Gagal memuat detail drama NetShort");
        }
      })
      .catch((err) => {
        setError(err.message || "Gagal terhubung ke scraper NetShort");
      })
      .finally(() => setLoading(false));
  }, [rawSlug]);

  // 2. Playback speed & mute sync
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.muted = isMuted;
    }
  }, [playbackSpeed, isMuted]);

  // HLS stream attach
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeStreamUrl) return;

    let hls: Hls | null = null;
    if (activeStreamUrl.includes(".m3u8")) {
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(activeStreamUrl);
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
        video.src = activeStreamUrl;
        if (isPlaying) video.play().catch(() => {});
      }
    } else {
      video.src = activeStreamUrl;
      if (isPlaying) video.play().catch(() => {});
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [activeStreamUrl]);

  // 3. Switch episode
  const handleSelectEpisode = async (index: number) => {
    if (!detail?.episodes || !detail.episodes[index]) return;
    setCurrentEpisodeIndex(index);
    const targetEp = detail.episodes[index];

    // If it's episode 0 and we already have initial stream_url, use it
    if (index === 0 && detail.stream_url) {
      setActiveStreamUrl(detail.stream_url);
      setIsPlaying(true);
      return;
    }

    setLoadingStream(true);
    try {
      const res = await fetch(
        `/api/netshort?action=stream&slug=${encodeURIComponent(targetEp.slug)}`
      );
      const data = await res.json();
      if (data.success && data.stream_url) {
        setActiveStreamUrl(data.stream_url);
        setIsPlaying(true);
      } else {
        // Fallback to detail stream_url if individual stream fetch returns empty
        setActiveStreamUrl(detail.stream_url);
      }
    } catch {
      setActiveStreamUrl(detail.stream_url);
    } finally {
      setLoadingStream(false);
    }
  };

  const episodes = detail?.episodes || [];
  const currentEp: NetShortEpisode | undefined = episodes[currentEpisodeIndex];

  const handleNextEpisode = () => {
    if (currentEpisodeIndex < episodes.length - 1) {
      handleSelectEpisode(currentEpisodeIndex + 1);
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisodeIndex > 0) {
      handleSelectEpisode(currentEpisodeIndex - 1);
    }
  };

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

    // Predominantly vertical swipe and distance > 45px
    if (Math.abs(diffY) > 45 && Math.abs(diffY) > Math.abs(diffX) * 1.2) {
      isSwipingRef.current = true;
      if (diffY > 0) {
        // Swiped UP -> Next Episode
        if (currentEpisodeIndex < episodes.length - 1) {
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
        if (currentEpisodeIndex < episodes.length - 1) {
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

    if (Math.abs(diffY) > 50) {
      isSwipingRef.current = true;
      if (diffY > 0 && currentEpisodeIndex < episodes.length - 1) {
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

    if (Math.abs(e.deltaY) > 35) {
      lastWheelTimeRef.current = now;
      if (e.deltaY > 0 && currentEpisodeIndex < episodes.length - 1) {
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
    togglePlay();
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-purple-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 max-w-7xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-3 text-xs sm:text-sm">
          <Link
            href="/netshort"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg bg-white/5 border border-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Katalog NetShort</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 text-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              NetShort
            </span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="w-full max-w-sm aspect-[9/16] rounded-3xl bg-[#121218] border border-white/10 flex flex-col items-center justify-center p-6 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-purple-400 animate-bounce" />
            </div>
            <p className="text-sm font-semibold text-gray-300">
              Menghubungkan ke Stream NetShort...
            </p>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Mengambil payload MP4 video dan metadata episode real dari scraper
            </p>
          </div>
        ) : error || !detail ? (
          <div className="w-full max-w-md p-6 rounded-2xl bg-red-950/30 border border-red-500/30 text-center my-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Gagal Memutar Drama</h3>
            <p className="text-xs text-gray-300 mb-4">{error || "Data drama tidak ditemukan"}</p>
            <Link
              href="/netshort"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-colors"
            >
              Lihat Judul NetShort Lainnya
            </Link>
          </div>
        ) : (
          <div
            ref={playerContainerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            className="max-sm:fixed max-sm:inset-0 max-sm:z-50 max-sm:w-full max-sm:h-[100dvh] max-sm:max-w-none max-sm:rounded-none max-sm:border-0 sm:relative sm:w-full sm:max-w-[400px] sm:aspect-[9/16] sm:max-h-[82vh] sm:rounded-3xl sm:border sm:border-white/10 overflow-hidden bg-black shadow-2xl shadow-purple-950/40 flex flex-col transition-all cursor-grab active:cursor-grabbing"
          >
            {/* Animated Swipe Toast Notification Feedback */}
            {swipeToast && (
              <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none animate-in fade-in zoom-in-90 duration-200">
                <div className="px-5 py-3 rounded-2xl bg-black/85 backdrop-blur-md border border-purple-500/50 text-white flex items-center gap-2.5 shadow-2xl shadow-purple-950/50">
                  {swipeToast.type === "next" ? (
                    <ChevronUp className="w-5 h-5 text-purple-400 animate-bounce" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-purple-400 animate-bounce" />
                  )}
                  <span className="font-extrabold text-sm tracking-wide">
                    {swipeToast.text}
                  </span>
                </div>
              </div>
            )}

            {/* Mobile swipe hint */}
            <div className="sm:hidden absolute bottom-20 left-4 right-4 z-20 pointer-events-none text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold text-purple-200 bg-black/60 backdrop-blur-md border border-white/10 opacity-70">
                <span>Geser ke atas untuk episode berikutnya</span>
                <ChevronUp className="w-3 h-3 text-purple-400" />
              </span>
            </div>

            {/* Direct MP4 / HLS Video Player */}
            {activeStreamUrl ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  loop={false}
                  onEnded={handleNextEpisode}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={handleVideoClick}
                />
                {!isPlaying && (
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-2xl scale-110 transition-transform">
                      <Play className="w-7 h-7 fill-white ml-1" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-black/90">
                <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
                <p className="text-sm font-bold text-white mb-1">Stream Episode Belum Tersedia</p>
                <p className="text-xs text-gray-400">
                  Episode ini sedang diproses oleh CDN NetShort. Silakan coba episode lain di drawer episode.
                </p>
              </div>
            )}

            {/* Loading Stream Spinner Overlay */}
            {loadingStream && (
              <div className="absolute inset-0 z-30 bg-black/60 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                <span className="text-xs font-semibold text-purple-200">
                  Memuat video episode...
                </span>
              </div>
            )}

            {/* Top Gradient & Info Overlay with Mobile Controls */}
            <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/30 to-transparent z-20 flex items-start justify-between pointer-events-auto">
              <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                <Link
                  href="/netshort"
                  className="sm:hidden px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all flex items-center gap-1 text-xs font-bold shrink-0"
                  title="Kembali"
                >
                  <ChevronLeft className="w-4 h-4 text-purple-400" />
                  <span>Katalog</span>
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                      NetShort
                    </span>
                    <span className="text-[10px] text-gray-300">
                      Ep {currentEpisodeIndex + 1}
                      {episodes.length > 0 ? ` / ${episodes.length}` : ""}
                    </span>
                  </div>
                  <h1 className="text-sm font-bold text-white truncate drop-shadow-md">
                    {detail.title || initialTitle}
                  </h1>
                  {currentEp?.name && (
                    <p className="text-[11px] text-purple-300 truncate">
                      {currentEp.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Mute, Fullscreen & Info Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                <button
                  onClick={toggleNativeFullscreen}
                  className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  title="Layar Penuh"
                >
                  {isNativeFullscreen ? <Minimize2 className="w-4 h-4 text-purple-400" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors text-xs font-bold"
                  title="Info"
                >
                  i
                </button>
              </div>
            </div>

            {/* Right Side Social & Episode Action Bar */}
            <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-4 pointer-events-auto">
              {/* Like Button */}
              <button
                onClick={() => {
                  setLiked(!liked);
                  setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
                }}
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                    liked
                      ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/50"
                      : "bg-black/50 border-white/20 text-white group-hover:scale-110"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? "fill-white" : ""}`} />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow">
                  {likeCount.toLocaleString()}
                </span>
              </button>

              {/* Episode Drawer Trigger */}
              <button
                onClick={() => setShowEpisodeDrawer(true)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white backdrop-blur-md group-hover:scale-110 group-hover:bg-purple-600/80 transition-all">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow">
                  {episodes.length > 0 ? `${episodes.length} Eps` : "Episode"}
                </span>
              </button>

              {/* Speed Controller */}
              <button
                onClick={() => {
                  const speeds: (1 | 1.25 | 1.5 | 2)[] = [1, 1.25, 1.5, 2];
                  const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                  setPlaybackSpeed(speeds[nextIndex]);
                }}
                className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-[11px] font-black text-purple-300 backdrop-blur-md hover:bg-black/80 transition-all"
                title="Kecepatan Putar"
              >
                {playbackSpeed}x
              </button>

              {/* Share Button */}
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
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white backdrop-blur-md group-hover:scale-110 transition-all">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium text-white drop-shadow">Bagikan</span>
              </button>
            </div>

            {/* Bottom Controls Bar (Prev/Next, Play/Pause) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 flex flex-col gap-2.5 pointer-events-auto">
              {/* Progress / Seek Bar */}
              <div className="w-full flex items-center gap-2">
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
                    className="h-full bg-purple-500 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-gray-400 shrink-0">
                  {currentTimeStr} / {durationStr}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  )}
                </button>
                <span className="text-xs font-semibold text-gray-200">
                  {isPlaying ? "Memutar" : "Jeda"}
                </span>
              </div>

              {/* Prev / Next Episode Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevEpisode}
                  disabled={currentEpisodeIndex === 0}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white flex items-center gap-1 transition-colors"
                >
                  <ChevronUp className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  onClick={handleNextEpisode}
                  disabled={currentEpisodeIndex >= episodes.length - 1}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white flex items-center gap-1 transition-colors shadow-md shadow-purple-600/30"
                >
                  Next <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

            {/* Episode Selector Drawer Modal */}
            {showEpisodeDrawer && (
              <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-md p-4 flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4 text-purple-400" />
                      <span>Daftar Episode ({episodes.length})</span>
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Pilih episode untuk langsung streaming
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEpisodeDrawer(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 py-3 pr-1">
                  {episodes.map((ep, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleSelectEpisode(idx);
                        setShowEpisodeDrawer(false);
                      }}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all ${
                        currentEpisodeIndex === idx
                          ? "bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30"
                          : "bg-white/5 hover:bg-white/10 text-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-black/40 text-purple-200 font-mono">
                          #{idx + 1}
                        </span>
                        <span className="text-xs truncate">{ep.name}</span>
                      </div>
                      {currentEpisodeIndex === idx && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-semibold shrink-0">
                          Sedang Diputar
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Info Modal */}
            {showInfoModal && (
              <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-md p-5 flex flex-col animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Detail Drama
                  </h3>
                  <button
                    onClick={() => setShowInfoModal(false)}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-gray-300">
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">{detail.title}</h4>
                    {detail.genre && detail.genre.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 my-2">
                        {detail.genre.map((g, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-medium text-[10px]"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                      Sinopsis:
                    </span>
                    <p className="leading-relaxed">
                      {detail.description || "Tidak ada sinopsis tersedia untuk drama ini."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 space-y-1 text-[11px] text-gray-400">
                    <p>
                      • Total Episode Terdata: <span className="text-white font-medium">{episodes.length}</span>
                    </p>
                    <p>
                      • Sumber Scraper: <span className="text-purple-400 font-medium">NetShort.com</span>
                    </p>
                    <p>
                      • Format Video: <span className="text-emerald-400 font-medium">Direct MP4 Video Stream</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function NetShortWatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070A] text-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      }
    >
      <NetShortWatchContent />
    </Suspense>
  );
}
