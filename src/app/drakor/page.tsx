"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Clapperboard, Star, Play, Heart, AlertCircle } from "lucide-react";
import DrakorSection from "@/components/DrakorSection";
import DrakorSkeleton from "@/components/skeletons/DrakorSkeleton";
import CatalogGridSkeleton from "@/components/skeletons/CatalogGridSkeleton";
import { DrakorItem } from "@/lib/services/drakorService";
import { OppaDramaCard } from "@/lib/services/oppadramaService";

export default function DrakorHubPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"trending" | "ongoing">("trending");
  const [searchQuery, setSearchQuery] = useState("");

  // DrakorID State
  const [drakorList, setDrakorList] = useState<DrakorItem[]>([]);
  const [loadingDrakorId, setLoadingDrakorId] = useState(true);

  // OppaDrama State
  const [oppaList, setOppaList] = useState<OppaDramaCard[]>([]);
  const [loadingOppa, setLoadingOppa] = useState(true);

  // Fetch DrakorID data
  useEffect(() => {
    setLoadingDrakorId(true);
    fetch(`/api/drakor?action=${activeTab}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.items) setDrakorList(d.items);
      })
      .catch((e) => console.error("Drakor page fetch error:", e))
      .finally(() => setLoadingDrakorId(false));
  }, [activeTab]);

  // Fetch OppaDrama data
  useEffect(() => {
    setLoadingOppa(true);
    const url = searchQuery.trim()
      ? `/api/oppadrama?action=search&q=${encodeURIComponent(searchQuery.trim())}`
      : `/api/oppadrama?action=latest&page=1`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d.items && Array.isArray(d.items)) {
          // Filter to drama / series
          const seriesOnly = d.items.filter(
            (i: OppaDramaCard) => !i.type?.toLowerCase().includes("movie")
          );
          setOppaList(seriesOnly.length > 0 ? seriesOnly : d.items);
        } else {
          setOppaList([]);
        }
      })
      .catch((e) => console.error("OppaDrama fetch error:", e))
      .finally(() => setLoadingOppa(false));
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 space-y-6">
        {/* Popular Drakor Ranking Carousel */}
        {!loadingDrakorId && drakorList.length > 0 && (
          <DrakorSection items={drakorList.slice(0, 10)} />
        )}

        {/* PROVIDER 1: DRAKORID */}
        <div id="drakorid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20">
          {/* Tab Controls for DrakorID */}
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <button
                onClick={() => setActiveTab("trending")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "trending"
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                Trending Pekan Ini
              </button>
              <button
                onClick={() => setActiveTab("ongoing")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "ongoing"
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                Drama Ongoing 2026
              </button>
            </div>

            {/* Grid List with Skeleton */}
            {loadingDrakorId ? (
              <DrakorSkeleton />
            ) : drakorList.length === 0 ? (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-blue-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Tidak ada drama ditemukan</h3>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {drakorList.map((drama, idx) => (
                  <Link
                    key={idx}
                    href={`/drakor/${drama.slug}`}
                    className="group relative rounded-xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-blue-400/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/40">
                      <img
                        src={drama.poster || "https://drakorid.org/wp-content/uploads/2024/03/queen-of-tears.jpg"}
                        alt={drama.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/60" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <div className="w-10 h-10 rounded-full bg-blue-500/90 text-white flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-blue-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-400/30">
                        DRAKORID
                      </div>
                      {drama.rating && (
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-bold text-white">{drama.rating}</span>
                        </div>
                      )}
                      {drama.episode && (
                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          {drama.episode}
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col justify-between flex-1 space-y-1.5">
                      <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
                        {drama.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                        <span className="truncate">K-Drama</span>
                        <span className="text-blue-400 font-bold shrink-0">Nonton</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        {/* PROVIDER 2: OPPADRAMA */}
        <div id="oppadrama" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-fuchsia-400" />
                <span>OppaDrama - Serial Drama Korea &amp; Asia Sub Indo</span>
              </h2>
              <span className="text-xs text-gray-400">
                {loadingOppa ? "Memuat live data..." : `${oppaList.length} Judul Real`}
              </span>
            </div>


            {loadingOppa && <CatalogGridSkeleton count={12} />}

            {!loadingOppa && oppaList.length === 0 && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-fuchsia-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Tidak ada drama OppaDrama ditemukan</h3>
                <p className="text-xs text-gray-400">Coba gunakan kata kunci pencarian lain.</p>
              </div>
            )}

            {!loadingOppa && oppaList.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {oppaList.map((item, idx) => (
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
                          <Clapperboard className="w-10 h-10 text-fuchsia-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-black/40" />
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-fuchsia-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-fuchsia-400/30">
                        OPPADRAMA
                      </div>
                      {item.status && (
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
                          <span className="text-[10px] font-bold text-amber-300">{item.status}</span>
                        </div>
                      )}
                      {item.episode && (
                        <div className="absolute bottom-2 left-2 bg-fuchsia-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          {item.episode}
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col justify-between flex-1 space-y-1.5">
                      <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-fuchsia-300">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                        <span className="text-fuchsia-400">{item.type || "Series"}</span>
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
      </main>

      <Footer />
    </div>
  );
}
