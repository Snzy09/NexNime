"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Trash2,
  Tv,
  Film,
  Clapperboard,
  Video,
  BookOpen,
  BookMarked,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import {
  WatchlistItem,
  WatchlistCategory,
  getWatchlist,
  removeFromWatchlist,
  clearWatchlist,
} from "@/lib/services/watchlistService";

const CATEGORY_TABS: { key: WatchlistCategory; label: string; icon: any }[] = [
  { key: "all", label: "Semua", icon: Layers },
  { key: "anime", label: "Anime", icon: Tv },
  { key: "donghua", label: "Donghua", icon: Sparkles },
  { key: "drakor", label: "Drakor", icon: Clapperboard },
  { key: "dracin", label: "Dracin", icon: Video },
  { key: "manga", label: "Manga", icon: BookOpen },
  { key: "novel", label: "Novel", icon: BookMarked },
  { key: "film", label: "Film", icon: Film },
];

export default function BookmarkPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<WatchlistCategory>("all");
  const [mounted, setMounted] = useState(false);

  const loadItems = () => {
    setItems(getWatchlist());
  };

  useEffect(() => {
    setMounted(true);
    loadItems();

    const handleUpdate = () => {
      loadItems();
    };

    window.addEventListener("nexnime_watchlist_updated", handleUpdate);
    return () => window.removeEventListener("nexnime_watchlist_updated", handleUpdate);
  }, []);

  const filteredItems = items.filter((item) => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWatchlist(id);
  };

  const handleClearAll = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua daftar favorit?")) {
      clearWatchlist();
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "anime":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "donghua":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "drakor":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "dracin":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "manga":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "novel":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-white/10 text-gray-300 border-white/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-amber-400 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30 shadow-lg shadow-amber-400/10">
                <Bookmark className="w-4 h-4 fill-current" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Favorit & Daftar Tontonan
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
                {items.length}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Koleksi judul anime, donghua, drakor, dracin, dan komik yang Anda simpan untuk dinikmati nanti.
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan Semua</span>
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.key === "all"
                ? items.length
                : items.filter((x) => x.category === tab.key).length;
            const isSelected = selectedCategory === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 border transition-all ${
                  isSelected
                    ? "bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20"
                    : "bg-[#12121A] hover:bg-[#181824] text-gray-400 hover:text-white border-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-black/20 text-black" : "bg-white/10 text-gray-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Watchlist Grid */}
        {!mounted ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white/5 rounded-2xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-white/5 text-amber-400 flex items-center justify-center mx-auto border border-white/10 shadow-xl">
              <Bookmark className="w-8 h-8 opacity-60" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {items.length === 0
                ? "Daftar Favorit Anda Masih Kosong"
                : "Tidak ada judul di kategori ini"}
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Jelajahi tayangan anime, drakor, dracin, atau komik lalu klik tombol Bookmark untuk menyimpannya di sini.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <Link
                href="/anime"
                className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"
              >
                Eksplor Anime
              </Link>
              <Link
                href="/drakor"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
              >
                Eksplor Drakor
              </Link>
              <Link
                href="/manga"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
              >
                Eksplor Manga
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-[#12121A] border border-white/5 overflow-hidden hover:border-amber-400/40 transition-all duration-200 flex flex-col shadow-lg"
              >
                {/* Poster & Actions */}
                <Link href={item.url} className="relative aspect-[3/4] w-full bg-[#181824] overflow-hidden block">
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <Tv className="w-10 h-10 opacity-40" />
                    </div>
                  )}

                  {/* Gradient bottom overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Category Pill */}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-md ${getCategoryBadge(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Quick Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, item.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center backdrop-blur-md transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100 shadow-md"
                    title="Hapus dari Favorit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Total Episodes badge */}
                  {item.totalEpisodes && (
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[10px] font-bold text-gray-300 bg-black/70 px-2 py-0.5 rounded-md backdrop-blur-md">
                        {item.totalEpisodes}
                      </span>
                    </div>
                  )}
                </Link>

                {/* Card Info */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <Link href={item.url} className="block group-hover:text-amber-300 transition-colors">
                    <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span>
                        {new Date(item.addedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </span>

                    <Link
                      href={item.url}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                    >
                      <span>Buka</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
