"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Maximize2,
  Film,
  Play,
  Server,
  Star,
  Calendar,
  Clock,
  User,
  AlertCircle,
  ExternalLink,
  Tv,
  PictureInPicture2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import { VidboxDetail } from "@/lib/services/vidboxService";
import { useMiniPlayer } from "@/lib/hooks/useMiniPlayer";

function FilmWatchContent() {
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get("url") || "";
  const initialTitle = searchParams.get("title") || "";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<VidboxDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeServerIdx, setActiveServerIdx] = useState(0);

  // Series state (if TV Series)
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [episodePlayerUrl, setEpisodePlayerUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!rawUrl) return;
    setLoading(true);
    fetch(`/api/vidbox?action=detail&path=${encodeURIComponent(rawUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.detail) {
          setDetail(data.detail);
        } else {
          setError(data.error || "Gagal memuat detail film dari VidBox");
        }
      })
      .catch((err) => {
        setError(err.message || "Gagal terhubung ke server VidBox");
      })
      .finally(() => setLoading(false));
  }, [rawUrl]);

  // If TV series, fetch episode stream when season/ep changes
  useEffect(() => {
    if (detail && detail.type === "TVSeries" && rawUrl) {
      fetch(
        `/api/vidbox?action=episode&target=${encodeURIComponent(rawUrl)}&season=${selectedSeason}&ep=${selectedEpisode}`
      )
        .then((r) => r.json())
        .then((d) => {
          if (d.data?.playerSources && d.data.playerSources.length > 0) {
            setEpisodePlayerUrl(d.data.playerSources[0].url);
          } else if (d.data?.url) {
            setEpisodePlayerUrl(d.data.url);
          }
        })
        .catch(() => {});
    }
  }, [detail, rawUrl, selectedSeason, selectedEpisode]);

  const activeServerUrl =
    episodePlayerUrl ||
    detail?.servers?.[activeServerIdx]?.url ||
    "";

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const { isPipActive, togglePictureInPicture } = useMiniPlayer({
    containerRef: playerContainerRef,
    title: detail?.title || initialTitle || "VidBox Movie",
    poster: detail?.poster || "",
  });

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-red-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Floating Top Control Bar */}
      <header className="sticky top-0 z-40 bg-[#0C0C12]/95 backdrop-blur-md border-b border-white/10 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/film"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali ke VidBox</span>
            </Link>

            <div className="border-l border-white/10 pl-3">
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">
                VIDBOX HD MOVIE STREAMING
              </span>
              <h1 className="text-xs sm:text-sm font-black text-white truncate max-w-xs sm:max-w-md">
                {detail?.title || initialTitle || "Memuat Film..."}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={togglePictureInPicture}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isPipActive
                ? "bg-red-600 text-white border-red-500 font-bold"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-200"
            }`}
            title="Mini Floating Player (Tetap tampil saat Chrome diminimalkan)"
          >
            <PictureInPicture2 className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Floating Player</span>
          </button>
        </div>
      </header>

      {/* Main Player & Detail Stage */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full space-y-6">
        {/* Loading State: Skeleton Loader */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="aspect-video w-full rounded-2xl bg-white/10 border border-white/5 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/15 mx-auto" />
                <div className="h-4 w-48 bg-white/15 rounded mx-auto" />
                <div className="h-3 w-32 bg-white/10 rounded mx-auto" />
              </div>
            </div>
            <div className="h-24 rounded-2xl bg-white/5 p-6 space-y-3">
              <div className="h-6 w-1/3 bg-white/15 rounded" />
              <div className="h-4 w-2/3 bg-white/10 rounded" />
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl bg-red-950/30 border border-red-500/30 p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Gagal Memutar Film</h2>
            <p className="text-sm text-gray-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-full bg-red-500 text-white font-bold text-xs"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Real Stream Player & Detail */}
        {!loading && detail && (
          <div className="space-y-6">
            {/* Video Player Frame */}
            <div
              ref={playerContainerRef}
              className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl"
            >
              {activeServerUrl ? (
                <iframe
                  src={activeServerUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <Play className="w-12 h-12 text-red-500" />
                  <p className="text-sm text-gray-300">
                    Pilih server aktif dari daftar server di bawah untuk memutar film ini.
                  </p>
                </div>
              )}
            </div>

            {/* Server Selector Bar for Movies */}
            {detail.type === "Movie" && detail.servers && detail.servers.length > 0 && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-red-400" />
                    <span>PILIH SERVER STREAMING REAL (VIDBOX):</span>
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {detail.servers.length} Server Tersedia
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {detail.servers.map((srv, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveServerIdx(idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        activeServerIdx === idx
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                          : "bg-[#181824] text-gray-300 hover:bg-[#202030] border border-white/5"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current" />
                      <span>{srv.name || `Server ${idx + 1}`}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Season & Episode Selector for TV Series */}
            {detail.type === "TVSeries" && detail.seasons && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-red-400" />
                    <span>PILIH SEASON &amp; EPISODE:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {detail.seasons.map((s) => (
                      <button
                        key={s.season}
                        onClick={() => {
                          setSelectedSeason(s.season);
                          setSelectedEpisode(1);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          selectedSeason === s.season
                            ? "bg-red-500 text-white"
                            : "bg-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        Season {s.season}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Episode buttons */}
                {detail.seasons.find((s) => s.season === selectedSeason) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                    {detail.seasons
                      .find((s) => s.season === selectedSeason)!
                      .episodes.map((ep) => (
                        <button
                          key={ep.episode}
                          onClick={() => setSelectedEpisode(ep.episode)}
                          className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                            selectedEpisode === ep.episode
                              ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                              : "bg-white/5 hover:bg-white/10 text-gray-300"
                          }`}
                        >
                          <div className="font-bold">Ep {ep.episode}</div>
                          <div className="text-[10px] truncate opacity-80">{ep.title}</div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Film Overview & Metadata Card */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#12121A] border border-white/10 p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
                {/* Poster */}
                {detail.poster && (
                  <div className="w-28 sm:w-44 md:w-48 aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden bg-black/60 shrink-0 border border-white/10 shadow-2xl">
                    <img
                      src={detail.poster}
                      alt={detail.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 uppercase">
                      {detail.type}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {detail.rating}
                    </span>
                    {detail.release_date && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {detail.release_date}
                      </span>
                    )}
                    {detail.duration && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {detail.duration}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white break-words leading-tight">{detail.title}</h2>

                  {/* Genres */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {detail.genres.map((g, i) => (
                      <span
                        key={i}
                        className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/5"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Synopsis */}
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-2 break-words line-clamp-3 sm:line-clamp-none">
                    {detail.synopsis}
                  </p>

                  {/* Cast & Director */}
                  <div className="space-y-1 pt-3 text-xs text-gray-400 border-t border-white/5">
                    {detail.director && (
                      <p>
                        <span className="text-gray-200 font-bold">Sutradara:</span> {detail.director}
                      </p>
                    )}
                    {detail.actors && detail.actors.length > 0 && (
                      <p className="line-clamp-2">
                        <span className="text-gray-200 font-bold">Pemeran:</span>{" "}
                        {detail.actors.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function FilmWatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070A] text-white flex items-center justify-center">
          <div className="text-center space-y-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-red-500/20 mx-auto" />
            <p className="text-xs text-red-400 font-mono">Memuat VidBox Player...</p>
          </div>
        </div>
      }
    >
      <FilmWatchContent />
    </Suspense>
  );
}
