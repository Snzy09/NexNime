"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import {
  Play,
  Star,
  Tv,
  ChevronLeft,
  ChevronRight,
  Server,
  Download,
  Share2,
  Bookmark,
  Sun,
  Moon,
  Maximize2,
} from "lucide-react";
import { REAL_ANIME_POPULAR } from "@/lib/services/realDataFallback";

export default function AnimeDetailPage({ params }: { params: { slug: string } }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedEpIndex, setSelectedEpIndex] = useState(0);
  const [servers, setServers] = useState<{ name: string; url: string }[]>([]);
  const [selectedServer, setSelectedServer] = useState(0);
  const [streamLoading, setStreamLoading] = useState(false);
  const [lightsOff, setLightsOff] = useState(false);
  const [animeData, setAnimeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/anime?action=detail&slug=${params.slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.detail) {
          setAnimeData(d.detail);
        } else {
          // fallback
          const found =
            REAL_ANIME_POPULAR.find((a) => a.slug === params.slug) || REAL_ANIME_POPULAR[0];
          setAnimeData({
            title: found.title,
            slug: found.slug,
            poster: found.poster,
            synopsis: found.info,
            genres: found.genres || ["Action", "Fantasy", "Shounen"],
            facts: { Tipe: found.type || "TV", Status: found.status || "Ongoing", Skor: found.rating || "9.5" },
            total_episode: 24,
            episodes: Array.from({ length: 24 }, (_, i) => ({
              episode: `Episode ${i + 1}`,
              url: `${found.url}episode-${i + 1}`,
            })),
          });
        }
      })
      .catch(() => {
        const found =
          REAL_ANIME_POPULAR.find((a) => a.slug === params.slug) || REAL_ANIME_POPULAR[0];
        setAnimeData({
          title: found.title,
          slug: found.slug,
          poster: found.poster,
          synopsis: found.info,
          genres: found.genres || ["Action", "Fantasy", "Shounen"],
          facts: { Tipe: found.type || "TV", Status: found.status || "Ongoing", Skor: found.rating || "9.5" },
          total_episode: 24,
          episodes: Array.from({ length: 24 }, (_, i) => ({
            episode: `Episode ${i + 1}`,
            url: `${found.url}episode-${i + 1}`,
          })),
        });
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  // Load real stream for currently selected episode
  useEffect(() => {
    if (!animeData?.episodes || animeData.episodes.length === 0) return;
    const currentEp = animeData.episodes[selectedEpIndex] || animeData.episodes[0];
    if (!currentEp?.url) return;

    setStreamLoading(true);
    fetch(`/api/anime?action=watch&watchUrl=${encodeURIComponent(currentEp.url)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.stream?.streams && d.stream.streams.length > 0) {
          setServers(d.stream.streams);
          setSelectedServer(0);
        } else {
          setServers([{ name: "Server Sumber", url: currentEp.url }]);
          setSelectedServer(0);
        }
      })
      .catch(() => {
        setServers([{ name: "Server Sumber", url: currentEp.url }]);
        setSelectedServer(0);
      })
      .finally(() => setStreamLoading(false));
  }, [animeData, selectedEpIndex]);

  if (loading || !animeData) {
    return (
      <div className="min-h-screen bg-[#09090D] text-white flex items-center justify-center">
        <div className="text-amber-400 font-bold animate-pulse text-lg">Memuat tayangan anime...</div>
      </div>
    );
  }

  const currentEp = animeData.episodes?.[selectedEpIndex] || animeData.episodes?.[0];
  const currentEpisodeNumber = currentEp?.episode || `Episode ${selectedEpIndex + 1}`;

  return (
    <div
      className={`min-h-screen text-white flex flex-col transition-colors duration-300 ${
        lightsOff ? "bg-black" : "bg-[#09090D]"
      }`}
    >
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-amber-300">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/anime" className="hover:text-amber-300">
            Anime
          </Link>
          <span>/</span>
          <span className="text-amber-400 truncate max-w-xs">{animeData.title}</span>
        </div>

        {/* Streaming Video Player Container */}
        <div className="rounded-2xl overflow-hidden bg-[#0D0D14] border border-white/10 shadow-2xl">
          {/* Top Bar Video Controls */}
          <div className="p-3 bg-[#13131D] border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <Tv className="w-4 h-4 text-amber-400" />
              <span>
                {animeData.title} — {currentEpisodeNumber}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLightsOff(!lightsOff)}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-1 transition-colors"
              >
                {lightsOff ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{lightsOff ? "Lights On" : "Lights Off"}</span>
              </button>

              <button
                onClick={() => setSelectedEpIndex((prev) => Math.max(0, prev - 1))}
                disabled={selectedEpIndex <= 0}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>

              <button
                onClick={() =>
                  setSelectedEpIndex((prev) =>
                    Math.min((animeData.episodes?.length || 1) - 1, prev + 1)
                  )
                }
                disabled={selectedEpIndex >= (animeData.episodes?.length || 1) - 1}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Video Player Display Frame (16:9) */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center">
            {streamLoading ? (
              <div className="flex flex-col items-center gap-3 text-amber-400">
                <Play className="w-10 h-10 animate-pulse fill-amber-400" />
                <span className="text-sm font-semibold tracking-wide">Menyiapkan streaming video...</span>
              </div>
            ) : servers.length > 0 && servers[selectedServer]?.url ? (
              <iframe
                src={servers[selectedServer].url}
                title={`Streaming ${animeData.title} ${currentEpisodeNumber}`}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-full border-0"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <Tv className="w-10 h-10 text-amber-400/60" />
                <p className="text-sm text-gray-300">Video siap diputar di pemutar sumber resmi.</p>
                {currentEp?.url && (
                  <a
                    href={currentEp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors shadow-lg"
                  >
                    Buka Video di Sumber Resmi
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Server Selector Bar */}
          <div className="p-3 bg-[#13131D] border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-gray-400 flex items-center gap-1 mr-1">
                <Server className="w-3.5 h-3.5 text-amber-400" /> Pilihan Server:
              </span>
              {servers.map((srv, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedServer(idx)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    selectedServer === idx
                      ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {srv.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              {currentEp?.url && (
                <a
                  href={currentEp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" /> Sumber Resmi
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content Details & Episode Selector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Anime Synopsis & Info (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl bg-[#121218] border border-white/10 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-32 sm:w-36 aspect-[2/3] rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10 shadow-lg">
                <img
                  src={animeData.poster}
                  alt={animeData.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://static.anipop.xyz/poster/anime/jujutsu-kaisen-2nd-season.jpg?h=400";
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {animeData.facts?.Status || "Ongoing"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {animeData.facts?.Skor || "9.5"}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                    Tipe: {animeData.facts?.Tipe || "TV"}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-white">{animeData.title}</h1>

                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  {animeData.genres?.map((g: string, i: number) => (
                    <span
                      key={i}
                      className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/5"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mt-4">
                  {animeData.synopsis}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Episode Playlist Drawer (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-[#121218] border border-white/10 p-5 flex flex-col max-h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-400" />
                <span>Daftar Episode ({animeData.episodes?.length || animeData.total_episode || 0})</span>
              </h3>
              <span className="text-xs text-emerald-400 font-semibold">Sub Indo</span>
            </div>

            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {(animeData.episodes && animeData.episodes.length > 0
                ? animeData.episodes
                : Array.from({ length: animeData.total_episode || 1 }, (_, i) => ({
                    episode: `Episode ${i + 1}`,
                    url: "",
                  }))
              ).map((ep: any, idx: number) => {
                const isActive = selectedEpIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedEpIndex(idx)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      isActive
                        ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20"
                        : "bg-white/5 hover:bg-white/10 text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <Play className={`w-3.5 h-3.5 shrink-0 ${isActive ? "fill-black" : "text-amber-400"}`} />
                      <span className="truncate">{ep.episode}</span>
                    </div>
                    <span className={`text-[10px] shrink-0 ${isActive ? "text-black font-bold" : "text-gray-500"}`}>HD</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
