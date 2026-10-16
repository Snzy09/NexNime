"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import Link from "next/link";
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
  Search,
  Flame,
  Eye,
  Heart,
  Layers,
  AlertCircle,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
} from "lucide-react";
import { DracinItem } from "@/lib/services/dracinService";
import { ReelShortItem } from "@/lib/services/reelshortService";
import { NetShortItem } from "@/lib/services/netshortService";
import { REAL_DRACIN_SHORTS } from "@/lib/services/realDataFallback";
import DracinReelsSkeleton from "@/components/skeletons/DracinReelsSkeleton";

type ShortDramaProvider = "asiabox" | "reelshort" | "netshort";

export default function DracinHubPage() {
  const [provider, setProvider] = useState<ShortDramaProvider>("asiabox");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // AsiaBox Reels State
  const [dramaList, setDramaList] = useState<DracinItem[]>(REAL_DRACIN_SHORTS);
  const [selectedDramaIndex, setSelectedDramaIndex] = useState(0);
  const [currentEpisodeNum, setCurrentEpisodeNum] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5 | 2>(1);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingAsiaList, setLoadingAsiaList] = useState(true);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(true);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

  // ReelShort State
  const [reelShortCategory, setReelShortCategory] = useState("Billionaire");
  const [reelShortDramas, setReelShortDramas] = useState<ReelShortItem[]>([]);
  const [loadingReelShort, setLoadingReelShort] = useState(false);

  // NetShort State
  const [netShortDramas, setNetShortDramas] = useState<NetShortItem[]>([]);
  const [loadingNetShort, setLoadingNetShort] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

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

  // Read URL query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const prov = sp.get("provider") as ShortDramaProvider;
      if (prov && ["asiabox", "reelshort", "netshort"].includes(prov)) {
        setProvider(prov);
      }
    }
  }, []);

  // 1. Fetch AsiaBox on mount
  useEffect(() => {
    fetch("/api/dracin?action=home")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && d.items.length > 0) {
          setDramaList(d.items);
          if (typeof window !== "undefined") {
            const sp = new URLSearchParams(window.location.search);
            const targetDrama = sp.get("drama");
            if (targetDrama) {
              const foundIdx = d.items.findIndex(
                (item: DracinItem) => item.slug === targetDrama
              );
              if (foundIdx !== -1) {
                setSelectedDramaIndex(foundIdx);
              }
            }
          }
        }
      })
      .catch((e) => console.error("Error fetching Dracin list:", e))
      .finally(() => setLoadingAsiaList(false));
  }, []);

  const currentDrama = dramaList[selectedDramaIndex] || REAL_DRACIN_SHORTS[0];
  const totalEpisodes = currentDrama.episodes || 80;

  // Fetch episode MP4 for AsiaBox (no dummy fallback)
  useEffect(() => {
    if (provider !== "asiabox" || !currentDrama?.slug) return;
    setLoadingVideo(true);
    setVideoUrl("");
    fetch(
      `/api/dracin?action=episode&slug=${encodeURIComponent(
        currentDrama.slug
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
  }, [provider, currentDrama?.slug, currentEpisodeNum]);

  // Attach HLS or direct stream to videoRef
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

  // Video element playback speed and mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.muted = isMuted;
    }
  }, [playbackSpeed, isMuted, videoUrl]);

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

  // 2. Fetch ReelShort Data
  useEffect(() => {
    if (provider === "reelshort") {
      setLoadingReelShort(true);
      const url = searchQuery.trim()
        ? `/api/reelshort?action=search&q=${encodeURIComponent(searchQuery.trim())}`
        : `/api/reelshort?action=popular&category=${encodeURIComponent(reelShortCategory)}`;

      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          if (data.items && Array.isArray(data.items)) {
            setReelShortDramas(data.items);
          } else {
            setReelShortDramas([]);
          }
        })
        .catch((err) => {
          console.error("ReelShort fetch error:", err);
          setReelShortDramas([]);
        })
        .finally(() => setLoadingReelShort(false));
    }
  }, [provider, reelShortCategory, searchQuery]);

  // 3. Fetch NetShort Data
  useEffect(() => {
    if (provider === "netshort") {
      setLoadingNetShort(true);
      fetch("/api/netshort?action=list")
        .then((r) => r.json())
        .then((data) => {
          if (data.items && Array.isArray(data.items)) {
            setNetShortDramas(data.items);
          } else {
            setNetShortDramas([]);
          }
        })
        .catch((err) => {
          console.error("NetShort fetch error:", err);
          setNetShortDramas([]);
        })
        .finally(() => setLoadingNetShort(false));
    }
  }, [provider]);

  const filteredNetShort = netShortDramas.filter((item) => {
    if (!searchQuery.trim()) return true;
    return item.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

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
        if (currentEpisodeNum < totalEpisodes) {
          setSwipeToast({
            type: "next",
            text: `Episode ${currentEpisodeNum + 1}`,
          });
          handleNextEpisode();
        }
      } else {
        // Swiped DOWN -> Previous Episode
        if (currentEpisodeNum > 1) {
          setSwipeToast({
            type: "prev",
            text: `Episode ${currentEpisodeNum - 1}`,
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
      if (diffY > 0 && currentEpisodeNum < totalEpisodes) {
        setSwipeToast({
          type: "next",
          text: `Episode ${currentEpisodeNum + 1}`,
        });
        handleNextEpisode();
      } else if (diffY < 0 && currentEpisodeNum > 1) {
        setSwipeToast({
          type: "prev",
          text: `Episode ${currentEpisodeNum - 1}`,
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
      if (e.deltaY > 0 && currentEpisodeNum < totalEpisodes) {
        setSwipeToast({
          type: "next",
          text: `Episode ${currentEpisodeNum + 1}`,
        });
        handleNextEpisode();
      } else if (e.deltaY < 0 && currentEpisodeNum > 1) {
        setSwipeToast({
          type: "prev",
          text: `Episode ${currentEpisodeNum - 1}`,
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
    }
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Header Hub Banner with Provider Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
        <div className="rounded-2xl bg-gradient-to-r from-rose-950/50 via-[#181014] to-[#0D0D14] p-5 sm:p-6 border border-rose-500/20 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Video className="w-8 h-8 text-rose-500" />
              <span>Short Drama Hub (9:16 Vertikal)</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1.5 max-w-2xl">
              Nonton drama pendek rasio 9:16 ala TikTok/Reels dari 3 platform: AsiaBox, ReelShort, dan NetShort. 100% data real hasil live scrape.
            </p>
          </div>

          {/* Provider Tabs */}
          <div className="flex items-center gap-1.5 bg-[#14141E] p-1.5 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => {
                setProvider("asiabox");
                setSearchQuery("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                provider === "asiabox"
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>AsiaBox Reels (Player)</span>
            </button>

            <button
              onClick={() => {
                setProvider("reelshort");
                setSearchQuery("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                provider === "reelshort"
                  ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ReelShort (9:16)</span>
            </button>

            <button
              onClick={() => {
                setProvider("netshort");
                setSearchQuery("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                provider === "netshort"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>NetShort (9:16)</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: ASIABOX TIKTOK/REELS PLAYER */}
      {provider === "asiabox" && (
        <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 relative my-4">
          {/* Drama Selector Horizontal Bar with Thumbnail & Episodes */}
          <div className="w-full max-w-xl flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mb-3 px-1">
            {loadingAsiaList
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 w-32 rounded-xl bg-white/5 animate-pulse shrink-0" />
                ))
              : dramaList.map((drama, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDramaIndex(idx);
                      setCurrentEpisodeNum(1);
                      setIsMobileFullscreen(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 border ${
                      selectedDramaIndex === idx
                        ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30 scale-105"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {drama.image && (
                      <img
                        src={drama.image}
                        alt=""
                        className="w-4 h-6 object-cover rounded shrink-0"
                      />
                    )}
                    <span>{drama.title}</span>
                    {drama.episodes && (
                      <span className="text-[10px] opacity-75 bg-black/40 px-1.5 py-0.5 rounded">
                        {drama.episodes} Ep
                      </span>
                    )}
                  </button>
                ))}
          </div>

          {/* Mobile Fullscreen Banner Button (when minimized on phone) */}
          {!isMobileFullscreen && (
            <div className="sm:hidden w-full max-w-[380px] mb-2 px-1">
              <button
                onClick={() => setIsMobileFullscreen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Buka Mode Layar Penuh (Full Screen)</span>
              </button>
            </div>
          )}

          {/* 9:16 Vertical Video Frame (Fullscreen on Mobile Phone) */}
          <div
            ref={playerContainerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            className={`overflow-hidden bg-black flex items-center justify-center group select-none transition-all cursor-grab active:cursor-grabbing ${
              isMobileFullscreen
                ? "max-sm:fixed max-sm:inset-0 max-sm:z-50 max-sm:w-full max-sm:h-[100dvh] max-sm:max-w-none max-sm:rounded-none max-sm:border-0 sm:relative sm:w-full sm:max-w-[400px] sm:aspect-[9/16] sm:rounded-3xl sm:border sm:border-white/10 sm:shadow-2xl sm:shadow-rose-950/20"
                : "relative w-full max-w-[380px] sm:max-w-[400px] aspect-[9/16] rounded-3xl border border-white/10 shadow-2xl shadow-rose-950/20"
            }`}
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
                <ChevronUp className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                Geser ke atas untuk episode berikutnya
              </span>
            </div>

            {loadingVideo ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 animate-pulse">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-rose-300 font-bold">Memuat Video Episode {currentEpisodeNum}...</p>
                  <div className="h-3 w-40 rounded bg-white/10 mx-auto" />
                </div>
              </div>
            ) : !videoUrl ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20 p-6 text-center">
                <div className="space-y-3">
                  <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                  <p className="text-sm font-bold text-white">Video Episode {currentEpisodeNum} Belum Tersedia</p>
                  <p className="text-xs text-gray-400">Stream dari server provider AsiaBox belum dapat dimuat.</p>
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

            {/* Centered Play overlay when paused */}
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

            {/* Top Bar Info & Mobile Fullscreen Controls */}
            <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between z-30">
              <div className="flex items-center gap-2">
                {/* Mobile Back / Minimize Button */}
                {isMobileFullscreen && (
                  <button
                    onClick={() => setIsMobileFullscreen(false)}
                    className="sm:hidden px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all flex items-center gap-1 text-xs font-bold pointer-events-auto"
                    title="Perkecil ke Katalog"
                  >
                    <ChevronLeft className="w-4 h-4 text-rose-400" />
                    <span>Katalog</span>
                  </button>
                )}

                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/90 text-white backdrop-blur-md">
                  AsiaBox 9:16
                </span>
                <span className="text-xs font-semibold text-gray-200 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-md">
                  Ep {currentEpisodeNum}/{totalEpisodes}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Native Fullscreen Toggle */}
                <button
                  onClick={toggleNativeFullscreen}
                  className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all pointer-events-auto"
                  title="Fullscreen"
                >
                  {isNativeFullscreen ? <Minimize2 className="w-4 h-4 text-rose-400" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all pointer-events-auto"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
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

            {/* Right Side TikTok Action Buttons */}
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

            {/* Bottom Scrubber Progress Bar & Time */}
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
                {currentDrama.title}
              </h2>
              <p className="text-[11px] text-gray-300 line-clamp-1 mt-0.5 opacity-90">
                {currentDrama.description || "Drama pendek populer romantis & balas dendam."}
              </p>
            </div>
          </div>

          {/* Episode Drawer */}
          {showEpisodeDrawer && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
              <div className="w-full max-w-sm bg-[#12121A] h-full p-6 flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <h3 className="font-bold text-white text-base">Pilih Episode</h3>
                    <p className="text-xs text-gray-400">Total {totalEpisodes} Episode Tersedia</p>
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
                  <h3 className="font-bold text-lg text-white">{currentDrama.title}</h3>
                  <button
                    onClick={() => setShowInfoModal(false)}
                    className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {currentDrama.description || "Drama pendek vertikal dengan subtitle bahasa Indonesia."}
                </p>
                <div className="pt-2 text-xs text-rose-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Kualitas HD • Rasio 9:16 Layar Penuh</span>
                </div>
              </div>
            </div>
          )}

          {/* AsiaBox Catalog Grid */}
          <div className="w-full max-w-7xl px-2 sm:px-4 mt-12 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <span>Koleksi Serial AsiaBox (Klik untuk Tonton)</span>
              </h2>
              <span className="text-xs text-gray-400">
                {loadingAsiaList ? "Memuat katalog..." : `${dramaList.length} Judul`}
              </span>
            </div>

            {loadingAsiaList ? (
              <DracinReelsSkeleton />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {dramaList.map((drama, idx) => {
                  const isSelected = selectedDramaIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedDramaIndex(idx);
                        setCurrentEpisodeNum(1);
                        setIsMobileFullscreen(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`group relative rounded-2xl overflow-hidden bg-[#13131A] border transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-950/40 ${
                        isSelected
                          ? "border-rose-500 ring-2 ring-rose-500/50"
                          : "border-white/5 hover:border-rose-500/40"
                      }`}
                    >
                      <div className="relative aspect-[9/16] w-full overflow-hidden bg-black/60">
                        {drama.image ? (
                          <img
                            src={drama.image}
                            alt={drama.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-rose-950/30 text-rose-300 text-xs text-center p-3">
                            {drama.title}
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                          <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl shadow-rose-600/50">
                            <Play className="w-5 h-5 fill-white ml-0.5" />
                          </div>
                        </div>

                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600/90 text-white shadow-sm flex items-center gap-1 backdrop-blur-sm">
                            <Sparkles className="w-2.5 h-2.5" />
                            AsiaBox
                          </span>
                          {drama.episodes && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-amber-300 backdrop-blur-sm border border-white/10">
                              {drama.episodes} Ep
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                          <p className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-rose-300 transition-colors">
                            {drama.title}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 truncate">
                            {isSelected ? "Sedang Diputar" : "Klik untuk putar"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      )}

      {/* VIEW 2: REELSHORT CATALOG */}
      {provider === "reelshort" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Search Bar & Genres */}
          <div className="rounded-2xl bg-[#121218] border border-white/10 p-4 shadow-xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari drama ReelShort (contoh: CEO, Revenge, Billionaire, Secret Wife)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#181824] text-xs sm:text-sm text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-2.5 border border-white/5 focus:border-rose-500/40 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
              <span className="text-xs text-gray-400 font-medium shrink-0 flex items-center gap-1 mr-1">
                <Layers className="w-3.5 h-3.5 text-rose-400" /> Kategori:
              </span>
              {["Billionaire", "Romance", "Revenge", "Werewolf", "Forbidden Love", "CEO"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setReelShortCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    reelShortCategory === cat
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Skeleton */}
          {loadingReelShort && <DracinReelsSkeleton />}

          {/* Empty state */}
          {!loadingReelShort && reelShortDramas.length === 0 && (
            <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Tidak ada drama ReelShort ditemukan</h3>
              <p className="text-xs text-gray-400">Coba kata kunci lain atau pilih kategori di atas.</p>
            </div>
          )}

          {/* ReelShort 9:16 Grid */}
          {!loadingReelShort && reelShortDramas.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {reelShortDramas.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/reelshort/watch?id=${item.book_id}&title=${encodeURIComponent(item.title)}`}
                  className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-rose-500/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-950/40"
                >
                  <div className="relative aspect-[9/16] w-full overflow-hidden bg-black/70">
                    {item.cover ? (
                      <img
                        src={item.cover}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#181822]">
                        <Video className="w-8 h-8 text-rose-500/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/40" />
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-rose-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-rose-500/30">
                      REELSHORT
                    </div>
                    {item.total_episodes && (
                      <div className="absolute top-2 right-2 bg-black/70 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
                        <Layers className="w-2.5 h-2.5" />
                        {item.total_episodes} Ep
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="w-12 h-12 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-lg shadow-rose-500/50 scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-gray-300">
                      {item.read_count ? (
                        <span className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded">
                          <Eye className="w-3 h-3 text-rose-400" />
                          {(item.read_count / 1000000).toFixed(1)}M
                        </span>
                      ) : null}
                      {item.collect_count ? (
                        <span className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded text-amber-300">
                          <Heart className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {(item.collect_count / 1000).toFixed(0)}k
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col justify-between flex-1 space-y-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-rose-300">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: NETSHORT CATALOG */}
      {provider === "netshort" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Search Bar */}
          <div className="rounded-2xl bg-[#121218] border border-white/10 p-4 shadow-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari drama NetShort (contoh: Destiny, Alpha, Revenge)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#181824] text-xs sm:text-sm text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-2.5 border border-white/5 focus:border-purple-500/40 focus:outline-none"
              />
            </div>
          </div>

          {/* Loading Skeleton */}
          {loadingNetShort && <DracinReelsSkeleton />}

          {/* Empty state */}
          {!loadingNetShort && filteredNetShort.length === 0 && (
            <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-purple-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Tidak ada drama NetShort ditemukan</h3>
              <p className="text-xs text-gray-400">Coba kata kunci pencarian yang lain.</p>
            </div>
          )}

          {/* NetShort 9:16 Grid */}
          {!loadingNetShort && filteredNetShort.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {filteredNetShort.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/netshort/watch?slug=${item.slug}&title=${encodeURIComponent(item.title)}`}
                  className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-purple-500/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-950/40"
                >
                  <div className="relative aspect-[9/16] w-full overflow-hidden bg-black/70">
                    {item.cover ? (
                      <img
                        src={item.cover}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#181822]">
                        <Video className="w-8 h-8 text-purple-500/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/40" />
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-purple-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-purple-500/30">
                      NETSHORT
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg shadow-purple-600/50 scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col justify-between flex-1 space-y-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-purple-300">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
