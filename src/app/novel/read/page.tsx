"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Settings,
  Play,
  Pause,
  FastForward,
  Type,
  Sun,
  Moon,
  Coffee,
  ListOrdered,
  AlertCircle,
  Loader2,
  Share2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import {
  NovelChapterRead,
  NovelDetail,
} from "@/lib/services/novelService";

function NovelReaderContent() {
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get("url") || "";
  const initialTitle = searchParams.get("title") || "";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chapterData, setChapterData] = useState<NovelChapterRead | null>(null);
  const [novelDetail, setNovelDetail] = useState<NovelDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reading Preferences
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [theme, setTheme] = useState<"dark" | "sepia" | "oled">("dark");
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<0 | 1 | 2 | 3>(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Auto-scroll loop
  useEffect(() => {
    if (autoScrollSpeed === 0) return;

    const interval = setInterval(() => {
      window.scrollBy({
        top: autoScrollSpeed * 1.5,
        behavior: "smooth",
      });
    }, 50);

    return () => clearInterval(interval);
  }, [autoScrollSpeed]);

  // Scroll Progress Calculator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(
          100,
          Math.max(0, Math.round((window.scrollY / totalHeight) * 100))
        );
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch chapter & novel detail
  useEffect(() => {
    if (!rawUrl) return;

    setLoading(true);
    setError(null);
    setAutoScrollSpeed(0);

    const isSeries = rawUrl.includes("/series/");

    if (isSeries) {
      // 1. Fetch novel detail first
      fetch(`/api/novel?action=detail&url=${encodeURIComponent(rawUrl)}`)
        .then((r) => r.json())
        .then(async (data) => {
          if (data.success && data.detail) {
            setNovelDetail(data.detail);
            if (data.detail.chapters && data.detail.chapters.length > 0) {
              const firstCh = data.detail.chapters[0];
              try {
                const chRes = await fetch(
                  `/api/novel?action=read&url=${encodeURIComponent(firstCh.url)}`
                );
                const chData = await chRes.json();
                if (chData.success && chData.chapter) {
                  setChapterData(chData.chapter);
                }
              } catch (e) {
                console.warn("Failed reading first chapter:", e);
              }
            }
          } else {
            setError(data.error || "Gagal memuat detail novel");
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      // 2. Fetch chapter content directly
      fetch(`/api/novel?action=read&url=${encodeURIComponent(rawUrl)}`)
        .then((r) => r.json())
        .then(async (data) => {
          if (data.success && data.chapter) {
            setChapterData(data.chapter);

            // Attempt to derive series slug from chapter URL
            const slug = data.chapter.slug.replace(
              /-(?:chapter|ch|bagian)-\d+.*$/i,
              ""
            );
            if (slug) {
              fetch(
                `/api/novel?action=detail&url=${encodeURIComponent(
                  `https://bacaln.com/series/${slug}/`
                )}`
              )
                .then((sR) => sR.json())
                .then((sD) => {
                  if (sD.success && sD.detail) setNovelDetail(sD.detail);
                })
                .catch(() => {});
            }
          } else {
            setError(data.error || "Gagal memuat konten chapter novel");
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [rawUrl]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Font size classes
  const fontSizes = {
    sm: "text-sm sm:text-base leading-relaxed",
    base: "text-base sm:text-lg leading-loose",
    lg: "text-lg sm:text-xl leading-loose",
    xl: "text-xl sm:text-2xl leading-loose",
  };

  // Theme styling
  const themeStyles = {
    dark: "bg-[#0A0A0F] text-gray-200",
    sepia: "bg-[#F4ECE1] text-[#2D2115]",
    oled: "bg-black text-gray-300",
  };

  const panelStyles = {
    dark: "bg-[#12121A] border-white/10 text-white",
    sepia: "bg-[#E8DCCB] border-[#D4C3AC] text-[#2D2115]",
    oled: "bg-[#111111] border-white/10 text-white",
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${themeStyles[theme]}`}
    >
      {/* Scroll Progress Bar at very top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-[60]">
        <div
          className="h-full bg-emerald-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Floating Reader Toolbar */}
      <div className="sticky top-16 z-40 backdrop-blur-md bg-black/60 border-b border-white/10 py-2.5 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Back button & Breadcrumb */}
          <div className="flex items-center gap-2">
            <Link
              href="/novel"
              className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Katalog</span>
            </Link>

            {novelDetail && (
              <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 font-medium transition-colors"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Chapter ({novelDetail.chapters.length})</span>
              </button>
            )}
          </div>

          {/* Right: Controls (Font size, Theme, Auto-scroll) */}
          <div className="flex items-center gap-2">
            {/* Auto-scroll Speed selector */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg">
              <button
                onClick={() => setAutoScrollSpeed(0)}
                className={`p-1 rounded ${
                  autoScrollSpeed === 0 ? "bg-white/20 text-white font-bold" : "text-gray-400"
                }`}
                title="Jeda scroll"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setAutoScrollSpeed(1)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  autoScrollSpeed === 1 ? "bg-emerald-500 text-black" : "text-gray-300"
                }`}
              >
                1x
              </button>
              <button
                onClick={() => setAutoScrollSpeed(2)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  autoScrollSpeed === 2 ? "bg-emerald-500 text-black" : "text-gray-300"
                }`}
              >
                2x
              </button>
              <button
                onClick={() => setAutoScrollSpeed(3)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  autoScrollSpeed === 3 ? "bg-emerald-500 text-black" : "text-gray-300"
                }`}
              >
                3x
              </button>
            </div>

            {/* Font Size Selector */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg">
              <button
                onClick={() =>
                  setFontSize((s) =>
                    s === "xl" ? "lg" : s === "lg" ? "base" : s === "base" ? "sm" : "sm"
                  )
                }
                className="px-2 py-0.5 text-[11px] font-bold text-gray-300 hover:text-white"
                title="Perkecil Font"
              >
                A-
              </button>
              <button
                onClick={() =>
                  setFontSize((s) =>
                    s === "sm" ? "base" : s === "base" ? "lg" : s === "lg" ? "xl" : "xl"
                  )
                }
                className="px-2 py-0.5 text-[11px] font-bold text-gray-300 hover:text-white"
                title="Perbesar Font"
              >
                A+
              </button>
            </div>

            {/* Theme switcher */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg">
              <button
                onClick={() => setTheme("dark")}
                className={`p-1 rounded ${
                  theme === "dark" ? "bg-white/20 text-white" : "text-gray-400"
                }`}
                title="Mode Gelap"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("sepia")}
                className={`p-1 rounded ${
                  theme === "sepia" ? "bg-amber-700/40 text-amber-900" : "text-gray-400"
                }`}
                title="Mode Sepia"
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme("oled")}
                className={`p-1 rounded ${
                  theme === "oled" ? "bg-white/20 text-white" : "text-gray-400"
                }`}
                title="Mode OLED Hitam"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Salin tautan"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            {copied && (
              <span className="text-[10px] text-emerald-400 font-bold">Tersalin!</span>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4 animate-pulse my-8">
            <div className="h-8 bg-white/10 rounded-xl w-3/4 mx-auto" />
            <div className="h-4 bg-white/5 rounded-lg w-1/3 mx-auto" />
            <div className="space-y-3 pt-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-4 bg-white/5 rounded-lg w-full" />
              ))}
            </div>
          </div>
        ) : error || !chapterData ? (
          <div className="p-8 rounded-2xl bg-red-950/20 border border-red-500/30 text-center my-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Gagal Membaca Chapter</h3>
            <p className="text-xs text-gray-300 mb-4">{error || "Data tidak ditemukan"}</p>
            <Link
              href="/novel"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black font-semibold text-xs hover:bg-emerald-400 transition-colors"
            >
              Kembali ke Katalog Novel
            </Link>
          </div>
        ) : (
          <article className="space-y-6">
            {/* Header info */}
            <div className="text-center space-y-2 border-b border-white/10 pb-6">
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                {chapterData.title || initialTitle}
              </h1>
              <p className="text-xs opacity-75">
                {chapterData.totalParagraphs} Paragraf • Terjemahan Bahasa Indonesia
              </p>
            </div>

            {/* Chapters Drawer / Modal if opened */}
            {isDrawerOpen && novelDetail && (
              <div
                className={`p-4 rounded-2xl border shadow-xl space-y-3 transition-all ${panelStyles[theme]}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {novelDetail.thumbnail && (
                      <img
                        src={novelDetail.thumbnail}
                        alt={novelDetail.title}
                        className="w-10 h-14 object-cover rounded-lg border border-white/10 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold flex items-center gap-2 truncate">
                        <ListOrdered className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate">{novelDetail.title}</span>
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {novelDetail.totalChapters} Chapter Tersedia
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 shrink-0 ml-2"
                  >
                    Tutup
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {novelDetail.chapters.map((ch, idx) => {
                    const isCurrent =
                      ch.url === chapterData.url ||
                      (rawUrl && ch.url.includes(rawUrl.replace(/https?:\/\/[^\/]+/, "")));

                    return (
                      <Link
                        key={`${ch.url}-${idx}`}
                        href={`/novel/read?url=${encodeURIComponent(
                          ch.url
                        )}&title=${encodeURIComponent(ch.title)}`}
                        onClick={() => setIsDrawerOpen(false)}
                        className={`p-2 rounded-xl text-xs font-medium truncate border transition-colors ${
                          isCurrent
                            ? "bg-emerald-500 text-black border-emerald-400 font-bold"
                            : "bg-white/5 hover:bg-white/10 border-white/5"
                        }`}
                      >
                        {ch.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top Navigation */}
            <div className="flex items-center justify-between pt-2">
              {chapterData.navigation.prev ? (
                <Link
                  href={`/novel/read?url=${encodeURIComponent(
                    chapterData.navigation.prev
                  )}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev Chapter</span>
                </Link>
              ) : (
                <div />
              )}

              {chapterData.navigation.next ? (
                <Link
                  href={`/novel/read?url=${encodeURIComponent(
                    chapterData.navigation.next
                  )}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors"
                >
                  <span>Next Chapter</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <div />
              )}
            </div>

            {/* Novel Content Paragraphs */}
            <div className={`space-y-4 pt-4 ${fontSizes[fontSize]}`}>
              {chapterData.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-justify font-serif tracking-normal">
                  {p}
                </p>
              ))}
            </div>

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-8">
              {chapterData.navigation.prev ? (
                <Link
                  href={`/novel/read?url=${encodeURIComponent(
                    chapterData.navigation.prev
                  )}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Chapter Sebelumnya</span>
                </Link>
              ) : (
                <div />
              )}

              {chapterData.navigation.next ? (
                <Link
                  href={`/novel/read?url=${encodeURIComponent(
                    chapterData.navigation.next
                  )}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors"
                >
                  <span>Chapter Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function NovelReadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070A] flex items-center justify-center text-emerald-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <NovelReaderContent />
    </Suspense>
  );
}
