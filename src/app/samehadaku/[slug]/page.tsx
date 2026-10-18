"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import {
  Tv,
  Star,
  Play,
  Calendar,
  ChevronRight,
  ArrowDownUp,
  Sparkles,
  Film,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { SamehadakuDetail } from "@/lib/services/samehadakuService";

export default function SamehadakuDetailPage({ params }: { params: { slug: string } }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<SamehadakuDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderAsc, setOrderAsc] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/samehadaku?action=detail&slug=${encodeURIComponent(params.slug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.detail) {
          setDetail(data.detail);
        } else {
          setError(data.error || "Gagal memuat detail dari Samehadaku");
        }
      })
      .catch((err) => {
        setError(err.message || "Gagal terhubung ke scraper Samehadaku");
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  const episodes = detail?.episodes || [];
  const sortedEpisodes = orderAsc ? [...episodes].reverse() : episodes;

  return (
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col selection:bg-amber-400 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-amber-300">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/anime?source=samehadaku" className="hover:text-amber-300">
            Streaming Anime (Samehadaku)
          </Link>
          <span>/</span>
          <span className="text-amber-400 truncate max-w-xs">
            {loading ? "Memuat data scraper..." : detail?.title || params.slug}
          </span>
        </div>

        {/* Loading State: Skeleton Loader */}
        {loading && (
          <div className="space-y-8 animate-pulse">
            {/* Hero Card Skeleton */}
            <div className="rounded-3xl bg-[#12121A] border border-white/10 p-6 sm:p-8">
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
                <div className="w-48 sm:w-56 aspect-[3/4] rounded-2xl bg-white/10 shrink-0" />
                <div className="flex-1 space-y-4 w-full">
                  <div className="flex gap-2">
                    <div className="h-5 w-20 bg-white/10 rounded-full" />
                    <div className="h-5 w-16 bg-white/10 rounded-full" />
                    <div className="h-5 w-24 bg-white/10 rounded-full" />
                  </div>
                  <div className="h-8 sm:h-10 w-3/4 bg-white/15 rounded-lg" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-white/10 rounded-full" />
                    <div className="h-5 w-20 bg-white/10 rounded-full" />
                    <div className="h-5 w-16 bg-white/10 rounded-full" />
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-4 w-full bg-white/10 rounded" />
                    <div className="h-4 w-5/6 bg-white/10 rounded" />
                    <div className="h-4 w-2/3 bg-white/10 rounded" />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <div className="h-10 w-36 bg-white/15 rounded-full" />
                    <div className="h-10 w-32 bg-white/10 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Episodes List Skeleton */}
            <div className="rounded-2xl bg-[#121218] border border-white/10 p-6 space-y-4">
              <div className="h-6 w-48 bg-white/10 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-white/5 border border-white/5 p-3 flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-white/10 rounded" />
                      <div className="h-3 w-20 bg-white/5 rounded" />
                    </div>
                    <div className="h-5 w-12 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl bg-rose-950/30 border border-rose-500/30 p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Gagal Mengambil Data Real</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">{error}</p>
            <div className="pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-full bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors"
              >
                Coba Muat Ulang
              </button>
            </div>
          </div>
        )}

        {/* Real Content State (Zero Dummy Data) */}
        {!loading && detail && (
          <>
            {/* Hero Card */}
            <div className="rounded-3xl bg-[#12121A] border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] pointer-events-none" />

              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start relative z-10">
                {/* Poster Cover from Samehadaku */}
                <div className="w-48 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden bg-black/60 shrink-0 border border-amber-400/30 shadow-2xl relative group">
                  <img
                    src={detail.thumb}
                    alt={detail.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-amber-400 border border-amber-400/30">
                    SAMEHADAKU
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      {detail.type || "ANIME"}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {detail.score}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {detail.status}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                      {detail.totalEpisodes} Episode Tersedia
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    {detail.title}
                  </h1>

                  {/* Genres */}
                  <div className="flex flex-wrap items-center gap-1.5 my-3">
                    {detail.genres.map((g, i) => (
                      <span
                        key={i}
                        className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/5"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Synopsis from Scraper */}
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mt-2 max-w-4xl line-clamp-6">
                    {detail.synopsis}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-3 mt-6">
                    {episodes.length > 0 && (
                      <Link
                        href={`/samehadaku/watch/${episodes[0].slug || episodes[0].episode}?url=${encodeURIComponent(episodes[0].url)}&animeTitle=${encodeURIComponent(detail.title)}`}
                        className="px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-rose-600/30"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Tonton Episode Terbaru</span>
                      </Link>
                    )}

                    {episodes.length > 1 && (
                      <Link
                        href={`/samehadaku/watch/${episodes[episodes.length - 1].slug || episodes[episodes.length - 1].episode}?url=${encodeURIComponent(episodes[episodes.length - 1].url)}&animeTitle=${encodeURIComponent(detail.title)}`}
                        className="px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm text-gray-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        <span>Mulai dari Episode 1</span>
                      </Link>
                    )}

                    <a
                      href={detail.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-full font-semibold text-xs text-gray-400 hover:text-white bg-black/40 border border-white/5 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Sumber Samehadaku</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Episodes / Chapters Section */}
            <div className="rounded-2xl bg-[#121218] border border-white/10 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Tv className="w-5 h-5 text-amber-400" />
                    <span>Daftar Episode &amp; Rilis Samehadaku</span>
                  </h2>
                  <p className="text-xs text-gray-400">Total {episodes.length} episode live dari Samehadaku</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOrderAsc(!orderAsc)}
                    className="p-2 px-3 rounded-lg bg-[#181822] hover:bg-[#20202F] text-gray-300 border border-white/5 text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowDownUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>{orderAsc ? "Urutan: Terlama" : "Urutan: Terbaru"}</span>
                  </button>
                </div>
              </div>

              {/* Grid of Episodes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[600px] overflow-y-auto pr-1">
                {sortedEpisodes.map((ep, idx) => (
                  <Link
                    key={idx}
                    href={`/samehadaku/watch/${ep.slug || ep.episode}?url=${encodeURIComponent(ep.url)}&animeTitle=${encodeURIComponent(detail.title)}`}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-amber-400/10 border border-white/5 hover:border-amber-400/40 transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 line-clamp-1">
                        {ep.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="text-amber-400 font-semibold">Episode {ep.episode}</span>
                        {ep.date && <span>• {ep.date}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-400 group-hover:bg-amber-400 group-hover:text-black flex items-center justify-center transition-colors">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
