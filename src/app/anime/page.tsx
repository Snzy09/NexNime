"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import PopularRankingSection from "@/components/PopularRankingSection";
import ScheduleSection from "@/components/ScheduleSection";
import CatalogFilterGrid from "@/components/CatalogFilterGrid";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Tv, Sparkles, Search, Flame, Play, AlertCircle, Compass, Layers, Film } from "lucide-react";

// Skeletons
import RankingCardsSkeleton from "@/components/skeletons/RankingCardsSkeleton";
import ScheduleSkeleton from "@/components/skeletons/ScheduleSkeleton";
import CatalogGridSkeleton from "@/components/skeletons/CatalogGridSkeleton";

import { AnimeItem, ScheduleDay } from "@/lib/services/animeService";
import { SamehadakuItem } from "@/lib/services/samehadakuService";
import { AnimeSailCard } from "@/lib/services/animesailService";
import { AnimeXinItem } from "@/lib/services/animexinService";
import { DonghuaFilmItem } from "@/lib/services/donghuaFilmService";

type AnimeSource = "samehadaku" | "donghuafilm" | "animesail" | "animexin" | "animeindo";

export default function AnimePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [source, setSource] = useState<AnimeSource>("samehadaku");
  const [searchQuery, setSearchQuery] = useState("");

  // Samehadaku Live State
  const [samehadakuItems, setSamehadakuItems] = useState<SamehadakuItem[]>([]);
  const [loadingSamehadaku, setLoadingSamehadaku] = useState(true);

  // DonghuaFilm Live State
  const [donghuaFilmItems, setDonghuaFilmItems] = useState<DonghuaFilmItem[]>([]);
  const [loadingDonghuaFilm, setLoadingDonghuaFilm] = useState(false);

  // AnimeSail Live State
  const [animesailItems, setAnimesailItems] = useState<AnimeSailCard[]>([]);
  const [loadingAnimeSail, setLoadingAnimeSail] = useState(false);

  // AnimeXin Donghua Live State
  const [animexinItems, setAnimexinItems] = useState<AnimeXinItem[]>([]);
  const [loadingAnimeXin, setLoadingAnimeXin] = useState(false);

  // AnimeIndo & AniChin State
  const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
  const [scheduleList, setScheduleList] = useState<ScheduleDay[]>([]);
  const [loadingAnimeIndo, setLoadingAnimeIndo] = useState(false);

  // Read URL query params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const src = sp.get("source") as AnimeSource;
      if (src && ["samehadaku", "donghuafilm", "animesail", "animexin", "animeindo"].includes(src)) {
        setSource(src);
      }
      const q = sp.get("q");
      if (q) {
        setSearchQuery(q);
      }
    }
  }, []);

  // Fetch Samehadaku Data
  useEffect(() => {
    if (source === "samehadaku") {
      setLoadingSamehadaku(true);
      const url = searchQuery.trim()
        ? `/api/samehadaku?action=search&q=${encodeURIComponent(searchQuery.trim())}`
        : `/api/samehadaku?action=popular`;

      fetch(url)
        .then((r) => r.json())
        .then((d) => {
          if (d.items && Array.isArray(d.items)) {
            setSamehadakuItems(d.items);
          }
        })
        .catch((e) => console.error("Error fetching Samehadaku:", e))
        .finally(() => setLoadingSamehadaku(false));
    }
  }, [source, searchQuery]);

  // Fetch DonghuaFilm Data
  useEffect(() => {
    if (source === "donghuafilm") {
      setLoadingDonghuaFilm(true);
      const url = searchQuery.trim()
        ? `/api/donghuafilm?action=search&q=${encodeURIComponent(searchQuery.trim())}`
        : `/api/donghuafilm?action=latest`;

      fetch(url)
        .then((r) => r.json())
        .then((d) => {
          if (d.items && Array.isArray(d.items)) {
            setDonghuaFilmItems(d.items);
          }
        })
        .catch((e) => console.error("Error fetching DonghuaFilm:", e))
        .finally(() => setLoadingDonghuaFilm(false));
    }
  }, [source, searchQuery]);

  // Fetch AnimeSail Data
  useEffect(() => {
    if (source === "animesail") {
      setLoadingAnimeSail(true);
      const url = searchQuery.trim()
        ? `/api/animesail?action=search&q=${encodeURIComponent(searchQuery.trim())}`
        : `/api/animesail?action=latest`;

      fetch(url)
        .then((r) => r.json())
        .then((d) => {
          if (d.items && Array.isArray(d.items)) {
            setAnimesailItems(d.items);
          }
        })
        .catch((e) => console.error("Error fetching AnimeSail:", e))
        .finally(() => setLoadingAnimeSail(false));
    }
  }, [source, searchQuery]);

  // Fetch AnimeXin Donghua Data
  useEffect(() => {
    if (source === "animexin") {
      setLoadingAnimeXin(true);
      fetch("/api/animexin?action=latest")
        .then((r) => r.json())
        .then((d) => {
          if (d.items && Array.isArray(d.items)) {
            setAnimexinItems(d.items);
          }
        })
        .catch((e) => console.error("Error fetching AnimeXin:", e))
        .finally(() => setLoadingAnimeXin(false));
    }
  }, [source]);

  // Fetch AnimeIndo / Schedule Data
  useEffect(() => {
    if (source === "animeindo" && animeList.length === 0) {
      setLoadingAnimeIndo(true);
      Promise.all([
        fetch("/api/anime?action=popular").then((r) => r.json()),
        fetch("/api/anime?action=schedule").then((r) => r.json()),
      ])
        .then(([animeRes, schedRes]) => {
          if (animeRes.items) setAnimeList(animeRes.items);
          if (schedRes.schedule) setScheduleList(schedRes.schedule);
        })
        .catch((e) => console.error("Error fetching anime page:", e))
        .finally(() => setLoadingAnimeIndo(false));
    }
  }, [source, animeList.length]);

  const filteredDonghua = animexinItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    return item.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  return (
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col selection:bg-amber-400 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 space-y-6">
        {/* Top Header Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-2xl bg-gradient-to-r from-amber-950/50 via-[#161420] to-[#0D0D14] p-6 border border-amber-500/20 shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                  <Tv className="w-8 h-8 text-amber-400" />
                  <span>Anime Hub - Streaming Multi-Provider Sub Indo</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-2">
                  Akses 5 sumber streaming anime &amp; donghua dalam 1 tempat: Samehadaku, DonghuaFilm, AnimeSail, AnimeXin Donghua, dan Jadwal AnimeIndo. 100% data real hasil live scrape.
                </p>
              </div>

              {/* 5-in-1 Source Switcher Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#14141E] p-1.5 rounded-xl border border-white/10 shrink-0">
                <button
                  onClick={() => {
                    setSource("samehadaku");
                    setSearchQuery("");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    source === "samehadaku"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/20"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Samehadaku</span>
                </button>

                <button
                  onClick={() => {
                    setSource("donghuafilm");
                    setSearchQuery("");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    source === "donghuafilm"
                      ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>DonghuaFilm</span>
                </button>

                <button
                  onClick={() => {
                    setSource("animesail");
                    setSearchQuery("");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    source === "animesail"
                      ? "bg-sky-500 text-black shadow-lg shadow-sky-500/20"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>AnimeSail</span>
                </button>

                <button
                  onClick={() => {
                    setSource("animexin");
                    setSearchQuery("");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    source === "animexin"
                      ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Donghua (AnimeXin)</span>
                </button>

                <button
                  onClick={() => {
                    setSource("animeindo");
                    setSearchQuery("");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    source === "animeindo"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/20"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AnimeIndo &amp; Jadwal</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Big Search Bar for Anime */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl bg-[#121218] border border-white/10 p-3 sm:p-4 shadow-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    source === "samehadaku"
                      ? "Cari anime Samehadaku (contoh: Solo Leveling, Bleach, Jujutsu Kaisen)..."
                      : source === "donghuafilm"
                      ? "Cari donghua di DonghuaFilm (contoh: Battle Through The Heavens, Soul Land)..."
                      : source === "animesail"
                      ? "Cari anime di server AnimeSail (contoh: One Piece, Naruto, Frieren)..."
                      : source === "animexin"
                      ? "Cari donghua AnimeXin (contoh: Soul Land, Battle Through The Heavens, Perfect World)..."
                      : "Cari judul anime atau donghua di jadwal..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#181824] text-xs sm:text-sm text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-2.5 sm:py-3 border border-white/5 focus:border-amber-400/40 focus:outline-none"
                />
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Reset
                </button>
              )}
            </form>

            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-white/5 text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1 mr-1">
                <Flame className="w-3.5 h-3.5" /> POPULER:
              </span>
              {["Battle Through the Heavens", "Solo Leveling", "Bleach", "One Piece", "Soul Land", "Perfect World"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-amber-300 transition-colors"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* PROVIDER 1: SAMEHADAKU */}
        {source === "samehadaku" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-amber-400" />
                <span>
                  {searchQuery
                    ? `Hasil Pencarian Samehadaku: "${searchQuery}"`
                    : "Rilis Anime Terbaru Samehadaku (Streaming Sub Indo)"}
                </span>
              </h2>
              <span className="text-xs text-gray-400">
                {loadingSamehadaku ? "Memuat live data..." : `${samehadakuItems.length} Judul Real`}
              </span>
            </div>

            {loadingSamehadaku && <CatalogGridSkeleton count={12} />}

            {!loadingSamehadaku && samehadakuItems.length === 0 && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Tidak ada anime ditemukan</h3>
                <p className="text-xs text-gray-400">
                  Coba kata kunci lain atau kosongkan kolom pencarian.
                </p>
              </div>
            )}

            {!loadingSamehadaku && samehadakuItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {samehadakuItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/samehadaku/${item.slug}`}
                    className="group relative rounded-xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-amber-400/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
                      {item.thumb ? (
                        <img
                          src={item.thumb}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1A24] to-[#101018]">
                          <Tv className="w-10 h-10 text-amber-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/40" />
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-amber-400/30">
                        SAMEHADAKU
                      </div>
                      {item.episode && (
                        <div className="absolute bottom-2 right-2 bg-amber-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          {item.episode}
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                      <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-amber-300">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5">
                        <span className="text-emerald-400">{item.status || "Ongoing"}</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 fill-current" /> Nonton
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROVIDER 2: DONGHUAFILM */}
        {source === "donghuafilm" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-amber-400" />
                <span>
                  {searchQuery
                    ? `Hasil Pencarian DonghuaFilm: "${searchQuery}"`
                    : "DonghuaFilm - Animasi 3D &amp; 2D China HD Sub Indo"}
                </span>
              </h2>
              <span className="text-xs text-gray-400">
                {loadingDonghuaFilm ? "Memuat live data..." : `${donghuaFilmItems.length} Judul Real`}
              </span>
            </div>

            {loadingDonghuaFilm && <CatalogGridSkeleton count={12} />}

            {!loadingDonghuaFilm && donghuaFilmItems.length === 0 && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Tidak ada donghua ditemukan</h3>
                <p className="text-xs text-gray-400">
                  Coba kata kunci lain atau kosongkan kolom pencarian.
                </p>
              </div>
            )}

            {!loadingDonghuaFilm && donghuaFilmItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {donghuaFilmItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/donghuafilm/watch?slug=${item.slug}`}
                    className="group relative rounded-xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-amber-400/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
                      {item.poster || item.cover ? (
                        <img
                          src={item.poster || item.cover}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1A1A24]">
                          <Tv className="w-10 h-10 text-amber-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/40" />
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-amber-400/30">
                        DONGHUAFILM
                      </div>
                      {item.latest_episode && (
                        <div className="absolute bottom-2 right-2 bg-amber-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          Ep {item.latest_episode}
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                      <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-amber-300">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5">
                        <span className="text-emerald-400">{item.status || "Ongoing"}</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 fill-current" /> Nonton
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROVIDER 3: ANIMESAIL */}
        {source === "animesail" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-400" />
                <span>
                  {searchQuery
                    ? `Hasil Pencarian AnimeSail: "${searchQuery}"`
                    : "Anime Terbaru AnimeSail (Multi-Server HD Sub Indo)"}
                </span>
              </h2>
              <span className="text-xs text-gray-400">
                {loadingAnimeSail ? "Memuat live data..." : `${animesailItems.length} Judul Real`}
              </span>
            </div>

            {loadingAnimeSail && <CatalogGridSkeleton count={12} />}

            {!loadingAnimeSail && animesailItems.length === 0 && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-sky-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Tidak ada anime ditemukan</h3>
                <p className="text-xs text-gray-400">
                  Coba kata kunci lain atau periksa tab provider lainnya.
                </p>
              </div>
            )}

            {!loadingAnimeSail && animesailItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {animesailItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/animesail/watch?slug=${item.slug}`}
                    className="group relative rounded-xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-sky-400/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1A1A24]">
                          <Tv className="w-10 h-10 text-sky-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/40" />
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-sky-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-sky-400/30">
                        ANIMESAIL
                      </div>
                      {item.episode && (
                        <div className="absolute bottom-2 right-2 bg-sky-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          {item.episode}
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                      <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-sky-300">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5">
                        <span className="text-sky-400">{item.type || "Anime"}</span>
                        <span className="text-sky-400 font-bold flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 fill-current" /> Nonton
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROVIDER 4: ANIMEXIN DONGHUA */}
        {source === "animexin" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>
                  {searchQuery
                    ? `Hasil Pencarian Donghua: "${searchQuery}"`
                    : "AnimeXin - Donghua 3D Animasi China Subtitle Indonesia"}
                </span>
              </h2>
              <span className="text-xs text-gray-400">
                {loadingAnimeXin ? "Memuat live data..." : `${filteredDonghua.length} Judul Real`}
              </span>
            </div>

            {loadingAnimeXin && <CatalogGridSkeleton count={12} />}

            {!loadingAnimeXin && filteredDonghua.length === 0 && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-cyan-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Tidak ada donghua ditemukan</h3>
                <p className="text-xs text-gray-400">
                  Coba kata kunci lain untuk mencari donghua favoritmu.
                </p>
              </div>
            )}

            {!loadingAnimeXin && filteredDonghua.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredDonghua.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/animexin/watch?slug=${item.slug}`}
                    className="group relative rounded-xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-cyan-400/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
                      {item.poster ? (
                        <img
                          src={
                            item.poster.startsWith("http")
                              ? `/api/animexin?action=image&url=${encodeURIComponent(item.poster)}`
                              : item.poster
                          }
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1A1A24]">
                          <Tv className="w-10 h-10 text-cyan-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/40" />
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-cyan-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-cyan-400/30">
                        ANIMEXIN DONGHUA
                      </div>
                      {item.episode && (
                        <div className="absolute bottom-2 right-2 bg-cyan-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          {item.episode}
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                      <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-cyan-300">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5">
                        <span className="text-cyan-400">{item.type || "Donghua"}</span>
                        <span className="text-cyan-400 font-bold flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 fill-current" /> Nonton
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROVIDER 5: ANIMEINDO & JADWAL */}
        {source === "animeindo" && (
          <div className="space-y-6">
            {/* Top Populer Anime Ranking */}
            {loadingAnimeIndo ? <RankingCardsSkeleton /> : <PopularRankingSection items={animeList} />}

            {/* Jadwal Rilis Hari Ini & Mingguan */}
            <div id="jadwal">
              {loadingAnimeIndo ? <ScheduleSkeleton /> : <ScheduleSection schedule={scheduleList} />}
            </div>

            {/* Katalog Anime Lengkap */}
            {loadingAnimeIndo ? <CatalogGridSkeleton count={12} /> : <CatalogFilterGrid items={animeList} />}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
