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

export default function FilmHubPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // VidBox Movies State
  const [vidboxMovies, setVidboxMovies] = useState<VidboxItem[]>([]);
  const [loadingVidboxMovies, setLoadingVidboxMovies] = useState(true);

  // VidBox Series State
  const [vidboxSeries, setVidboxSeries] = useState<VidboxItem[]>([]);
  const [loadingVidboxSeries, setLoadingVidboxSeries] = useState(true);

  // OppaDrama Movies State
  const [oppaMovies, setOppaMovies] = useState<OppaDramaCard[]>([]);
  const [loadingOppaMovies, setLoadingOppaMovies] = useState(true);

  // Fetch VidBox Movies
  useEffect(() => {
    setLoadingVidboxMovies(true);
    const url = searchQuery.trim()
      ? `/api/vidbox?action=search&q=${encodeURIComponent(searchQuery.trim())}&type=movie`
      : `/api/vidbox?action=catalog&category=movies`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setVidboxMovies(data.items);
        } else {
          setVidboxMovies([]);
        }
      })
      .catch((err) => {
        console.error("VidBox Movies error:", err);
        setVidboxMovies([]);
      })
      .finally(() => setLoadingVidboxMovies(false));
  }, [searchQuery]);

  // Fetch VidBox Series
  useEffect(() => {
    setLoadingVidboxSeries(true);
    const url = searchQuery.trim()
      ? `/api/vidbox?action=search&q=${encodeURIComponent(searchQuery.trim())}&type=tv`
      : `/api/vidbox?action=catalog&category=series`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setVidboxSeries(data.items);
        } else {
          setVidboxSeries([]);
        }
      })
      .catch((err) => {
        console.error("VidBox Series error:", err);
        setVidboxSeries([]);
      })
      .finally(() => setLoadingVidboxSeries(false));
  }, [searchQuery]);

  // Fetch OppaDrama Movies Data
  useEffect(() => {
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
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col selection:bg-red-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 space-y-8">
        {/* Banner Top */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-2xl bg-gradient-to-r from-red-950/40 via-[#181216] to-[#0D0D14] p-6 border border-red-500/20 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <Film className="w-8 h-8 text-red-500" />
                <span>Film Hub - Bioskop HD &amp; Series Multi-Server</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-2xl">
                Semua film bioskop dunia, serial TV, dan film Asia dari VidBox dan OppaDrama tergabung dalam 1 halaman. Nonton langsung tanpa perlu ganti tab.
              </p>
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

        {/* SECTION 1: VIDBOX MOVIES GRID */}
        <div id="vidbox_movies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-red-500" />
                <span>
                  {searchQuery
                    ? `Hasil Pencarian Film Bioskop: "${searchQuery}"`
                    : "Film Bioskop HD Box Office Terbaru (VidBox Movies)"}
                </span>
              </h2>
              <span className="text-xs text-gray-400">
                {loadingVidboxMovies ? "Memuat data real..." : `${vidboxMovies.length} Judul Real`}
              </span>
            </div>

            {loadingVidboxMovies && <CatalogGridSkeleton count={12} />}

            {!loadingVidboxMovies && vidboxMovies.length === 0 && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Tidak ada film bioskop ditemukan</h3>
                <p className="text-xs text-gray-400">
                  Coba kata kunci lain atau kosongkan kolom pencarian.
                </p>
              </div>
            )}

            {!loadingVidboxMovies && vidboxMovies.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {vidboxMovies.map((item, idx) => (
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
                        VIDBOX MOVIE
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

        {/* SECTION 2: VIDBOX TV SERIES GRID */}
        <div id="vidbox_series" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-rose-400" />
                <span>
                  {searchQuery
                    ? `Hasil Pencarian TV Series: "${searchQuery}"`
                    : "Serial TV & Box Office Series (VidBox Series)"}
                </span>
              </h2>
              <span className="text-xs text-gray-400">
                {loadingVidboxSeries ? "Memuat data real..." : `${vidboxSeries.length} Judul Real`}
              </span>
            </div>

            {loadingVidboxSeries && <CatalogGridSkeleton count={12} />}

            {!loadingVidboxSeries && vidboxSeries.length === 0 && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Tidak ada serial TV ditemukan</h3>
                <p className="text-xs text-gray-400">
                  Coba kata kunci lain atau periksa provider lainnya.
                </p>
              </div>
            )}

            {!loadingVidboxSeries && vidboxSeries.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {vidboxSeries.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/film/watch?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`}
                    className="group relative rounded-xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-rose-500/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
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
                          <Tv className="w-8 h-8 text-rose-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/40" />
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-rose-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-rose-500/30">
                        TV SERIES
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
                      <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-rose-300">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5">
                        <span className="text-gray-400 uppercase font-mono">{item.type || "Series"}</span>
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 fill-current" /> Nonton
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        {/* SECTION 3: OPPADRAMA MOVIES GRID */}
        <div id="oppadrama_movies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20">
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
      </main>

      <Footer />
    </div>
  );
}
