"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, Tv, BookOpen, Clapperboard, Video, Loader2, Film, Compass, Heart } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "film" | "anime" | "samehadaku" | "animesail" | "animexin" | "oppadrama" | "reelshort" | "netshort" | "drakor" | "dracin" | "manga" | "novel">("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    film: any[];
    anime: any[];
    samehadaku: any[];
    animesail: any[];
    animexin: any[];
    donghuafilm: any[];
    oppadrama: any[];
    reelshort: any[];
    netshort: any[];
    manga: any[];
    novel: any[];
    drakor: any[];
    dracin: any[];
  }>({ film: [], anime: [], samehadaku: [], animesail: [], animexin: [], donghuafilm: [], oppadrama: [], reelshort: [], netshort: [], manga: [], novel: [], drakor: [], dracin: [] });

  // Handle ESC key and Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ film: [], anime: [], samehadaku: [], animesail: [], animexin: [], donghuafilm: [], oppadrama: [], reelshort: [], netshort: [], manga: [], novel: [], drakor: [], dracin: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [resFilm, resAnime, resSamehadaku, resDonghuaFilm, resAnimeSail, resAnimeXin, resOppaDrama, resReelShort, resNetShort, resManga, resNovel, resDrakor, resDracin] = await Promise.all([
          fetch(`/api/vidbox?action=search&q=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => ({ items: [] })),
          fetch(`/api/anime?action=search&q=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => ({ items: [] })),
          fetch(`/api/samehadaku?action=search&q=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => ({ items: [] })),
          fetch(`/api/donghuafilm?action=search&q=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => ({ items: [] })),
          fetch(`/api/animesail?action=search&q=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => ({ items: [] })),
          fetch(`/api/animexin?action=search&q=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => ({ items: [] })),
          fetch(`/api/oppadrama?action=search&q=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => ({ items: [] })),
          fetch(`/api/reelshort?action=search&q=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => ({ items: [] })),
          fetch(`/api/netshort?action=search&q=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => ({ items: [] })),
          fetch(`/api/manga?action=search&q=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => ({ items: [] })),
          fetch(`/api/novel?action=search&q=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => ({ items: [] })),
          fetch(`/api/drakor?action=search&q=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => ({ items: [] })),
          fetch(`/api/dracin?action=search&q=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => ({ items: [] })),
        ]);

        setResults({
          film: resFilm.items || [],
          anime: resAnime.items || [],
          samehadaku: resSamehadaku.items || [],
          donghuafilm: resDonghuaFilm.items || [],
          animesail: resAnimeSail.items || [],
          animexin: resAnimeXin.items || [],
          oppadrama: resOppaDrama.items || [],
          reelshort: resReelShort.items || [],
          netshort: resNetShort.items || [],
          manga: resManga.items || [],
          novel: resNovel.items || [],
          drakor: resDrakor.items || [],
          dracin: resDracin.items || [],
        });
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.film.length +
    results.anime.length +
    results.samehadaku.length +
    results.donghuafilm.length +
    results.animesail.length +
    results.animexin.length +
    results.oppadrama.length +
    results.reelshort.length +
    results.netshort.length +
    results.manga.length +
    results.novel.length +
    results.drakor.length +
    results.dracin.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md transition-all">
      <div
        className="relative w-full max-w-2xl bg-[#12121A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari film, anime, drama ReelShort, NetShort, drakor, manga, atau dracin..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-base sm:text-lg"
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 px-2 py-1 rounded"
            >
              ESC
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-2 border-b border-white/5 bg-[#0D0D14] flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              activeTab === "all" ? "bg-amber-400 text-black font-semibold" : "text-gray-400 hover:text-white"
            }`}
          >
            Semua ({totalResults})
          </button>
          <button
            onClick={() => setActiveTab("reelshort")}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
              activeTab === "reelshort" ? "bg-rose-500 text-white font-semibold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Video className="w-3 h-3 text-rose-500" /> ReelShort ({results.reelshort.length})
          </button>
          <button
            onClick={() => setActiveTab("netshort")}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
              activeTab === "netshort" ? "bg-purple-600 text-white font-semibold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Video className="w-3 h-3 text-purple-400" /> NetShort ({results.netshort.length})
          </button>
          <button
            onClick={() => setActiveTab("animexin")}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
              activeTab === "animexin" ? "bg-cyan-500 text-black font-semibold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Tv className="w-3 h-3 text-cyan-400" /> AnimeXin ({results.animexin.length})
          </button>
          <button
            onClick={() => setActiveTab("animesail")}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
              activeTab === "animesail" ? "bg-sky-500 text-black font-semibold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Compass className="w-3 h-3 text-sky-400" /> AnimeSail ({results.animesail.length})
          </button>
          <button
            onClick={() => setActiveTab("oppadrama")}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
              activeTab === "oppadrama" ? "bg-fuchsia-500 text-black font-semibold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Heart className="w-3 h-3 text-fuchsia-400" /> OppaDrama ({results.oppadrama.length})
          </button>
          <button
            onClick={() => setActiveTab("film")}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
              activeTab === "film" ? "bg-red-500 text-white font-semibold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Film className="w-3 h-3 text-red-500" /> Film ({results.film.length})
          </button>
          <button
            onClick={() => setActiveTab("anime")}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
              activeTab === "anime" ? "bg-amber-400 text-black font-semibold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Tv className="w-3 h-3" /> Anime ({results.anime.length})
          </button>
          <button
            onClick={() => setActiveTab("samehadaku")}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
              activeTab === "samehadaku" ? "bg-amber-400 text-black font-semibold" : "text-gray-400 hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Samehadaku ({results.samehadaku.length})
          </button>
          <button
            onClick={() => setActiveTab("manga")}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
              activeTab === "manga" ? "bg-emerald-500 text-black font-semibold" : "text-gray-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3 h-3" /> Manga ({results.manga.length})
          </button>
          <button
            onClick={() => setActiveTab("novel")}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
              activeTab === "novel" ? "bg-emerald-500 text-black font-semibold" : "text-gray-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3 h-3 text-emerald-400" /> Novel ({results.novel.length})
          </button>
          <button
            onClick={() => setActiveTab("drakor")}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
              activeTab === "drakor" ? "bg-amber-400 text-black font-semibold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Clapperboard className="w-3 h-3" /> Drakor ({results.drakor.length})
          </button>
          <button
            onClick={() => setActiveTab("dracin")}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-colors ${
              activeTab === "dracin" ? "bg-amber-400 text-black font-semibold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Video className="w-3 h-3" /> Dracin ({results.dracin.length})
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {query.trim().length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              <p>Ketik kata kunci untuk mencari ribuan judul...</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span className="text-xs text-gray-600">Populer:</span>
                {["Solo Leveling", "Jujutsu Kaisen", "Magic Emperor", "Keluar dari Tim", "Doctor X"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-amber-300"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 && !loading ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              Tidak ada hasil yang ditemukan untuk &quot;{query}&quot;.
            </div>
          ) : (
            <>
              {/* ReelShort Results */}
              {(activeTab === "all" || activeTab === "reelshort") && results.reelshort.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-rose-500" /> ReelShort Drama (9:16)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.reelshort.map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/reelshort/watch?id=${item.book_id}&title=${encodeURIComponent(item.title)}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 transition-colors group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-black/50 shrink-0">
                          {item.cover && (
                            <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-rose-300">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="text-rose-400 font-semibold">9:16 Reel</span>
                            <span>•</span>
                            <span>{item.total_episodes || "Full"} Eps</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* NetShort Results */}
              {(activeTab === "all" || activeTab === "netshort") && results.netshort.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-purple-400" /> NetShort Drama (9:16)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.netshort.map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/netshort/watch?slug=${item.slug}&title=${encodeURIComponent(item.title)}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 transition-colors group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-black/50 shrink-0">
                          {item.cover ? (
                            <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-purple-950/40 text-[9px] text-purple-300 text-center p-1">
                              NetShort
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-purple-300">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="text-purple-400 font-semibold">9:16 Reel</span>
                            <span>•</span>
                            <span>Direct MP4</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Film VidBox Results */}
              {(activeTab === "all" || activeTab === "film") && results.film.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" /> Film &amp; Movie (VidBox)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.film.map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/film/watch?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 transition-colors group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-black/50 shrink-0">
                          {item.poster && (
                            <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-red-300">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="text-amber-400 font-semibold">★ {item.rating || "8.5"}</span>
                            <span>•</span>
                            <span className="text-red-400">{item.year || item.type || "Movie"}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Anime Results */}
              {(activeTab === "all" || activeTab === "anime") && results.anime.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5" /> Anime
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.anime.map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/anime/${item.slug || "view"}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-black/50 shrink-0">
                          {item.poster && (
                            <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-amber-300">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span>{item.rating || "★ 8.5"}</span>
                            <span>•</span>
                            <span className="text-emerald-400">{item.episode || "TV"}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Samehadaku Live Results */}
              {(activeTab === "all" || activeTab === "samehadaku") && results.samehadaku.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Samehadaku (Live Scrape)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.samehadaku.map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/samehadaku/${item.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-amber-400/10 border border-white/5 hover:border-amber-400/30 transition-colors group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-black/50 shrink-0">
                          {item.thumb ? (
                            <img src={item.thumb} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#181824]">
                              <Tv className="w-5 h-5 text-amber-400/50" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-amber-300">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="text-amber-400 font-semibold">{item.type || "Samehadaku"}</span>
                            <span>•</span>
                            <span className="text-emerald-400">{item.status || "Live"}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* AnimeXin Donghua Results */}
              {(activeTab === "all" || activeTab === "animexin") && results.animexin.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-cyan-400" /> AnimeXin (Donghua Sub Indo)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.animexin.map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/animexin/watch?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-colors group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-black/50 shrink-0">
                          {item.poster ? (
                            <img
                              src={
                                item.poster.startsWith("http")
                                  ? `/api/animexin?action=image&url=${encodeURIComponent(item.poster)}`
                                  : item.poster
                              }
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-cyan-950/40 text-[9px] text-cyan-300 text-center p-1">
                              Donghua
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-cyan-300">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="text-cyan-400 font-semibold">{item.type || "Donghua"}</span>
                            <span>•</span>
                            <span className="text-amber-400">{item.episode || "ONA"}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* DonghuaFilm Results */}
              {(activeTab === "all" || activeTab === "anime") && results.donghuafilm.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-amber-400" /> DonghuaFilm HD (Live Sub Indo)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.donghuafilm.map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/donghuafilm/watch?slug=${item.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-amber-400/10 border border-white/5 hover:border-amber-400/30 transition-colors group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-black/50 shrink-0">
                          {item.poster || item.cover ? (
                            <img src={item.poster || item.cover} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-amber-950/40 text-[9px] text-amber-300 text-center p-1">
                              Donghua
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-amber-300">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="text-emerald-400 font-semibold">{item.status || "Ongoing"}</span>
                            <span>•</span>
                            <span className="text-amber-400">{item.latest_episode ? `Ep ${item.latest_episode}` : (item.type || "Donghua")}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {(activeTab === "all" || activeTab === "animesail") && results.animesail.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-sky-400" /> AnimeSail (Live Sub Indo)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.animesail.map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/animesail/watch?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-sky-500/10 border border-white/5 hover:border-sky-500/30 transition-colors group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-black/50 shrink-0">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-sky-950/40 text-[9px] text-sky-300 text-center p-1">
                              AnimeSail
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-sky-300">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="text-sky-400 font-semibold">{item.type || "Anime"}</span>
                            {item.episode && (
                              <>
                                <span>•</span>
                                <span className="text-amber-400">EP {item.episode}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* OppaDrama Results */}
              {(activeTab === "all" || activeTab === "oppadrama") && results.oppadrama.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-fuchsia-400 mb-2 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-fuchsia-400" /> OppaDrama (Drakor &amp; Film)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.oppadrama.map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/oppadrama/watch?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-fuchsia-500/10 border border-white/5 hover:border-fuchsia-500/30 transition-colors group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-black/50 shrink-0">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-fuchsia-950/40 text-[9px] text-fuchsia-300 text-center p-1">
                              OppaDrama
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-fuchsia-300">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="text-fuchsia-400 font-semibold">{item.type || "Drama"}</span>
                            {item.episode && (
                              <>
                                <span>•</span>
                                <span className="text-amber-400">{item.episode}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Manga Results */}
              {(activeTab === "all" || activeTab === "manga") && results.manga.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Manga & Manhwa
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.manga.map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/manga/${item.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-black/50 shrink-0">
                          {item.coverUrl && (
                            <img
                              src={
                                item.coverUrl.startsWith("/api/manga")
                                  ? item.coverUrl
                                  : `/api/manga?action=image&url=${encodeURIComponent(item.coverUrl)}`
                              }
                              alt={item.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-300">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="text-amber-400">{item.type || "Manhwa"}</span>
                            <span>•</span>
                            <span>{item.status || "Ongoing"}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Novel Results */}
              {(activeTab === "all" || activeTab === "novel") && results.novel.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Light Novel &amp; Web Novel (BacaLN)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.novel.map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/novel/read?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 transition-colors group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-black/50 shrink-0">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-emerald-950/40 text-[9px] text-emerald-300 text-center p-1">
                              Novel
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-300">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="text-emerald-400 font-semibold">{item.latestChapter || "BacaLN"}</span>
                            <span>•</span>
                            <span className="text-gray-400">Indonesian</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Drakor Results */}
              {(activeTab === "all" || activeTab === "drakor") && results.drakor.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1.5">
                    <Clapperboard className="w-3.5 h-3.5" /> Drama Korea (Drakor)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.drakor.map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/drakor/${item.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-black/50 shrink-0">
                          {item.poster && (
                            <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-blue-300">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="text-amber-400">★ 9.2</span>
                            <span>•</span>
                            <span className="text-blue-400">{item.episode || "Series"}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Dracin Results */}
              {(activeTab === "all" || activeTab === "dracin") && results.dracin.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Dracin Short Drama (9:16)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.dracin.map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/dracin?drama=${item.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-black/50 shrink-0">
                          {item.image && (
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-rose-300">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="text-rose-400">9:16 Shorts</span>
                            <span>•</span>
                            <span>{item.episodes || "80"} Eps</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
