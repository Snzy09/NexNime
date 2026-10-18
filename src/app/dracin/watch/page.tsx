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
  Globe,
  Subtitles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import AutoNextCountdown from "@/components/AutoNextCountdown";
import { DracinItem, DracinDetail } from "@/lib/services/dracinService";
import { REAL_DRACIN_SHORTS } from "@/lib/services/realDataFallback";
import { saveWatchHistory, getSavedResumeTime } from "@/lib/services/watchHistory";
import { useVideoShortcuts, VideoShortcutToast } from "@/lib/hooks/useVideoShortcuts";

interface SubtitleTrack {
  language: string;
  name: string;
  vtt_url?: string;
  srt_url?: string;
}

function DracinWatchContent() {
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id") || searchParams.get("slug") || "";
  const initialTitle = searchParams.get("title") || "";
  const initialEp = parseInt(searchParams.get("ep") || "1", 10);
  const provider = (searchParams.get("provider") || "asiabox").toLowerCase();
  const queryTotalEp = parseInt(searchParams.get("total_ep") || searchParams.get("eps") || "0", 10);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [detail, setDetail] = useState<DracinDetail | null>(null);
  const [currentEpisodeNum, setCurrentEpisodeNum] = useState<number>(initialEp > 0 ? initialEp : 1);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Subtitles & Languages
  const [subtitles, setSubtitles] = useState<SubtitleTrack[]>([]);
  const [selectedSubLang, setSelectedSubLang] = useState<string>("id-ID");
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>("id");

  // Player controls state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5 | 2>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [totalEpisodesCount, setTotalEpisodesCount] = useState<number>(queryTotalEp > 0 ? queryTotalEp : 80);
  const [showAutoNext, setShowAutoNext] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Fallback drama metadata
  const fallbackDrama: DracinItem =
    REAL_DRACIN_SHORTS.find((d) => d.slug === rawId) || {
      slug: rawId,
      title: initialTitle || "Short Drama",
      url: `/dracin/watch?provider=${provider}&id=${encodeURIComponent(rawId)}`,
      episodes: 80,
      description: "Serial drama pendek kualitas HD.",
    };

  const activeDrama = detail?.film || fallbackDrama;
  const dramaTitle = initialTitle || activeDrama.title || "Short Drama";

  // 1. Fetch Episodes / Detail List
  useEffect(() => {
    if (!rawId) return;

    if (provider === "freereels") {
      fetch(`/api/dracin?provider=freereels&action=detail&id=${encodeURIComponent(rawId)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.episodes?.episodes?.length) {
            setTotalEpisodesCount(data.episodes.episodes.length);
          } else if (data.info?.total_episodes) {
            setTotalEpisodesCount(data.info.total_episodes);
          } else {
            setTotalEpisodesCount(80);
          }
        })
        .catch(() => setTotalEpisodesCount(80));
    } else if (provider === "pinedrama") {
      fetch(`/api/dracin?provider=pinedrama&action=episodes&id=${encodeURIComponent(rawId)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.episodes?.total) {
            setTotalEpisodesCount(data.episodes.total);
          } else if (data.episodes?.episodes?.length) {
            setTotalEpisodesCount(data.episodes.episodes.length);
          } else {
            setTotalEpisodesCount(50);
          }
        })
        .catch(() => setTotalEpisodesCount(50));
    } else if (provider === "melolo") {
      fetch(`/api/dracin?provider=melolo&action=episodes&id=${encodeURIComponent(rawId)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.episodes?.total_episode) {
            setTotalEpisodesCount(data.episodes.total_episode);
          } else {
            setTotalEpisodesCount(60);
          }
        })
        .catch(() => setTotalEpisodesCount(60));
    } else {
      // AsiaBox
      fetch(`/api/dracin?action=detail&slug=${encodeURIComponent(rawId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.detail) {
            setDetail(data.detail);
            setTotalEpisodesCount(data.detail.total_episode || 80);
          }
        })
        .catch(() => setTotalEpisodesCount(80));
    }
  }, [rawId, provider]);

  // 2. Fetch Video Stream for Selected Episode
  useEffect(() => {
    if (!rawId) return;
    setLoadingVideo(true);
    setErrorMsg(null);
    setVideoUrl("");
    setShowAutoNext(false);

    let url = `/api/dracin?action=episode&slug=${encodeURIComponent(rawId)}&ep=${currentEpisodeNum}`;
    if (provider === "freereels") {
      url = `/api/dracin?provider=freereels&action=stream&id=${encodeURIComponent(rawId)}&ep=${currentEpisodeNum}`;
    } else if (provider === "pinedrama") {
      url = `/api/dracin?provider=pinedrama&action=stream&id=${encodeURIComponent(rawId)}&ep=${currentEpisodeNum}&lang=${selectedLang}`;
    } else if (provider === "melolo") {
      url = `/api/dracin?provider=melolo&action=stream&id=${encodeURIComponent(rawId)}&ep=${currentEpisodeNum}&lang=${selectedLang}`;
    }

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (provider === "freereels") {
          const streamData = d.stream;
          const streamUrl = streamData?.stream_url || streamData?.proxy_stream_url || streamData?.raw_stream_url;
          if (streamUrl) {
            setVideoUrl(streamUrl);
            if (streamData?.subtitles && Array.isArray(streamData.subtitles)) {
              setSubtitles(streamData.subtitles);
              const foundId = streamData.subtitles.find(
                (s: SubtitleTrack) =>
                  s.language?.toLowerCase().startsWith("id") ||
                  (s.name && s.name.toLowerCase().includes("indonesia"))
              );
              if (foundId) {
                setSelectedSubLang(foundId.language);
              } else if (streamData.subtitles.length > 0) {
                setSelectedSubLang(streamData.subtitles[0].language);
              }
            }
          } else {
            setErrorMsg(d.error || "Stream video FreeReels tidak tersedia.");
          }
        } else if (provider === "pinedrama" || provider === "melolo") {
          if (d.stream?.stream_url) {
            setVideoUrl(d.stream.stream_url);
          } else {
            setErrorMsg(d.error || "Stream video tidak ditemukan.");
          }
        } else {
          // AsiaBox
          const epVideo =
            d.episode?.video ||
            detail?.episodes?.find((e: any) => e.number === currentEpisodeNum)?.video;
          if (epVideo) {
            setVideoUrl(epVideo);
            const sub =
              d.episode?.subtitle ||
              detail?.episodes?.find((e: any) => e.number === currentEpisodeNum)?.subtitle;
            if (sub) {
              const proxiedSub = `/api/dracin?action=subtitle&url=${encodeURIComponent(sub)}`;
              setSubtitles([
                {
                  language: "id-ID",
                  name: "Bahasa Indonesia",
                  vtt_url: proxiedSub,
                },
              ]);
              setSelectedSubLang("id-ID");
            }
          } else {
            setErrorMsg("Gagal memuat video episode AsiaBox.");
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load episode stream:", err);
        const epVideo = detail?.episodes?.find((e: any) => e.number === currentEpisodeNum)?.video;
        if (epVideo) {
          setVideoUrl(epVideo);
        } else {
          setErrorMsg("Gagal menghubungi server stream drama.");
        }
      })
      .finally(() => setLoadingVideo(false));
  }, [rawId, currentEpisodeNum, provider, selectedLang, detail]);

  // 3. Attach HLS or direct stream to video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    let hls: Hls | null = null;
    if (videoUrl.includes(".m3u8")) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
          setIsPlaying(true);
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
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
                setErrorMsg("Gagal memutar stream video. Silakan coba episode lain.");
                break;
            }
          }
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

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Mobile Touch Swipe to change episodes
  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const isSwipingRef = useRef(false);
  const [swipeToast, setSwipeToast] = useState<{
    type: "next" | "prev";
    text: string;
  } | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  useEffect(() => {
    const hintTimer = setTimeout(() => setShowSwipeHint(false), 5000);
    return () => clearTimeout(hintTimer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartYRef.current = e.touches[0].clientY;
    touchStartXRef.current = e.touches[0].clientX;
    isSwipingRef.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null || touchStartXRef.current === null) return;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;

    // Minimum distance threshold of 45px for vertical swipe
    if (Math.abs(diffY) > 45 && Math.abs(diffY) > Math.abs(diffX) * 1.1) {
      isSwipingRef.current = true;
      setShowSwipeHint(false);
      if (diffY > 0) {
        // Swiped UP -> Next Episode
        if (currentEpisodeNum < totalEpisodesCount) {
          setSwipeToast({
            type: "next",
            text: `Episode ${currentEpisodeNum + 1}`,
          });
          handleNextEp();
        }
      } else {
        // Swiped DOWN -> Previous Episode
        if (currentEpisodeNum > 1) {
          setSwipeToast({
            type: "prev",
            text: `Episode ${currentEpisodeNum - 1}`,
          });
          handlePrevEp();
        }
      }
      setTimeout(() => setSwipeToast(null), 850);
    } else if (Math.abs(diffX) > 55 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      // Horizontal swipe
      isSwipingRef.current = true;
      setShowSwipeHint(false);
      if (diffX > 0) {
        // Swiped LEFT -> Next Episode
        if (currentEpisodeNum < totalEpisodesCount) {
          setSwipeToast({
            type: "next",
            text: `Episode ${currentEpisodeNum + 1}`,
          });
          handleNextEp();
        }
      } else {
        // Swiped RIGHT -> Previous Episode
        if (currentEpisodeNum > 1) {
          setSwipeToast({
            type: "prev",
            text: `Episode ${currentEpisodeNum - 1}`,
          });
          handlePrevEp();
        }
      }
      setTimeout(() => setSwipeToast(null), 850);
    }

    touchStartYRef.current = null;
    touchStartXRef.current = null;
  };

  const handleVideoClick = () => {
    if (isSwipingRef.current) {
      isSwipingRef.current = false;
      return;
    }
    togglePlay();
  };

  const handleNextEp = () => {
    if (currentEpisodeNum < totalEpisodesCount) {
      setCurrentEpisodeNum((prev) => prev + 1);
    }
  };

  const handlePrevEp = () => {
    if (currentEpisodeNum > 1) {
      setCurrentEpisodeNum((prev) => prev - 1);
    }
  };

  const lastSavedTimeRef = useRef(0);
  const resumeHandledRef = useRef(false);

  useEffect(() => {
    resumeHandledRef.current = false;
  }, [currentEpisodeNum, videoUrl]);

  const handleLoadedMetadata = () => {
    if (resumeHandledRef.current || !videoRef.current) return;
    const paramT = parseFloat(searchParams.get("t") || "0");
    const savedT = getSavedResumeTime(`dracin-${provider}-${rawId}`);
    const resumeSec = paramT > 0 ? paramT : savedT;
    if (resumeSec > 0 && resumeSec < (videoRef.current.duration || 9999) - 5) {
      videoRef.current.currentTime = resumeSec;
    }
    resumeHandledRef.current = true;
  };

  const { toast: shortcutToast, isIframeFocused, refocus } = useVideoShortcuts({
    videoRef,
    containerRef: playerContainerRef,
    onTogglePlay: togglePlay,
    onToggleFullscreen: toggleNativeFullscreen,
    onNext: handleNextEp,
    onPrev: handlePrevEp,
  });

  const selectedSub = subtitles.find((s) => s.language === selectedSubLang);

  return (
    <div className="min-h-screen bg-[#060609] text-white flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-0 sm:py-6 sm:px-4">
        <div
          ref={playerContainerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full sm:max-w-md h-[calc(100vh-64px)] sm:h-[84vh] bg-black sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-between touch-pan-x select-none"
        >
          {/* Top Bar Overlay */}
          <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent z-30 flex items-center justify-between gap-2">
            <Link
              href="/dracin"
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <div className="flex-1 text-center px-2 min-w-0">
              <span className="text-[10px] font-bold tracking-wider uppercase text-rose-400 bg-rose-950/70 px-2 py-0.5 rounded-full border border-rose-500/20 inline-block mb-0.5">
                {provider.toUpperCase()} • EP {currentEpisodeNum}
              </span>
              <h1 className="text-xs sm:text-sm font-black text-white truncate drop-shadow-md">
                {dramaTitle}
              </h1>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Subtitle Softsub Selector for FreeReels */}
              {provider === "freereels" && subtitles.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSubMenu(!showSubMenu)}
                    className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors"
                    title="Pilih Subtitle (24 Bahasa)"
                  >
                    <Subtitles className="w-4 h-4 text-amber-400" />
                  </button>

                  {showSubMenu && (
                    <div className="absolute right-0 top-11 w-48 max-h-60 overflow-y-auto bg-[#12121A] border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                      <p className="text-[10px] uppercase font-bold text-gray-400 px-2 py-1 border-b border-white/10">
                        Pilih Subtitle ({subtitles.length})
                      </p>
                      {subtitles.map((sub) => (
                        <button
                          key={sub.language}
                          type="button"
                          onClick={() => {
                            setSelectedSubLang(sub.language);
                            setShowSubMenu(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                            selectedSubLang === sub.language
                              ? "bg-rose-500 text-white font-bold"
                              : "text-gray-300 hover:bg-white/10"
                          }`}
                        >
                          <span className="truncate">{sub.name}</span>
                          <span className="text-[10px] opacity-70 uppercase font-mono">
                            {sub.language}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Language Selector for PineDrama Hardsub */}
              {provider === "pinedrama" && (
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="bg-black/70 text-amber-300 border border-white/20 rounded-full px-2 py-1 text-[11px] font-bold focus:outline-none"
                  title="Pilih Bahasa Subtitle"
                >
                  <option value="id">ID (Indo)</option>
                  <option value="en">EN (English)</option>
                  <option value="th">TH (Thai)</option>
                  <option value="vi">VI (Viet)</option>
                  <option value="es">ES (Spanish)</option>
                  <option value="ko">KO (Korean)</option>
                  <option value="ja">JA (Japanese)</option>
                </select>
              )}

              <button
                type="button"
                onClick={() => setShowInfoModal(true)}
                className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors"
              >
                <Info className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>

          {/* Video Player Center Surface */}
          <div
            className="relative flex-1 w-full h-full flex items-center justify-center bg-black cursor-pointer overflow-hidden"
            onClick={handleVideoClick}
          >
            {loadingVideo ? (
              <div className="flex flex-col items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
                <span className="text-xs font-mono tracking-wider animate-pulse">
                  Memuat Episode {currentEpisodeNum}...
                </span>
              </div>
            ) : errorMsg ? (
              <div className="p-6 text-center max-w-xs space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <p className="text-xs text-gray-300">{errorMsg}</p>
                <button
                  type="button"
                  onClick={() => setCurrentEpisodeNum(1)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                >
                  Kembali ke Episode 1
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                playsInline
                className="w-full h-full object-cover sm:object-contain bg-black"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    const cur = videoRef.current.currentTime;
                    const dur = videoRef.current.duration || 0;
                    setCurrentTime(cur);
                    setDuration(dur);
                    if (Math.abs(cur - lastSavedTimeRef.current) > 3 && dur > 0) {
                      lastSavedTimeRef.current = cur;
                      saveWatchHistory({
                        id: `dracin-${provider}-${rawId}`,
                        title: dramaTitle,
                        category: "dracin",
                        episodeNumber: currentEpisodeNum,
                        poster: activeDrama.image || "",
                        watchUrl: `/dracin/watch?provider=${provider}&id=${encodeURIComponent(rawId)}&ep=${currentEpisodeNum}`,
                        currentTime: cur,
                        duration: dur,
                      });
                    }
                  }
                }}
                onEnded={() => {
                  if (currentEpisodeNum < totalEpisodesCount) {
                    setShowAutoNext(true);
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => {
                  setErrorMsg("Stream video episode ini bermasalah atau sedang diproses. Silakan coba episode lain.");
                }}
              >
                {selectedSub && selectedSub.vtt_url && (
                  <track
                    key={`${selectedSub.language}-${currentEpisodeNum}`}
                    kind="subtitles"
                    src={selectedSub.vtt_url}
                    srcLang={selectedSub.language}
                    label={selectedSub.name}
                    default
                  />
                )}
              </video>
            )}

            {/* Play/Pause Center Indicator on Pause */}
            {!isPlaying && !loadingVideo && !errorMsg && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl scale-110">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
              </div>
            )}

            {/* Animated Swipe Toast Feedback */}
            {swipeToast && (
              <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-in fade-in zoom-in-90 duration-200">
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

            {/* Mobile Swipe Hint */}
            {showSwipeHint && (
              <div className="sm:hidden absolute bottom-24 left-4 right-4 z-20 pointer-events-none text-center animate-in fade-in duration-300">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold text-rose-200 bg-black/60 backdrop-blur-md border border-white/10 opacity-70 animate-pulse">
                  <span>Swipe ke atas untuk episode berikutnya</span>
                  <ChevronUp className="w-3 h-3 text-rose-400" />
                </span>
              </div>
            )}
          </div>

          {/* Right Floating Quick Actions */}
          <div className="absolute right-3.5 bottom-24 flex flex-col items-center gap-3 z-30 pointer-events-auto">
            {/* Previous Episode */}
            <button
              type="button"
              disabled={currentEpisodeNum <= 1}
              onClick={handlePrevEp}
              className="w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 disabled:opacity-30 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all shadow-lg active:scale-90"
              title="Episode Sebelumnya"
            >
              <ChevronUp className="w-5 h-5 text-gray-300" />
            </button>

            {/* Next Episode */}
            <button
              type="button"
              disabled={currentEpisodeNum >= totalEpisodesCount}
              onClick={handleNextEp}
              className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 disabled:opacity-30 text-white flex items-center justify-center backdrop-blur-md shadow-lg shadow-rose-600/40 transition-all active:scale-90"
              title="Episode Selanjutnya"
            >
              <ChevronDown className="w-5 h-5 fill-white" />
            </button>

            {/* Episode Drawer Trigger */}
            <button
              type="button"
              onClick={() => setShowEpisodeDrawer(true)}
              className="w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all shadow-lg active:scale-90"
              title="Daftar Semua Episode"
            >
              <ListOrdered className="w-5 h-5 text-amber-400" />
            </button>

            {/* Mute Toggle */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all shadow-lg active:scale-90"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-gray-200" />
              )}
            </button>

            {/* Native Fullscreen */}
            <button
              type="button"
              onClick={toggleNativeFullscreen}
              className="w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all shadow-lg active:scale-90"
            >
              {isNativeFullscreen ? (
                <Minimize2 className="w-4 h-4 text-gray-200" />
              ) : (
                <Maximize2 className="w-4 h-4 text-gray-200" />
              )}
            </button>
          </div>

          {/* Bottom Floating Bar */}
          <div className="absolute bottom-0 inset-x-0 p-3.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-30 flex flex-col gap-2">
            {/* Seek progress bar */}
            <div className="w-full flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-300">
                {Math.floor(currentTime / 60)}:
                {String(Math.floor(currentTime % 60)).padStart(2, "0")}
              </span>
              <div
                className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer relative"
                onClick={(e) => {
                  if (!videoRef.current || !duration) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  videoRef.current.currentTime = pos * duration;
                }}
              >
                <div
                  className="h-full bg-rose-500 rounded-full transition-all"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-gray-400">
                {Math.floor(duration / 60)}:
                {String(Math.floor(duration % 60)).padStart(2, "0")}
              </span>
            </div>

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowEpisodeDrawer(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white backdrop-blur-md transition-colors"
              >
                <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
                <span>Ep {currentEpisodeNum} / {totalEpisodesCount}</span>
              </button>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-black/60 rounded-full p-0.5 border border-white/10">
                {([1, 1.25, 1.5, 2] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                      playbackSpeed === spd
                        ? "bg-rose-500 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Episode Drawer Sheet */}
          {showEpisodeDrawer && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end transition-opacity">
              <div className="bg-[#12121A] border-t border-white/10 rounded-t-3xl max-h-[70%] flex flex-col p-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Daftar Episode</h3>
                    <span className="text-xs text-gray-400 font-mono">
                      (Total {totalEpisodesCount} Ep)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEpisodeDrawer(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-3 grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {Array.from({ length: totalEpisodesCount }, (_, i) => i + 1).map((epNum) => (
                    <button
                      key={epNum}
                      type="button"
                      onClick={() => {
                        setCurrentEpisodeNum(epNum);
                        setShowEpisodeDrawer(false);
                      }}
                      className={`h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                        currentEpisodeNum === epNum
                          ? "bg-gradient-to-tr from-rose-600 to-rose-400 text-white shadow-lg shadow-rose-600/30 scale-105"
                          : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5"
                      }`}
                    >
                      {epNum}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Info Modal */}
          {showInfoModal && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-[#13131C] border border-white/15 rounded-3xl p-5 max-w-sm w-full space-y-3 relative shadow-2xl">
                <button
                  type="button"
                  onClick={() => setShowInfoModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-rose-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {provider.toUpperCase()} Info
                  </span>
                </div>
                <h3 className="text-base font-black text-white">{dramaTitle}</h3>
                <p className="text-xs text-gray-300 leading-relaxed max-h-48 overflow-y-auto">
                  {activeDrama.description || "Serial drama pendek vertikal 9:16 terbaru dengan resolusi Full HD dan subtitle bahasa Indonesia."}
                </p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                  <span>Provider: <b className="text-white uppercase">{provider}</b></span>
                  <span>Total: <b className="text-white">{totalEpisodesCount} Episode</b></span>
                </div>
              </div>
            </div>
          )}

          {/* Auto-Next Episode Overlay */}
          <AutoNextCountdown
            show={showAutoNext}
            nextEpisodeTitle={`Episode ${currentEpisodeNum + 1}`}
            countdownSeconds={5}
            accentColor="rose"
            onPlayNow={() => {
              setShowAutoNext(false);
              handleNextEp();
            }}
            onCancel={() => setShowAutoNext(false)}
          />

          {/* Keyboard Shortcuts Feedback Toast & Iframe Focus Recovery */}
          <VideoShortcutToast
            toast={shortcutToast}
            isIframeFocused={isIframeFocused}
            onRefocus={refocus}
          />
        </div>
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
            <p className="text-xs text-rose-400 font-mono">Menyiapkan Player Short Drama...</p>
          </div>
        </div>
      }
    >
      <DracinWatchContent />
    </Suspense>
  );
}
