"use client";

import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Play,
  Sparkles,
  Video,
  Flame,
  Layers,
  Heart,
} from "lucide-react";
import { DracinItem } from "@/lib/services/dracinService";
import { ReelShortItem } from "@/lib/services/reelshortService";
import { NetShortItem } from "@/lib/services/netshortService";
import { REAL_DRACIN_SHORTS } from "@/lib/services/realDataFallback";
import DracinReelsSkeleton from "@/components/skeletons/DracinReelsSkeleton";

function DracinHubContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // AsiaBox State
  const [dramaList, setDramaList] = useState<DracinItem[]>(REAL_DRACIN_SHORTS);
  const [loadingAsiaList, setLoadingAsiaList] = useState(true);

  // ReelShort State
  const [reelShortCategory, setReelShortCategory] = useState("Billionaire");
  const [reelShortDramas, setReelShortDramas] = useState<ReelShortItem[]>([]);
  const [loadingReelShort, setLoadingReelShort] = useState(true);

  // NetShort State
  const [netShortDramas, setNetShortDramas] = useState<NetShortItem[]>([]);
  const [loadingNetShort, setLoadingNetShort] = useState(true);

  // 1. Fetch AsiaBox on mount
  useEffect(() => {
    fetch("/api/dracin?action=home")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && d.items.length > 0) {
          setDramaList(d.items);
        }
      })
      .catch((e) => console.error("Error fetching Dracin list:", e))
      .finally(() => setLoadingAsiaList(false));
  }, []);

  // 2. Fetch ReelShort Data
  useEffect(() => {
    setLoadingReelShort(true);
    fetch(`/api/reelshort?action=popular&category=${encodeURIComponent(reelShortCategory)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setReelShortDramas(data.items);
        } else {
          setReelShortDramas([]);
        }
      })
      .catch((err) => {
        console.error("ReelShort fetch error:", err);
        setReelShortDramas([]);
      })
      .finally(() => setLoadingReelShort(false));
  }, [reelShortCategory]);

  // 3. Fetch NetShort Data
  useEffect(() => {
    setLoadingNetShort(true);
    fetch("/api/netshort?action=list")
      .then((r) => r.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) {
          setNetShortDramas(data.items);
        } else {
          setNetShortDramas([]);
        }
      })
      .catch((err) => {
        console.error("NetShort fetch error:", err);
        setNetShortDramas([]);
      })
      .finally(() => setLoadingNetShort(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Header Hub Banner with Provider Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
        <div className="rounded-2xl bg-gradient-to-r from-rose-950/50 via-[#181014] to-[#0D0D14] p-4 sm:p-6 border border-rose-500/20 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Video className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500 shrink-0" />
              <span>Short Drama Hub (9:16 Vertikal)</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
              Semua drama pendek rasio 9:16 dari 3 platform (AsiaBox, ReelShort, NetShort) tergabung dalam 1 halaman. Pilih drama untuk mulai menonton.
            </p>
          </div>
        </div>
      </div>

      {/* VIEW 1: ASIABOX CATALOG */}
      <div id="asiabox" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 w-full scroll-mt-20">
          {/* AsiaBox Catalog Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <span>Koleksi Serial AsiaBox (Klik untuk Nonton)</span>
              </h2>
              <span className="text-xs text-gray-400">
                {loadingAsiaList ? "Memuat katalog..." : `${dramaList.length} Judul`}
              </span>
            </div>

            {loadingAsiaList ? (
              <DracinReelsSkeleton />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {dramaList.map((drama, idx) => (
                  <Link
                    key={idx}
                    href={`/dracin/watch?slug=${encodeURIComponent(drama.slug)}&title=${encodeURIComponent(drama.title)}`}
                    className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-rose-500/40 transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-950/40"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                      {drama.image ? (
                        <img
                          src={drama.image}
                          alt={drama.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-rose-950/30 text-rose-300 text-xs text-center p-3">
                          {drama.title}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl shadow-rose-600/50">
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                        </div>
                      </div>

                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600/90 text-white shadow-sm flex items-center gap-1 backdrop-blur-sm">
                          <Sparkles className="w-2.5 h-2.5" />
                          AsiaBox
                        </span>
                        {drama.episodes && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-amber-300 backdrop-blur-sm border border-white/10">
                            {drama.episodes} Ep
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                        <p className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-rose-300 transition-colors">
                          {drama.title}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 truncate">
                          Klik untuk tonton
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      {/* VIEW 2: REELSHORT CATALOG */}
      <div id="reelshort" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 w-full scroll-mt-20">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Koleksi ReelShort (Serial Pendek Romantis &amp; Billionaire)</span>
            </h2>
            <span className="text-xs text-gray-400">
              {loadingReelShort ? "Memuat..." : `${reelShortDramas.length} Judul`}
            </span>
          </div>
          {/* Category Filter Pills (Compact without duplicate search input) */}
          <div className="rounded-xl sm:rounded-2xl bg-[#121218] border border-white/10 p-2.5 sm:p-3 shadow-xl">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs text-gray-400 font-medium shrink-0 flex items-center gap-1 mr-1">
                <Layers className="w-3.5 h-3.5 text-rose-400" /> Kategori:
              </span>
              {[
                "Billionaire",
                "Romance",
                "Revenge",
                "Werewolf",
                "Forbidden Love",
                "Marriage",
                "CEO",
                "Urban",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setReelShortCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    reelShortCategory === cat
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105"
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loadingReelShort && (
            <div className="py-12 flex justify-center items-center">
              <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
            </div>
          )}

          {/* ReelShort Grid */}
          {!loadingReelShort && reelShortDramas.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {reelShortDramas.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/reelshort/watch?id=${item.book_id}&title=${encodeURIComponent(item.title)}`}
                  className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-rose-500/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-950/40"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/70">
                    {item.cover ? (
                      <img
                        src={item.cover}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-rose-950/20 text-xs text-rose-300 p-2 text-center">
                        {item.title}
                      </div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                      REELSHORT
                    </div>
                    {item.total_episodes ? (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-amber-300 text-[10px] font-bold border border-white/10 flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5" />
                        {item.total_episodes} Ep
                      </div>
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-lg shadow-rose-500/50 scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-gray-300">
                      {item.read_count ? (
                        <span className="bg-black/60 px-1.5 py-0.5 rounded">
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
                  <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-rose-300 transition-colors leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      {/* VIEW 3: NETSHORT CATALOG */}
      <div id="netshort" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 w-full scroll-mt-20">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Koleksi NetShort (Drama Vertikal HD)</span>
          </h2>
          <span className="text-xs text-gray-400">
            {loadingNetShort ? "Memuat..." : `${netShortDramas.length} Judul`}
          </span>
        </div>
        {/* Loading */}
        {loadingNetShort && (
          <div className="py-12 flex justify-center items-center">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
        )}

        {/* NetShort Grid (Directly under banner, saving maximum space) */}
        {!loadingNetShort && netShortDramas.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {netShortDramas.map((item, idx) => (
              <Link
                key={idx}
                href={`/netshort/watch?slug=${item.slug}&title=${encodeURIComponent(item.title)}`}
                className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-purple-500/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-950/40"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/70">
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-950/20 text-xs text-purple-300 p-2 text-center">
                      {item.title}
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider">
                    NETSHORT
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg shadow-purple-600/50 scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                    </span>
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-purple-300 transition-colors leading-snug">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function DracinHubPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070A] text-white flex items-center justify-center">
          <div className="text-center space-y-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 mx-auto" />
            <p className="text-xs text-rose-400 font-mono">Memuat Short Drama Hub...</p>
          </div>
        </div>
      }
    >
      <DracinHubContent />
    </Suspense>
  );
}
