"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Video, Search, Flame, Play, Eye, Heart, Sparkles, AlertCircle, Layers } from "lucide-react";
import DracinReelsSkeleton from "@/components/skeletons/DracinReelsSkeleton";
import { ReelShortItem } from "@/lib/services/reelshortService";

export default function ReelShortPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Billionaire");
  const [searchQuery, setSearchQuery] = useState("");
  const [dramas, setDramas] = useState<ReelShortItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = searchQuery.trim()
      ? `/api/reelshort?action=search&q=${encodeURIComponent(searchQuery.trim())}`
      : `/api/reelshort?action=popular&category=${encodeURIComponent(activeCategory)}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setDramas(data.items);
        } else {
          setDramas([]);
        }
      })
      .catch((err) => {
        console.error("ReelShort fetch error:", err);
        setDramas([]);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 space-y-6">
        {/* Banner Top */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-2xl bg-gradient-to-r from-rose-950/50 via-[#181014] to-[#0D0D14] p-6 border border-rose-500/20 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-2">
                  <Video className="w-8 h-8 text-rose-500" />
                  <span>ReelShort - Streaming Video Pendek (9:16)</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-2">
                  Nonton ribuan drama pendek vertikal resolusi HD rasio 9:16 ala TikTok/Reels. Data 100% real hasil live scrape &amp; dekripsi stream ReelShort.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 uppercase tracking-wider">
                  Rasio 9:16 Vertikal
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                  HD Streams
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Genre Filter Pills */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl bg-[#121218] border border-white/10 p-3 sm:p-4 shadow-xl">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-bold text-rose-400 flex items-center gap-1 mr-1">
                <Flame className="w-3.5 h-3.5" /> GENRE REELSHORT:
              </span>
              {["Billionaire", "CEO", "Love", "Revenge", "Werewolf", "Contract Marriage", "Mafia"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      activeCategory === cat
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                        : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Drama Grid Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-rose-500" />
              <span>
                {searchQuery
                  ? `Hasil Pencarian ReelShort: "${searchQuery}"`
                  : `Drama Populer: Kategori "${activeCategory}"`}
              </span>
            </h2>
            <span className="text-xs text-gray-400">
              {loading ? "Memuat live data..." : `${dramas.length} Judul Real`}
            </span>
          </div>

          {/* Skeleton Loader State */}
          {loading && <DracinReelsSkeleton />}

          {/* Empty State */}
          {!loading && dramas.length === 0 && (
            <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Tidak ada drama ReelShort ditemukan</h3>
              <p className="text-xs text-gray-400">
                Coba kata kunci lain atau pilih kategori genre di atas.
              </p>
            </div>
          )}

          {/* Real 9:16 Vertical Cards Grid */}
          {!loading && dramas.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {dramas.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/reelshort/watch?id=${item.book_id}&title=${encodeURIComponent(item.title)}`}
                  className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-rose-500/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-950/40"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/70">
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

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-rose-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-rose-500/30">
                      REELSHORT
                    </div>

                    {item.total_episodes && (
                      <div className="absolute top-2 right-2 bg-black/70 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
                        <Layers className="w-2.5 h-2.5" />
                        {item.total_episodes} Ep
                      </div>
                    )}

                    {/* Play floating icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="w-12 h-12 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-lg shadow-rose-500/50 scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </span>
                    </div>

                    {/* Bottom Metadata */}
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

                    {item.description && (
                      <p className="text-[11px] text-gray-400 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5">
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <Play className="w-2.5 h-2.5 fill-current" /> Putar Drama
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-gray-500">
                        {item.tags?.[0] || "Vertikal"}
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
