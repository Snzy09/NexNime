"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Tv,
  Server,
  ListOrdered,
  AlertCircle,
  Sparkles,
  Loader2,
  Compass,
  Download,
  Share2,
  ExternalLink,
  Film,
  PictureInPicture2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import { useMiniPlayer } from "@/lib/hooks/useMiniPlayer";
import {
  AnimeSailEpisodeDetail,
  AnimeSailAnimeDetail,
  AnimeSailEmbed,
} from "@/lib/services/animesailService";

function AnimeSailWatchContent() {
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get("url") || "";
  const initialTitle = searchParams.get("title") || "";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [episodeData, setEpisodeData] = useState<AnimeSailEpisodeDetail | null>(null);
  const [animeDetail, setAnimeDetail] = useState<AnimeSailAnimeDetail | null>(null);
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch episode data & anime detail
  useEffect(() => {
    if (!rawUrl) return;

    setLoading(true);
    setError(null);

    // 1. Fetch Episode info and embeds
    fetch(`/api/animesail?action=episode&url=${encodeURIComponent(rawUrl)}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.success && data.episode) {
          const ep: AnimeSailEpisodeDetail = data.episode;
          setEpisodeData(ep);
          setActiveServerIndex(0);

          // 2. If episode has animeUrl, fetch full episode list and synopsis
          if (ep.animeUrl) {
            try {
              const resDet = await fetch(
                `/api/animesail?action=detail&url=${encodeURIComponent(ep.animeUrl)}`
              );
              const detData = await resDet.json();
              if (detData.success && detData.detail) {
                setAnimeDetail(detData.detail);
              }
            } catch (err) {
              console.warn("Could not fetch full anime detail:", err);
            }
          }
        } else {
          setError(data.error || "Gagal memuat video episode AnimeSail");
        }
      })
      .catch((err) => {
        setError(err.message || "Gagal terhubung ke scraper AnimeSail");
      })
      .finally(() => setLoading(false));
  }, [rawUrl]);

  const activeServer: AnimeSailEmbed | null =
    episodeData?.embeds && episodeData.embeds[activeServerIndex]
      ? episodeData.embeds[activeServerIndex]
      : null;

  const streamSrc = activeServer?.iframe || activeServer?.streamUrl || "";
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const { isPipActive, togglePictureInPicture } = useMiniPlayer({
    containerRef: playerContainerRef,
    title: episodeData?.title || initialTitle || "AnimeSail Streaming",
    poster: animeDetail?.thumbnail || "",
  });

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-sky-500 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <Link
            href="/animesail"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg bg-white/5 border border-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Katalog AnimeSail</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 text-xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              AnimeSail Live Stream
            </span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="aspect-video w-full rounded-2xl bg-[#13131A] border border-white/5 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-sky-400 animate-spin mb-2" />
              <p className="text-sm text-gray-400">Memuat Pemutar Video AnimeSail HD...</p>
            </div>
            <div className="h-8 bg-white/5 rounded-xl w-1/2" />
            <div className="h-4 bg-white/5 rounded-lg w-3/4" />
          </div>
        ) : error || !episodeData ? (
          <div className="p-8 rounded-2xl bg-red-950/20 border border-red-500/30 text-center my-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Gagal Memutar Video</h3>
            <p className="text-xs text-gray-300 mb-4">{error || "Data tidak ditemukan"}</p>
            <Link
              href="/animesail"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-black font-semibold text-xs hover:bg-sky-400 transition-colors"
            >
              Kembali ke Katalog AnimeSail
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Video Player Section */}
            <div
              ref={playerContainerRef}
              className="rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl relative"
            >
              {streamSrc ? (
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    key={streamSrc}
                    src={streamSrc}
                    title={episodeData.title}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full flex flex-col items-center justify-center text-center p-6 bg-[#0E0E14]">
                  <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                  <p className="text-sm font-semibold text-white">Stream embed tidak tersedia di server ini</p>
                  <p className="text-xs text-gray-400 mt-1">Silakan coba pilih server lain di bawah ini.</p>
                </div>
              )}

              {/* Server Switcher Bar */}
              {episodeData.embeds && episodeData.embeds.length > 0 && (
                <div className="bg-[#12121A] p-3 sm:p-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Server className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-gray-200">Pilih Server:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {episodeData.embeds.map((emb, idx) => (
                      <button
                        key={`${emb.server}-${idx}`}
                        onClick={() => setActiveServerIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          activeServerIndex === idx
                            ? "bg-sky-500 text-black shadow-md shadow-sky-500/30"
                            : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5"
                        }`}
                      >
                        {emb.server || `Server ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Episode Title & Navigation Controls */}
            <div className="rounded-2xl bg-[#111118] border border-white/5 p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-white">
                    {episodeData.title || initialTitle}
                  </h1>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                    <span className="text-sky-400 font-semibold">AnimeSail Player</span>
                    <span>•</span>
                    <span>Server aktif: {activeServer?.server || "Default"}</span>
                  </p>
                </div>

                {/* Prev / Next & Share Buttons */}
                <div className="flex items-center gap-2">
                  {episodeData.navigation.prev && (
                    <Link
                      href={`/animesail/watch?url=${encodeURIComponent(
                        episodeData.navigation.prev
                      )}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 border border-white/10 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Prev Ep</span>
                    </Link>
                  )}

                  {episodeData.navigation.next && (
                    <Link
                      href={`/animesail/watch?url=${encodeURIComponent(
                        episodeData.navigation.next
                      )}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-black transition-colors"
                    >
                      <span>Next Ep</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={togglePictureInPicture}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                      isPipActive
                        ? "bg-sky-500 text-black border-sky-400 font-bold"
                        : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-200"
                    }`}
                    title="Mini Floating Player (Tetap tampil saat Chrome diminimalkan)"
                  >
                    <PictureInPicture2 className="w-4 h-4 text-sky-400" />
                    <span className="hidden sm:inline">Floating Player</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
                    title="Salin tautan"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {copied && (
                    <span className="text-[10px] text-sky-400 font-semibold">Tersalin!</span>
                  )}
                </div>
              </div>

              {/* Anime Overview if fetched */}
              {animeDetail && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                  {/* Poster & Quick Info */}
                  <div className="md:col-span-1 space-y-3">
                    {animeDetail.thumbnail && (
                      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-black/40 border border-white/10">
                        <img
                          src={animeDetail.thumbnail}
                          alt={animeDetail.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-1.5 text-xs">
                      {Object.entries(animeDetail.metadata).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-gray-300">
                          <span className="text-gray-400">{k}:</span>
                          <span className="font-medium text-right text-sky-200 line-clamp-1">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Synopsis & Episode Drawer */}
                  <div className="md:col-span-3 space-y-4">
                    {animeDetail.synopsis && (
                      <div>
                        <h3 className="text-sm font-bold text-white mb-1.5">Sinopsis Anime</h3>
                        <p className="text-xs text-gray-300 leading-relaxed max-h-36 overflow-y-auto pr-2 scrollbar-thin">
                          {animeDetail.synopsis}
                        </p>
                      </div>
                    )}

                    {/* All Episodes Drawer Grid */}
                    {animeDetail.episodes && animeDetail.episodes.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <ListOrdered className="w-4 h-4 text-sky-400" />
                            <span>Daftar Semua Episode ({animeDetail.episodes.length})</span>
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                          {animeDetail.episodes.map((ep, i) => {
                            const isCurrent =
                              ep.url === episodeData.url ||
                              (rawUrl && ep.url.includes(rawUrl.replace(/https?:\/\/[^\/]+/, "")));

                            return (
                              <Link
                                key={`${ep.url}-${i}`}
                                href={`/animesail/watch?url=${encodeURIComponent(
                                  ep.url
                                )}&title=${encodeURIComponent(ep.title)}`}
                                className={`p-2.5 rounded-xl text-xs font-medium transition-all text-left flex items-center justify-between border ${
                                  isCurrent
                                    ? "bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm"
                                    : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/5 hover:border-white/10"
                                }`}
                              >
                                <span className="line-clamp-1">
                                  {ep.episode ? `Episode ${ep.episode}` : ep.title}
                                </span>
                                {isCurrent && (
                                  <span className="w-2 h-2 rounded-full bg-sky-400 ml-1.5 flex-shrink-0 animate-ping" />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Download Links Table */}
              {episodeData.downloads && Object.keys(episodeData.downloads).length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Tautan Download Episode (AnimeSail CDN)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(episodeData.downloads).map(([quality, links]) => (
                      <div
                        key={quality}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2"
                      >
                        <span className="text-xs font-bold text-sky-300 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/20">
                          {quality}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {links.map((link, lIdx) => (
                            <a
                              key={`${link.server}-${lIdx}`}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-[#181824] hover:bg-sky-500 hover:text-black text-[11px] font-semibold text-gray-300 transition-colors flex items-center gap-1 border border-white/5"
                            >
                              <span>{link.server}</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function AnimeSailWatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070A] flex items-center justify-center text-sky-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <AnimeSailWatchContent />
    </Suspense>
  );
}
