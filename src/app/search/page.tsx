"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import {
  Search,
  X,
  Tv,
  Video,
  Clapperboard,
  BookOpen,
  Film,
  BookMarked,
  Sparkles,
  Play,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { UniversalSearchItem } from "../api/search/route";

const POPULAR_QUERIES = [
  "Solo Leveling",
  "Jujutsu Kaisen",
  "Magic Emperor",
  "Keluar dari Tim",
  "Doctor X",
  "One Piece",
  "Billionaire",
  "Queen of Tears",
  "Demon Slayer",
];

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [inputVal, setInputVal] = useState(queryParam);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [searchData, setSearchData] = useState<{
    query: string;
    total: number;
    counts: {
      all: number;
      anime: number;
      dracin: number;
      drakor: number;
      manga: number;
      film: number;
      novel: number;
    };
    results: {
      anime: UniversalSearchItem[];
      dracin: UniversalSearchItem[];
      drakor: UniversalSearchItem[];
      manga: UniversalSearchItem[];
      film: UniversalSearchItem[];
      novel: UniversalSearchItem[];
    };
  }>({
    query: "",
    total: 0,
    counts: { all: 0, anime: 0, dracin: 0, drakor: 0, manga: 0, film: 0, novel: 0 },
    results: { anime: [], dracin: [], drakor: [], manga: [], film: [], novel: [] },
  });

  // Sync inputVal when URL query changes
  useEffect(() => {
    setInputVal(queryParam);
    if (!queryParam.trim()) {
      setSearchData({
        query: "",
        total: 0,
        counts: { all: 0, anime: 0, dracin: 0, drakor: 0, manga: 0, film: 0, novel: 0 },
        results: { anime: [], dracin: [], drakor: [], manga: [], film: [], novel: [] },
      });
      return;
    }

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(queryParam)}&limit=18`)
      .then((res) => res.json())
      .then((data) => {
        setSearchData(data);
      })
      .catch((err) => {
        console.error("Search fetch error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [queryParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleTagClick = (tag: string) => {
    setInputVal(tag);
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  // Provider badge color helper
  const getProviderBadgeStyle = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "freereels":
        return "bg-rose-500/90 text-white";
      case "pinedrama":
        return "bg-amber-500 text-black";
      case "melolo":
        return "bg-cyan-500 text-black";
      case "reelshort":
        return "bg-rose-600 text-white";
      case "netshort":
        return "bg-purple-600 text-white";
      case "samehadaku":
        return "bg-amber-400 text-black";
      case "animesail":
        return "bg-sky-500 text-black";
      case "animexin":
        return "bg-cyan-600 text-white";
      case "donghuafilm":
        return "bg-indigo-600 text-white";
      case "drakorid":
        return "bg-blue-600 text-white";
      case "oppadrama":
        return "bg-fuchsia-600 text-white";
      case "vidbox":
        return "bg-red-600 text-white";
      case "bacaln":
        return "bg-emerald-600 text-white";
      case "komik":
        return "bg-emerald-500 text-black";
      default:
        return "bg-white/20 text-white";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "anime":
        return <Tv className="w-6 h-6 text-amber-400" />;
      case "manga":
        return <BookOpen className="w-6 h-6 text-emerald-400" />;
      case "novel":
        return <BookMarked className="w-6 h-6 text-amber-300" />;
      case "dracin":
        return <Video className="w-6 h-6 text-purple-400" />;
      case "drakor":
        return <Clapperboard className="w-6 h-6 text-blue-400" />;
      case "film":
        return <Film className="w-6 h-6 text-rose-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-gray-400" />;
    }
  };

  const renderCard = (item: UniversalSearchItem) => {
    return (
      <Link
        key={`${item.provider}-${item.id}`}
        href={item.href}
        className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-amber-400/40 transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-950/20"
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#111118]">
          {item.cover ? (
            <img
              src={item.cover}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fb = parent.querySelector(".search-poster-fallback");
                  if (fb) (fb as HTMLElement).style.display = "flex";
                }
              }}
            />
          ) : null}

          {/* Stylized Poster Fallback for missing/failed images */}
          <div
            className={`search-poster-fallback absolute inset-0 ${
              item.cover ? "hidden" : "flex"
            } flex-col items-center justify-between p-3.5 bg-gradient-to-b from-[#181824] via-[#101018] to-[#0A0A10] text-center`}
          >
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mt-3 shadow-inner">
              {getCategoryIcon(item.category)}
            </div>
            <p className="text-[11px] font-bold text-gray-200 line-clamp-3 leading-snug px-1">
              {item.title}
            </p>
            <span className="text-[9px] uppercase tracking-wider text-amber-400/80 font-bold mb-1">
              {item.provider}
            </span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          {/* Hover Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-xl shadow-amber-400/50">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black ml-0.5" />
            </div>
          </div>

          {/* Provider Badge (Top Left) */}
          <div className="absolute top-2 left-2 z-10">
            <span
              className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm ${getProviderBadgeStyle(
                item.provider
              )}`}
            >
              {item.provider}
            </span>
          </div>

          {/* Status/Badge (Top Right) */}
          {item.badge && (
            <div className="absolute top-2 right-2 z-10">
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/70 text-gray-200 border border-white/10 backdrop-blur-sm truncate max-w-[80px]">
                {item.badge}
              </span>
            </div>
          )}

          {/* Bottom Title & Subtext */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 z-10">
            <p className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
              {item.title}
            </p>
            {item.subText && (
              <p className="text-[10px] text-gray-400 mt-1 truncate">
                {item.subText}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  };

  const renderSection = (
    title: string,
    categoryKey: string,
    items: UniversalSearchItem[],
    icon: React.ReactNode,
    colorClass: string,
    badgeBg: string,
    badgeBorder: string
  ) => {
    if (activeCategory !== "all" && activeCategory !== categoryKey) return null;
    if (items.length === 0) return null;

    return (
      <section
        key={categoryKey}
        id={categoryKey}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4 w-full scroll-mt-20"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${badgeBg} ${badgeBorder}`}
            >
              {icon}
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{title}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold border ${badgeBg} ${badgeBorder} ${colorClass}`}
              >
                {items.length} Judul
              </span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {items.map((item) => renderCard(item))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 pb-16">
        {/* Universal Search Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 w-full">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center gap-2 bg-[#12121A] border border-white/10 focus-within:border-amber-400/60 rounded-2xl p-2 shadow-2xl transition-all"
          >
            <Search className="w-5 h-5 text-amber-400 ml-2 shrink-0" />
            <input
              type="text"
              placeholder="Cari anime, drama pendek, drakor, manga, film, atau novel..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm sm:text-base px-2"
              autoFocus
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => setInputVal("")}
                className="text-gray-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs sm:text-sm shadow-md shadow-amber-400/20 transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Cari</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular Tag Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 pb-1">
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 shrink-0 mr-1">
              <TrendingUp className="w-3.5 h-3.5" /> Populer:
            </span>
            {POPULAR_QUERIES.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors border ${
                  queryParam.toLowerCase() === tag.toLowerCase()
                    ? "bg-amber-400 text-black border-amber-400 font-bold"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/5 hover:border-white/10"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Category Filter Pills (When query is active) */}
          {queryParam.trim() && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-4 pb-2 border-t border-white/5 mt-3 text-xs">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeCategory === "all"
                    ? "bg-amber-400 text-black shadow-md shadow-amber-400/20 scale-105"
                    : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Semua ({searchData.total})
              </button>

              {searchData.counts.anime > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategory("anime")}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === "anime"
                      ? "bg-amber-400 text-black shadow-md shadow-amber-400/20 scale-105"
                      : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                  }`}
                >
                  <Tv className="w-3.5 h-3.5 text-amber-400" />
                  Anime ({searchData.counts.anime})
                </button>
              )}

              {searchData.counts.dracin > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategory("dracin")}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === "dracin"
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105"
                      : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-rose-400" />
                  Drama Pendek ({searchData.counts.dracin})
                </button>
              )}

              {searchData.counts.drakor > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategory("drakor")}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === "drakor"
                      ? "bg-blue-500 text-white shadow-md shadow-blue-500/20 scale-105"
                      : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                  }`}
                >
                  <Clapperboard className="w-3.5 h-3.5 text-blue-400" />
                  Drakor ({searchData.counts.drakor})
                </button>
              )}

              {searchData.counts.manga > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategory("manga")}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === "manga"
                      ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 scale-105"
                      : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  Manga ({searchData.counts.manga})
                </button>
              )}

              {searchData.counts.film > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategory("film")}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === "film"
                      ? "bg-red-500 text-white shadow-md shadow-red-500/20 scale-105"
                      : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                  }`}
                >
                  <Film className="w-3.5 h-3.5 text-red-400" />
                  Film ({searchData.counts.film})
                </button>
              )}

              {searchData.counts.novel > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategory("novel")}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === "novel"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105"
                      : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5 text-emerald-400" />
                  Novel ({searchData.counts.novel})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content State Handling */}
        {loading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              <p className="text-sm text-gray-400 font-medium">
                Mencari &quot;{queryParam}&quot; di seluruh provider anime, dracin, drakor, manga, film, dan novel...
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl sm:rounded-2xl aspect-[2/3] bg-[#12121A] border border-white/5 animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : !queryParam.trim() ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              Pencarian Universal NexNime
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto mb-6">
              Ketik judul di atas untuk mencari secara serentak di semua kategori: Anime, Drama Pendek 9:16, Drakor, Manga, Film Movie, dan Novel.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
              {POPULAR_QUERIES.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="text-xs px-3 py-1.5 rounded-full bg-[#12121A] hover:bg-amber-400/10 border border-white/10 hover:border-amber-400/40 text-gray-300 hover:text-amber-300 transition-all font-medium"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : searchData.total === 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Tidak Ada Hasil Ditemukan
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto mb-6">
              Tidak ditemukan konten untuk kata kunci &quot;{queryParam}&quot;. Coba periksa ejaan atau cari kata kunci lain di bawah.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
              {POPULAR_QUERIES.slice(0, 5).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-amber-300 border border-white/10 font-medium"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Anime & Donghua Section */}
            {renderSection(
              "Anime & Donghua",
              "anime",
              searchData.results.anime,
              <Tv className="w-5 h-5 text-amber-400" />,
              "text-amber-300",
              "bg-amber-500/10",
              "border-amber-500/20"
            )}

            {/* 2. Short Drama / Dracin Section */}
            {renderSection(
              "Drama Pendek (9:16 Short Drama)",
              "dracin",
              searchData.results.dracin,
              <Video className="w-5 h-5 text-rose-500" />,
              "text-rose-300",
              "bg-rose-500/10",
              "border-rose-500/20"
            )}

            {/* 3. Drakor Section */}
            {renderSection(
              "Drama Korea & Asia (Drakor)",
              "drakor",
              searchData.results.drakor,
              <Clapperboard className="w-5 h-5 text-blue-400" />,
              "text-blue-300",
              "bg-blue-500/10",
              "border-blue-500/20"
            )}

            {/* 4. Manga Section */}
            {renderSection(
              "Manga & Manhwa",
              "manga",
              searchData.results.manga,
              <BookOpen className="w-5 h-5 text-emerald-400" />,
              "text-emerald-300",
              "bg-emerald-500/10",
              "border-emerald-500/20"
            )}

            {/* 5. Film & Movie Section */}
            {renderSection(
              "Film & Movie",
              "film",
              searchData.results.film,
              <Film className="w-5 h-5 text-red-500" />,
              "text-red-300",
              "bg-red-500/10",
              "border-red-500/20"
            )}

            {/* 6. Light Novel Section */}
            {renderSection(
              "Light Novel",
              "novel",
              searchData.results.novel,
              <BookMarked className="w-5 h-5 text-emerald-400" />,
              "text-emerald-300",
              "bg-emerald-500/10",
              "border-emerald-500/20"
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070A] text-white flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
