"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  Tv,
  BookOpen,
  Clapperboard,
  Video,
  Loader2,
  Film,
  BookMarked,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { UniversalSearchItem } from "@/app/api/search/route";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_QUERIES = [
  "Solo Leveling",
  "Jujutsu Kaisen",
  "Magic Emperor",
  "Keluar dari Tim",
  "Doctor X",
  "One Piece",
  "Billionaire",
  "Queen of Tears",
];

const CATEGORY_SHORTCUTS = [
  { label: "Anime & Donghua", href: "/anime", icon: Tv, color: "text-amber-400" },
  { label: "Drama Pendek (9:16)", href: "/dracin", icon: Video, color: "text-rose-400" },
  { label: "Drakor Asia", href: "/drakor", icon: Clapperboard, color: "text-blue-400" },
  { label: "Manga & Komik", href: "/manga", icon: BookOpen, color: "text-emerald-400" },
  { label: "Film Movie", href: "/film", icon: Film, color: "text-red-400" },
  { label: "Light Novel", href: "/novel", icon: BookMarked, color: "text-emerald-400" },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewItems, setPreviewItems] = useState<UniversalSearchItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Handle ESC key and Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Instant preview fetch (debounced)
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setPreviewItems([]);
      setTotalCount(0);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=3`);
        const data = await res.json();
        if (data.results) {
          // Flatten top previews across categories
          const combined: UniversalSearchItem[] = [
            ...(data.results.anime || []).slice(0, 2),
            ...(data.results.dracin || []).slice(0, 2),
            ...(data.results.drakor || []).slice(0, 2),
            ...(data.results.manga || []).slice(0, 2),
            ...(data.results.film || []).slice(0, 2),
            ...(data.results.novel || []).slice(0, 2),
          ];
          setPreviewItems(combined.slice(0, 6));
          setTotalCount(data.total || 0);
        }
      } catch (err) {
        console.error("Preview search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const navigateToSearchPage = (targetQuery?: string) => {
    const q = (targetQuery !== undefined ? targetQuery : query).trim();
    if (!q) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToSearchPage();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md transition-all animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#12121A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Universal Search Form */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari film, anime, drama ReelShort, NetShort, drakor, manga, atau dracin..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm sm:text-base"
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
          ) : query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 px-2 py-1 rounded border border-white/10"
            >
              ESC
            </button>
          )}

          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-md shadow-amber-400/20 transition-all flex items-center gap-1 shrink-0"
          >
            <span>Cari</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {query.trim().length === 0 ? (
            <div className="py-4 space-y-5">
              {/* Popular Searches */}
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2.5 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Pencarian Populer
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {POPULAR_QUERIES.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => navigateToSearchPage(tag)}
                      className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-amber-400/10 border border-white/10 hover:border-amber-400/40 text-gray-300 hover:text-amber-300 transition-colors font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Quick Links */}
              <div className="pt-3 border-t border-white/5">
                <p className="text-xs font-semibold text-gray-400 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Jelajahi Kategori
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORY_SHORTCUTS.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.label}
                        href={cat.href}
                        onClick={onClose}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all text-xs font-medium text-gray-300 hover:text-white"
                      >
                        <Icon className={`w-4 h-4 ${cat.color} shrink-0`} />
                        <span className="truncate">{cat.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Primary Universal Search Action Card */}
              <button
                type="button"
                onClick={() => navigateToSearchPage()}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-400/15 via-amber-400/10 to-transparent border border-amber-400/30 hover:border-amber-400/60 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-black flex items-center justify-center shrink-0 shadow-md shadow-amber-400/20">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white truncate">
                      Cari &quot;<span className="text-amber-300">{query}</span>&quot; di Semua Kategori
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      Buka halaman hasil pencarian universal (Anime, Dracin, Drakor, Manga, Film, Novel)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs shrink-0 pl-2">
                  <span className="hidden sm:inline">Lihat Hasil</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Instant Suggestions Preview */}
              {previewItems.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Pratinjau Instan ({totalCount} total ditemukan)
                    </p>
                    <button
                      type="button"
                      onClick={() => navigateToSearchPage()}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Lihat Semua →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {previewItems.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all group"
                      >
                        <div className="w-10 h-14 rounded-lg overflow-hidden bg-black/60 shrink-0 relative">
                          {item.cover ? (
                            <img
                              src={item.cover}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400 p-1 text-center">
                              NN
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1">
                            <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-semibold">
                              {item.provider}
                            </span>
                            {item.badge && <span className="truncate">{item.badge}</span>}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback when no instant preview yet */}
              {!loading && previewItems.length === 0 && (
                <div className="text-center py-6 text-xs text-gray-400">
                  Tekan <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono">Enter</kbd> untuk mencari &quot;{query}&quot; di seluruh provider.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
