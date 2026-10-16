"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Film, Clapperboard, Search, Flame, Star, Play, AlertCircle, Tv, Heart } from "lucide-react";
import CatalogGridSkeleton from "@/components/skeletons/CatalogGridSkeleton";
import { VidboxItem } from "@/lib/services/vidboxService";
import { OppaDramaCard } from "@/lib/services/oppadramaService";

type FilmProvider = "vidbox_movies" | "vidbox_series" | "oppadrama_movies";

export default function FilmHubPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FilmProvider>("vidbox_movies");
  const [searchQuery, setSearchQuery] = useState("");

  // VidBox State
  const [vidboxItems, setVidboxItems] = useState<VidboxItem[]>([]);
  const [loadingVidbox, setLoadingVidbox] = useState(true);

  // OppaDrama Movies State
  const [oppaMovies, setOppaMovies] = useState<OppaDramaCard[]>([]);
  const [loadingOppaMovies, setLoadingOppaMovies] = useState(false);

  // Fetch VidBox Data
  useEffect(() => {
    if (activeTab === "vidbox_movies" || activeTab === "vidbox_series") {
      setLoadingVidbox(true);
      const cat = activeTab === "vidbox_movies" ? "movies" : "series";
      const type = activeTab === "vidbox_movies" ? "movie" : "tv";
      const url = searchQuery.trim()
        ? `/api/vidbox?action=search&q=${encodeURIComponent(searchQuery.trim())}&type=${type}`
        : `/api/vidbox?action=catalog&category=${cat}`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.items && Array.isArray(data.items)) {
            setVidboxItems(data.items);
          } else {
            setVidboxItems([]);
          }
        })
        .catch((err) => {
          console.error("VidBox fetch error:", err);
          setVidboxItems([]);
        })
        .finally(() => setLoadingVidbox(false));
    }
  }, [activeTab, searchQuery]);

  // Fetch OppaDrama Movies Data
  useEffect(() => {
    if (activeTab === "oppadrama_movies") {
      setLoadingOppaMovies(true);
      const url = searchQuery.trim()
        ? `/api/oppadrama?action=search&q=${encodeURIComponent(searchQuery.trim())}`
        : `/api/oppadrama?action=latest&page=1`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.items && Array.isArray(data.items)) {
            // Find movies or items with movie in title/slug
            const moviesOnly = data.items.filter(
              (i: OppaDramaCard) =>
                i.type?.toLowerCase().includes("movie") ||
                i.episode?.toLowerCase().includes("movie") ||
                i.slug.toLowerCase().includes("movie")
            );
            setOppaMovies(moviesOnly.length > 0 ? moviesOnly : data.items);
          } else {
            setOppaMovies([]);
          }
        })
        .catch((err) => {
          console.error("OppaDrama movies error:", err);
          setOppaMovies([]);
        })
        .finally(() => setLoadingOppaMovies(false));
    }
  }, [activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col selection:bg-red-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 space-y-6">
        {/* Banner Top */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-2xl bg-gradient-to-r from-red-950/40 via-[#181216] to-[#0D0D14] p-6 border border-red-500/20 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <Film className="w-8 h-8 text-red-500" />
                <span>Film Hub - Bioskop HD &amp; Series Multi-Server</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-2xl">
                Nonton film box office dunia dan film bioskop Asia dari 2 platform: VidBox (Movies &amp; Series) dan OppaDrama Movies. Data 100% real hasil live scrape.
              </p>
            </div>

            {/* Provider & Type Switcher */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#14141E] p-1.5 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => {
                  setActiveTab("vidbox_movies");
                  setSearchQuery("");
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "vidbox_movies"
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Clapperboard className="w-3.5 h-3.5" />
                <span>VidBox Movies</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("vidbox_series");
                  setSearchQuery("");
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "vidbox_series"
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>VidBox TV Series</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("oppadrama_movies");
                  setSearchQuery("");
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "oppadrama_movies"
                    ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>OppaDrama Movies</span>
              </button>
            </div>
          </div>
        </div>

        {/* Popular Tags for Film */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl bg-[#121218] border border-white/10 p-2.5 sm:p-3 shadow-xl">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-bold text-red-400 flex items-center gap-1 mr-1">
                <Flame className="w-3.5 h-3.5" /> REKOMENDASI POPULER:
              </span>
              {["Avatar", "Dune", "Oppenheimer", "Exhuma", "Spider-Man", "Batman", "Deadpool"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* VIDBOX MOVIES & SERIES GRID */}
        {(activeTab === "vidbox_movies" || activeTab === "vidbox_series") && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-red-500" />
                <span>
                  {searchQuery
                    ? `Hasil Pencarian VidBox: "${searchQuery}"`
                    : activeTab === "vidbox_movies"
                    ? "Katalog Film Bioskop Terbaru (VidBox Movies HD)"
                    : "Katalog TV Series Populer (VidBox Series HD)"}
                </span>
              </h2>
              <span className="text-xs text-gray-400">
                {loadingVidbox ? "Memuat data real..." : `${vidboxItems.length} Judul Real`}
              </span>
            </div>

            {loadingVidbox && <CatalogGridSkeleton count={12} />}

            {!loadingVidbox && vidboxItems.length === 0 && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Tidak ada judul ditemukan</h3>
                <p className="text-xs text-gray-400">
                  Coba kata kunci lain atau kosongkan kolom pencarian.
                </p>
              </div>
            )}

            {!loadingVidbox && vidboxItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {vidboxItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/film/watch?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`}
                    className="group relative rounded-xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-red-500/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                      {item.poster ? (
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#181822]">
                          <Film className="w-8 h-8 text-red-500/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/40" />
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-red-500/30">
                        VIDBOX HD
                      </div>
                      <div className="absolute top-2 right-2 bg-black/70 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        {item.rating || "8.5"}
                      </div>
                      {item.year && (
                        <div className="absolute bottom-2 left-2 bg-black/60 text-gray-300 text-[9px] font-semibold px-1.5 py-0.5 rounded">
                          {item.year}
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                      <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-red-300">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5">
                        <span className="text-gray-400 uppercase font-mono">{item.type || "Movie"}</span>
                        <span className="text-red-400 font-bold flex items-center gap-1">
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

        {/* OPPADRAMA MOVIES GRID */}
        {activeTab === "oppadrama_movies" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-fuchsia-400" />
                <span>
                  {searchQuery
                    ? `Hasil Pencarian Film OppaDrama: "${searchQuery}"`
                    : "Koleksi Film Bioskop Korea &amp; Asia (OppaDrama Movies)"}
                </span>
              </h2>
              <span className="text-xs text-gray-400">
                {loadingOppaMovies ? "Memuat data real..." : `${oppaMovies.length} Judul Real`}
              </span>
            </div>

            {loadingOppaMovies && <CatalogGridSkeleton count={12} />}

            {!loadingOppaMovies && oppaMovies.length === 0 && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-fuchsia-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Tidak ada film ditemukan</h3>
                <p className="text-xs text-gray-400">Coba gunakan kata kunci pencarian lain.</p>
              </div>
            )}

            {!loadingOppaMovies && oppaMovies.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {oppaMovies.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/oppadrama/watch?slug=${item.slug}`}
                    className="group relative rounded-xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-fuchsia-400/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1A1A24]">
                          <Film className="w-10 h-10 text-fuchsia-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/40" />
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-fuchsia-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-fuchsia-400/30">
                        OPPADRAMA MOVIE
                      </div>
                      {item.status && (
                        <div className="absolute top-2 right-2 bg-black/70 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          {item.status}
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                      <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-fuchsia-300">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5">
                        <span className="text-fuchsia-400 font-medium">Bioskop Asia</span>
                        <span className="text-fuchsia-400 font-bold flex items-center gap-1">
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
      </main>

      <Footer />
    </div>
  );
}
