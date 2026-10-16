"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import MangaSpotlightSection from "@/components/MangaSpotlightSection";
import Footer from "@/components/Footer";
import Link from "next/link";
import { BookOpen, Star, Sparkles, BookMarked } from "lucide-react";
import MangaSpotlightSkeleton from "@/components/skeletons/MangaSpotlightSkeleton";
import CatalogGridSkeleton from "@/components/skeletons/CatalogGridSkeleton";
import NovelSection from "@/components/NovelSection";
import { MangaItem } from "@/lib/services/mangaTypes";
import { NovelCard } from "@/lib/services/novelService";

function MangaCatalog() {
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get("q") || "";
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "Manhwa" | "Manhua" | "Manga">("all");
  const [mangaList, setMangaList] = useState<MangaItem[]>([]);
  const [novelList, setNovelList] = useState<NovelCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNovel, setLoadingNovel] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQ);

  useEffect(() => {
    if (initialQ && initialQ !== searchQuery) {
      setSearchQuery(initialQ);
    }
  }, [initialQ]);

  useEffect(() => {
    setLoading(true);
    const url = searchQuery.trim()
      ? `/api/manga?action=search&q=${encodeURIComponent(searchQuery.trim())}`
      : `/api/manga?action=popular`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d.items && Array.isArray(d.items)) {
          setMangaList(d.items);
        }
      })
      .catch((e) => console.error("Manga page fetch error:", e))
      .finally(() => setLoading(false));
  }, [searchQuery]);

  useEffect(() => {
    setLoadingNovel(true);
    fetch("/api/novel?action=latest&page=1")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && Array.isArray(d.items)) {
          setNovelList(d.items);
        }
      })
      .catch((e) => console.error("Novel fetch error:", e))
      .finally(() => setLoadingNovel(false));
  }, []);

  const filteredManga = mangaList.filter((m) => {
    if (filterType === "all") return true;
    return m.type === filterType;
  });

  return (
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col selection:bg-amber-400 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 space-y-6">
        {/* Banner Top - Reading Hub Switcher */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#10141C] to-[#0D0D14] p-6 border border-emerald-500/20 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-emerald-400" />
                <span>Reading Hub - Komik Manga, Manhwa &amp; Novel</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-2xl">
                Semua bacaan komik (Manga, Manhwa, Manhua) dan Light Novel terjemahan Indonesia tergabung dalam 1 tempat tanpa perlu ganti tab.
              </p>
            </div>

            {/* Reading Hub Quick Jump Navigation */}
            <div className="flex items-center gap-1.5 bg-[#14141E] p-1.5 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Semua Bacaan</span>
              </button>

              <button
                onClick={() => document.getElementById("katalog-komik")?.scrollIntoView({ behavior: "smooth" })}
                className="px-3.5 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Manga &amp; Manhwa</span>
              </button>

              <button
                onClick={() => document.getElementById("katalog-novel")?.scrollIntoView({ behavior: "smooth" })}
                className="px-3.5 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
              >
                <BookMarked className="w-3.5 h-3.5 text-amber-400" />
                <span>Light Novel</span>
              </button>
            </div>
          </div>
        </div>



        {/* Manga Spotlight Section */}
        {loading && mangaList.length === 0 ? (
          <MangaSpotlightSkeleton />
        ) : (
          mangaList.length > 0 && <MangaSpotlightSection items={mangaList} />
        )}

        {/* Filter Type Tabs & Catalog */}
        <div id="katalog-komik" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 scroll-mt-20">
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              {(["all", "Manhwa", "Manhua", "Manga"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filterType === t
                      ? "bg-emerald-400 text-black shadow-md shadow-emerald-400/20"
                      : "bg-[#14141E] text-gray-400 hover:text-white"
                  }`}
                >
                  {t === "all" ? "Semua Komik" : t}
                </button>
              ))}
            </div>

            <span className="text-xs text-gray-400">
              {loading ? "Memuat..." : `Total ${filteredManga.length} Judul`}
            </span>
          </div>

          {loading ? (
            <CatalogGridSkeleton count={10} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {filteredManga.map((manga, idx) => (
                <Link
                  key={idx}
                  href={`/manga/${manga.id}`}
                  className="group relative rounded-xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-emerald-400/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/50">
                    {manga.coverUrl ? (
                      <img
                        src={
                          manga.coverUrl.startsWith("/api/manga")
                            ? manga.coverUrl
                            : `/api/manga?action=image&url=${encodeURIComponent(manga.coverUrl)}`
                        }
                        alt={manga.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#161622]">
                        <BookOpen className="w-10 h-10 text-emerald-400/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/50" />
                    <div className="absolute top-2 left-2 bg-emerald-500/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                      {manga.type || "Manhwa"}
                    </div>
                    <div className="absolute top-2 right-2 bg-black/60 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      9.2
                    </div>
                  </div>

                  <div className="p-3 flex flex-col justify-between flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-emerald-300">
                      {manga.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-2 border-t border-white/5">
                      <span>{manga.status || "Ongoing"}</span>
                      <span className="text-emerald-400 font-bold">Ch. Terbaru</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Light Novel Section */}
        <div id="katalog-novel" className="scroll-mt-20">
          <NovelSection items={novelList} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function MangaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090D] flex items-center justify-center text-gray-400">Memuat Katalog Komik...</div>}>
      <MangaCatalog />
    </Suspense>
  );
}
