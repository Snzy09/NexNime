"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  ArrowUp,
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  ExternalLink,
  X,
  Loader2,
  BookOpen,
  List,
} from "lucide-react";
import { CREATOR, SALURAN } from "@/lib/services/mangaTypes";
import BookmarkButton from "@/components/BookmarkButton";

export default function MangaReaderPage({ params }: { params?: { chapterId?: string } }) {
  const routeParams = useParams();
  const activeChapterId = (routeParams?.chapterId as string) || params?.chapterId || "";

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<1 | 2 | 3>(1);
  const [useDataSaver, setUseDataSaver] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [chapterData, setChapterData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Manga reader layout mode: continuous webtoon vs paged flip
  const [readMode, setReadMode] = useState<"webtoon" | "paged">("webtoon");
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  // Restore saved read mode
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nexnime_manga_read_mode");
      if (saved === "webtoon" || saved === "paged") {
        setReadMode(saved);
      }
    } catch {}
  }, []);

  const handleToggleReadMode = (mode: "webtoon" | "paged") => {
    setReadMode(mode);
    try {
      localStorage.setItem("nexnime_manga_read_mode", mode);
    } catch {}
  };

  // Adjacent chapters & dropdown state
  const [allChapters, setAllChapters] = useState<any[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [chapterSelectorOpen, setChapterSelectorOpen] = useState(false);

  // Download modal state
  const [dlModalOpen, setDlModalOpen] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [dlQuality, setDlQuality] = useState<"hq" | "dataSaver">("hq");

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<any>(null);
  const isUserTouchingRef = useRef<boolean>(false);

  // Fetch chapter pages
  useEffect(() => {
    if (!activeChapterId) return;
    setLoading(true);
    fetch(`/api/manga?action=pages&chapterId=${encodeURIComponent(activeChapterId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.pages) {
          setChapterData(d.pages);
        } else {
          setChapterData(null);
        }
      })
      .catch(() => {
        setChapterData(null);
      })
      .finally(() => setLoading(false));
  }, [activeChapterId]);

  // Fetch full chapter feed once mangaId is available for Prev/Next navigation
  useEffect(() => {
    if (!chapterData?.mangaId) return;
    setChaptersLoading(true);
    fetch(`/api/manga?action=detail&id=${encodeURIComponent(chapterData.mangaId)}&lang=all`)
      .then((r) => r.json())
      .then((d) => {
        if (d.detail?.chapters) {
          setAllChapters(d.detail.chapters);
        }
      })
      .catch(() => {})
      .finally(() => setChaptersLoading(false));
  }, [chapterData?.mangaId]);

  // Compute prev/next chapters
  // Chapters in allChapters are sorted descending (latest chapter first, e.g. 50, 49, 48...)
  const currentChapterIdx = allChapters.findIndex(
    (c) => c.id === activeChapterId || c.chapter === chapterData?.chapter
  );
  const nextChapter =
    currentChapterIdx > 0 ? allChapters[currentChapterIdx - 1] : null; // Higher chapter number
  const prevChapter =
    currentChapterIdx >= 0 && currentChapterIdx < allChapters.length - 1
      ? allChapters[currentChapterIdx + 1]
      : null; // Lower chapter number

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll loop
  useEffect(() => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);

    if (isAutoScrolling) {
      const step = scrollSpeed === 1 ? 2 : scrollSpeed === 2 ? 4 : 7;
      scrollIntervalRef.current = setInterval(() => {
        if (!isUserTouchingRef.current) {
          window.scrollBy({ top: step, behavior: "smooth" });
          if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
            setIsAutoScrolling(false);
          }
        }
      }, 50);
    }

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isAutoScrolling, scrollSpeed]);

  // Mobile Touch Pause
  useEffect(() => {
    const onTouchStart = () => {
      isUserTouchingRef.current = true;
    };
    const onTouchEnd = () => {
      setTimeout(() => {
        isUserTouchingRef.current = false;
      }, 300);
    };

    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(220, prev + 15));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(70, prev - 15));
  const handleResetZoom = () => setZoomLevel(100);

  const images = chapterData
    ? useDataSaver
      ? chapterData.images.dataSaver
      : chapterData.images.hq
    : [];

  // Reset page index when chapter changes
  useEffect(() => {
    setCurrentPageIndex(0);
  }, [activeChapterId]);

  // Keyboard navigation for Paged mode
  useEffect(() => {
    if (readMode !== "paged") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        setCurrentPageIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        setCurrentPageIndex((prev) =>
          images.length > 0 ? Math.min(images.length - 1, prev + 1) : 0
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readMode, images.length]);

  const effectiveProgress =
    readMode === "paged"
      ? images.length > 1
        ? (currentPageIndex / (images.length - 1)) * 100
        : 100
      : progress;

  const handleCopyAll = (urls: string[]) => {
    if (!urls || urls.length === 0) return;
    navigator.clipboard.writeText(urls.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col relative selection:bg-emerald-400 selection:text-black">
      {/* Top Floating Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-150"
          style={{ width: `${effectiveProgress}%` }}
        />
      </div>

      {/* Floating Top Navigation Header */}
      <header
        className={`fixed top-1 left-0 right-0 z-40 transition-transform duration-300 ${
          showControls ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 py-2">
          <div className="glass-nav rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xl border border-white/10 gap-2">
            {/* Left: Back & Manga Title */}
            <div className="flex items-center gap-2.5 truncate">
              <Link
                href={chapterData?.mangaId ? `/manga/${chapterData.mangaId}` : "/manga"}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white shrink-0"
                title="Kembali ke Detail Manga"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="truncate">
                <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[160px] sm:max-w-xs">
                  {chapterData?.mangaTitle || "Manga"}
                </h1>
                <p className="text-[10px] text-emerald-400 font-semibold truncate">
                  Chapter {chapterData?.chapter || "?"}
                  {chapterData?.title ? ` - ${chapterData.title}` : ""}
                </p>
              </div>
            </div>

            {/* Middle: Prev / Next Chapter Buttons */}
            <div className="hidden sm:flex items-center gap-1 bg-[#14141E] p-1 rounded-xl border border-white/5 text-xs font-semibold">
              {prevChapter ? (
                <Link
                  href={`/manga/read/${prevChapter.id}`}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-1"
                  title={`Ke Chapter ${prevChapter.chapter}`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Ch. {prevChapter.chapter}</span>
                </Link>
              ) : (
                <span className="px-2 py-1 text-gray-600 text-xs">Awal</span>
              )}

              {/* Chapter Dropdown Picker */}
              {allChapters.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setChapterSelectorOpen(!chapterSelectorOpen)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 flex items-center gap-1"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Pilih Ch ({allChapters.length})</span>
                  </button>

                  {chapterSelectorOpen && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 max-h-64 overflow-y-auto bg-[#161622] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                      {allChapters.map((c) => (
                        <Link
                          key={c.id}
                          href={`/manga/read/${c.id}`}
                          onClick={() => setChapterSelectorOpen(false)}
                          className={`block px-2.5 py-1.5 rounded-lg text-xs truncate transition-colors ${
                            c.id === activeChapterId
                              ? "bg-emerald-400 text-black font-bold"
                              : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          Ch. {c.chapter} {c.title ? `- ${c.title}` : ""}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {nextChapter ? (
                <Link
                  href={`/manga/read/${nextChapter.id}`}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-1"
                  title={`Ke Chapter ${nextChapter.chapter}`}
                >
                  <span>Ch. {nextChapter.chapter}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="px-2 py-1 text-gray-600 text-xs">Akhir</span>
              )}
            </div>

            {/* Right: Mode Switcher, Bookmark, Quality, Download & Hide controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Mode Switcher: Webtoon vs Paged */}
              <div className="flex items-center bg-[#14141E] p-0.5 rounded-xl border border-white/5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => handleToggleReadMode("webtoon")}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    readMode === "webtoon"
                      ? "bg-emerald-400 text-black font-extrabold shadow-sm"
                      : "text-gray-300 hover:text-white"
                  }`}
                  title="Mode Webtoon (Scroll Vertikal)"
                >
                  ↕ Webtoon
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleReadMode("paged")}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    readMode === "paged"
                      ? "bg-emerald-400 text-black font-extrabold shadow-sm"
                      : "text-gray-300 hover:text-white"
                  }`}
                  title="Mode Paged (Flip / Per Halaman)"
                >
                  📖 Paged
                </button>
              </div>

              {chapterData?.mangaId && (
                <BookmarkButton
                  item={{
                    id: `manga-${chapterData.mangaId}`,
                    title: chapterData.mangaTitle || "Manga",
                    category: "manga",
                    poster: "",
                    url: `/manga/${chapterData.mangaId}`,
                    totalEpisodes: chapterData.chapter ? `Ch. ${chapterData.chapter}` : undefined,
                  }}
                  accentColor="emerald"
                />
              )}

              <button
                onClick={() => setUseDataSaver(!useDataSaver)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                  useDataSaver
                    ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                }`}
                title="Ganti Kualitas Gambar"
              >
                {useDataSaver ? "Data Saver" : "HQ"}
              </button>

              <button
                onClick={() => setDlModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                title="Download Chapter"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>

              <button
                onClick={() => setShowControls(false)}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs"
              >
                Sembunyikan
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Center Manga Webtoon Image Strip / Paged View */}
      <main
        ref={containerRef}
        onClick={() => {
          if (readMode === "webtoon") {
            setShowControls(!showControls);
          }
        }}
        className="flex-1 flex flex-col items-center justify-center pt-16 pb-28 px-2 sm:px-4 cursor-pointer select-none"
      >
        {loading ? (
          <div className="w-full max-w-2xl space-y-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] w-full bg-white/5 rounded-xl border border-white/5 flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-white/10" />
                <div className="h-4 w-32 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : !chapterData || images.length === 0 ? (
          <div className="py-24 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-white/5 text-emerald-400 flex items-center justify-center mx-auto">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Halaman Tidak Ditemukan</h3>
            <p className="text-xs text-gray-400">
              Chapter ini tidak memiliki gambar aktif di server MangaDex, atau merupakan chapter berlisensi eksternal.
            </p>
            <Link
              href={chapterData?.mangaId ? `/manga/${chapterData.mangaId}` : "/manga"}
              className="inline-block px-5 py-2 rounded-full bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors"
            >
              Kembali ke Daftar Chapter
            </Link>
          </div>
        ) : readMode === "webtoon" ? (
          <div
            className="w-full max-w-2xl transition-transform duration-200 flex flex-col items-center"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top center",
            }}
          >
            {images.map((img: any, index: number) => {
              const imgSrc = img.url?.startsWith("/api/manga")
                ? img.url
                : `/api/manga?action=image&url=${encodeURIComponent(img.url)}`;
              return (
                <div key={img.page || index} className="w-full relative bg-[#0F0F14] border-b border-black/30">
                  <img
                    src={imgSrc}
                    alt={`Halaman ${img.page}`}
                    className="w-full h-auto object-contain block mx-auto"
                    loading={index < 3 ? "eager" : "lazy"}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-gray-400 font-mono pointer-events-none">
                    {img.page} / {images.length}
                  </div>
                </div>
              );
            })}

            {/* End of Chapter Navigation Card */}
            <div className="w-full mt-8 p-6 rounded-2xl bg-[#12121A] border border-white/10 text-center space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-white">
                Kamu telah menyelesaikan Chapter {chapterData.chapter}!
              </h3>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {nextChapter && (
                  <Link
                    href={`/manga/read/${nextChapter.id}`}
                    className="px-6 py-2.5 rounded-full font-bold text-xs text-black bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105 flex items-center gap-1.5"
                  >
                    <span>Lanjut ke Chapter {nextChapter.chapter}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}

                <Link
                  href={chapterData.mangaId ? `/manga/${chapterData.mangaId}` : "/manga"}
                  className="px-5 py-2.5 rounded-full font-semibold text-xs text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Daftar Chapter</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Paged Mode (Single Page Flip/Tap View) */
          <div className="w-full max-w-3xl flex flex-col items-center">
            <div
              className="relative w-full min-h-[60vh] max-h-[82vh] flex items-center justify-center bg-[#0F0F14] rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "center center",
              }}
            >
              {images[currentPageIndex] && (
                <img
                  src={
                    images[currentPageIndex].url?.startsWith("/api/manga")
                      ? images[currentPageIndex].url
                      : `/api/manga?action=image&url=${encodeURIComponent(images[currentPageIndex].url)}`
                  }
                  alt={`Halaman ${currentPageIndex + 1}`}
                  className="max-h-[82vh] w-auto max-w-full object-contain mx-auto select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Tap Zones: Left 30% (Prev), Middle 40% (Toggle controls), Right 30% (Next) */}
              <div className="absolute inset-0 flex z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPageIndex((prev) => Math.max(0, prev - 1));
                  }}
                  className="w-[30%] h-full cursor-w-resize flex items-center justify-start pl-3 text-transparent hover:text-white/60 transition-colors"
                  title="Halaman Sebelumnya (←)"
                >
                  <ChevronLeft className="w-8 h-8 drop-shadow-md" />
                </button>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowControls((prev) => !prev);
                  }}
                  className="w-[40%] h-full cursor-pointer"
                  title="Tampilkan / Sembunyikan Kontrol"
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPageIndex((prev) => Math.min(images.length - 1, prev + 1));
                  }}
                  className="w-[30%] h-full cursor-e-resize flex items-center justify-end pr-3 text-transparent hover:text-white/60 transition-colors"
                  title="Halaman Berikutnya (→)"
                >
                  <ChevronRight className="w-8 h-8 drop-shadow-md" />
                </button>
              </div>

              {/* Page Indicator Badge */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono text-emerald-300 pointer-events-none z-20">
                Hal. {currentPageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Page Navigation Strip */}
            <div className="w-full mt-4 flex flex-wrap items-center justify-between gap-3 bg-[#13131D] border border-white/10 p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPageIndex((prev) => Math.max(0, prev - 1));
                  }}
                  disabled={currentPageIndex === 0}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-bold text-gray-200 flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {currentPageIndex + 1} / {images.length}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPageIndex((prev) => Math.min(images.length - 1, prev + 1));
                  }}
                  disabled={currentPageIndex >= images.length - 1}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-bold text-gray-200 flex items-center gap-1 transition-colors"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 max-w-xs mx-2 min-w-[140px]">
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, images.length - 1)}
                  value={currentPageIndex}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {currentPageIndex >= images.length - 1 && nextChapter && (
                <Link
                  href={`/manga/read/${nextChapter.id}`}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black text-xs font-bold flex items-center gap-1 transition-transform hover:scale-105"
                >
                  <span>Lanjut Ch. {nextChapter.chapter}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Reader Toolbar (Auto-Scroll, Prev/Next & Zoom Controls) */}
      <div
        className={`fixed bottom-4 left-0 right-0 z-40 transition-transform duration-300 ${
          showControls ? "translate-y-0" : "translate-y-24"
        }`}
      >
        <div className="max-w-lg mx-auto px-4">
          <div className="glass-nav rounded-2xl p-3 shadow-2xl border border-white/10 flex flex-col gap-2">
            {/* Top Toolbar Row: Auto-Scroll or Page Stepper */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              {readMode === "webtoon" ? (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                        isAutoScrolling
                          ? "bg-amber-400 text-black shadow-amber-400/20"
                          : "bg-emerald-500 text-black shadow-emerald-500/20 hover:bg-emerald-400"
                      }`}
                    >
                      {isAutoScrolling ? (
                        <Pause className="w-3.5 h-3.5 fill-black" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-black" />
                      )}
                      <span>{isAutoScrolling ? "Jeda" : "Auto Scroll"}</span>
                    </button>

                    {/* Speed Presets: 1x, 2x, 3x */}
                    <div className="flex items-center bg-[#151520] p-0.5 rounded-lg border border-white/5 text-[11px] font-bold">
                      {([1, 2, 3] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setScrollSpeed(s);
                            setIsAutoScrolling(true);
                          }}
                          className={`px-2.5 py-1 rounded transition-colors ${
                            scrollSpeed === s
                              ? "bg-amber-400 text-black font-extrabold"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prev / Next mobile shortcuts */}
                  <div className="flex items-center gap-1">
                    {prevChapter && (
                      <Link
                        href={`/manga/read/${prevChapter.id}`}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                        title="Chapter Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Link>
                    )}
                    {nextChapter && (
                      <Link
                        href={`/manga/read/${nextChapter.id}`}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                        title="Chapter Selanjutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 ml-1"
                      title="Kembali ke atas"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentPageIndex === 0}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-bold text-gray-200 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                    <span className="font-mono text-xs font-bold text-emerald-400 px-1">
                      {currentPageIndex + 1} / {images.length}
                    </span>
                    <button
                      onClick={() => setCurrentPageIndex((prev) => Math.min(images.length - 1, prev + 1))}
                      disabled={currentPageIndex >= images.length - 1}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-bold text-gray-200 flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {prevChapter && (
                      <Link
                        href={`/manga/read/${prevChapter.id}`}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                        title="Chapter Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Link>
                    )}
                    {nextChapter && (
                      <Link
                        href={`/manga/read/${nextChapter.id}`}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                        title="Chapter Selanjutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Toolbar Row: Zoom Controls (Mobile & Desktop) */}
            <div className="flex items-center justify-between text-xs text-gray-300 pt-1">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-400 mr-1 font-semibold">ZOOM:</span>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <span className="w-12 text-center font-mono font-bold text-amber-300">
                  {zoomLevel}%
                </span>

                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <button
                  onClick={handleResetZoom}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-gray-400 hover:text-white ml-1"
                >
                  Reset
                </button>
              </div>

              {/* Progress percentage */}
              <div className="font-mono text-[11px] text-gray-400">
                {Math.round(effectiveProgress)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reader Download (DL) Modal */}
      {dlModalOpen && chapterData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#12121A] border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download Chapter {chapterData.chapter}</span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  {chapterData.mangaTitle || "Manga"} • Total {chapterData.totalPages} Halaman
                </p>
              </div>
              <button
                onClick={() => setDlModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Watermark Notice */}
              <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 flex items-center justify-between">
                <span>
                  Creator: <strong className="font-bold">{CREATOR}</strong>
                </span>
                <a
                  href={SALURAN}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-[11px] text-amber-400 hover:text-amber-200"
                >
                  Saluran WhatsApp
                </a>
              </div>

              {/* Quality Toggle & Copy All */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDlQuality("hq")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      dlQuality === "hq"
                        ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    HQ ({chapterData.images.hq.length} Halaman)
                  </button>
                  <button
                    onClick={() => setDlQuality("dataSaver")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      dlQuality === "dataSaver"
                        ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    Data Saver ({chapterData.images.dataSaver.length} Halaman)
                  </button>
                </div>

                <button
                  onClick={() =>
                    handleCopyAll(
                      (dlQuality === "hq"
                        ? chapterData.images.hq
                        : chapterData.images.dataSaver
                      ).map((i: any) => i.url)
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? "Tersalin!" : "Salin Semua Link"}</span>
                </button>
              </div>

              {/* Direct Image Links List */}
              <div className="space-y-2">
                {(dlQuality === "hq"
                  ? chapterData.images.hq
                  : chapterData.images.dataSaver
                ).map((img: any) => (
                  <div
                    key={img.page}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs hover:border-white/10"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="font-mono text-gray-400 font-bold shrink-0">
                        Halaman {img.page}
                      </span>
                      <span className="text-gray-500 truncate text-[11px]">{img.url}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(img.url);
                        }}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                        title="Salin Link"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-emerald-400"
                        title="Buka Gambar"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
