"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Server,
  ListOrdered,
  AlertCircle,
  Sparkles,
  Loader2,
  Heart,
  Download,
  Share2,
  ExternalLink,
  Film,
  Tv,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import {
  OppaDramaEpisodeDetail,
  OppaDramaSeriesDetail,
  OppaDramaMirror,
} from "@/lib/services/oppadramaService";

function OppaDramaWatchContent() {
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get("url") || "";
  const initialTitle = searchParams.get("title") || "";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [episodeData, setEpisodeData] = useState<OppaDramaEpisodeDetail | null>(null);
  const [seriesDetail, setSeriesDetail] = useState<OppaDramaSeriesDetail | null>(null);
  const [activeMirrorUrl, setActiveMirrorUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!rawUrl) return;

    setLoading(true);
    setError(null);

    const isSeries = rawUrl.includes("/series/");

    if (isSeries) {
      // 1. Fetch series detail first
      fetch(`/api/oppadrama?action=detail&url=${encodeURIComponent(rawUrl)}`)
        .then((r) => r.json())
        .then(async (data) => {
          if (data.success && data.detail) {
            setSeriesDetail(data.detail);
            // If series has episodes, load the first episode
            if (data.detail.episodes && data.detail.episodes.length > 0) {
              const firstEp = data.detail.episodes[0];
              try {
                const epRes = await fetch(
                  `/api/oppadrama?action=episode&url=${encodeURIComponent(firstEp.url)}`
                );
                const epData = await epRes.json();
                if (epData.success && epData.episode) {
                  setEpisodeData(epData.episode);
                  setActiveMirrorUrl(epData.episode.streamUrl || "");
                }
              } catch (e) {
                console.warn("Failed loading first episode:", e);
              }
            }
          } else {
            setError(data.error || "Gagal memuat detail series OppaDrama");
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      // 2. Fetch episode directly
      fetch(`/api/oppadrama?action=episode&url=${encodeURIComponent(rawUrl)}`)
        .then((r) => r.json())
        .then(async (data) => {
          if (data.success && data.episode) {
            const ep: OppaDramaEpisodeDetail = data.episode;
            setEpisodeData(ep);
            setActiveMirrorUrl(ep.streamUrl || "");

            // If seriesUrl is provided in navigation, fetch series detail for episodes list
            if (ep.navigation.seriesUrl) {
              try {
                const sRes = await fetch(
                  `/api/oppadrama?action=detail&url=${encodeURIComponent(ep.navigation.seriesUrl)}`
                );
                const sData = await sRes.json();
                if (sData.success && sData.detail) {
                  setSeriesDetail(sData.detail);
                }
              } catch (err) {
                console.warn("Failed loading series detail:", err);
              }
            }
          } else {
            setError(data.error || "Gagal memuat video episode OppaDrama");
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [rawUrl]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const streamSrc = activeMirrorUrl || episodeData?.streamUrl || "";

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-fuchsia-500 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <Link
            href="/oppadrama"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg bg-white/5 border border-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Katalog OppaDrama</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-bold border border-fuchsia-500/30 text-xs flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-fuchsia-400" />
              OppaDrama Stream
            </span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="aspect-video w-full rounded-2xl bg-[#13131A] border border-white/5 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-fuchsia-400 animate-spin mb-2" />
              <p className="text-sm text-gray-400">Memuat Pemutar Video Drakor HD...</p>
            </div>
            <div className="h-8 bg-white/5 rounded-xl w-1/2" />
            <div className="h-4 bg-white/5 rounded-lg w-3/4" />
          </div>
        ) : error || (!episodeData && !seriesDetail) ? (
          <div className="p-8 rounded-2xl bg-red-950/20 border border-red-500/30 text-center my-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Gagal Memutar Drakor / Film</h3>
            <p className="text-xs text-gray-300 mb-4">{error || "Data tidak ditemukan"}</p>
            <Link
              href="/oppadrama"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-fuchsia-500 text-black font-semibold text-xs hover:bg-fuchsia-400 transition-colors"
            >
              Kembali ke Katalog OppaDrama
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Video Player */}
            <div className="rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl relative">
              {streamSrc ? (
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    key={streamSrc}
                    src={streamSrc}
                    title={episodeData?.title || seriesDetail?.title || "Video Player"}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full flex flex-col items-center justify-center text-center p-6 bg-[#0E0E14]">
                  <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                  <p className="text-sm font-semibold text-white">Stream player tidak tersedia</p>
                  <p className="text-xs text-gray-400 mt-1">Silakan pilih episode lain pada daftar di bawah.</p>
                </div>
              )}

              {/* Server / Mirror Switcher */}
              {episodeData?.mirrors && episodeData.mirrors.length > 0 && (
                <div className="bg-[#12121A] p-3 sm:p-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Server className="w-4 h-4 text-fuchsia-400" />
                    <span className="font-semibold text-gray-200">Pilih Server / Mirror:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {episodeData.streamUrl && (
                      <button
                        onClick={() => setActiveMirrorUrl(episodeData.streamUrl!)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          activeMirrorUrl === episodeData.streamUrl
                            ? "bg-fuchsia-500 text-black shadow-md shadow-fuchsia-500/30"
                            : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5"
                        }`}
                      >
                        Default Server
                      </button>
                    )}

                    {episodeData.mirrors.map((m, idx) => (
                      <button
                        key={`${m.url}-${idx}`}
                        onClick={() => setActiveMirrorUrl(m.url)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          activeMirrorUrl === m.url
                            ? "bg-fuchsia-500 text-black shadow-md shadow-fuchsia-500/30"
                            : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5"
                        }`}
                      >
                        {m.name || `Mirror ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Title & Controls */}
            <div className="rounded-2xl bg-[#111118] border border-white/5 p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-white">
                    {episodeData?.title || seriesDetail?.title || initialTitle}
                  </h1>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                    <span className="text-fuchsia-400 font-semibold">OppaDrama Scraper</span>
                    <span>•</span>
                    <span>Sub Indo</span>
                  </p>
                </div>

                {/* Prev / Next & Share Buttons */}
                <div className="flex items-center gap-2">
                  {episodeData?.navigation.prev && (
                    <Link
                      href={`/oppadrama/watch?url=${encodeURIComponent(
                        episodeData.navigation.prev
                      )}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 border border-white/10 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Prev Ep</span>
                    </Link>
                  )}

                  {episodeData?.navigation.next && (
                    <Link
                      href={`/oppadrama/watch?url=${encodeURIComponent(
                        episodeData.navigation.next
                      )}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 text-xs font-bold text-black transition-colors"
                    >
                      <span>Next Ep</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}

                  <button
                    onClick={handleShare}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
                    title="Salin tautan"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {copied && (
                    <span className="text-[10px] text-fuchsia-400 font-semibold">Tersalin!</span>
                  )}
                </div>
              </div>

              {/* Series Overview */}
              {seriesDetail && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                  {/* Poster & Metadata */}
                  <div className="md:col-span-1 space-y-3">
                    {seriesDetail.thumbnail && (
                      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-black/40 border border-white/10">
                        <img
                          src={seriesDetail.thumbnail}
                          alt={seriesDetail.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {seriesDetail.metadata && Object.keys(seriesDetail.metadata).length > 0 && (
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-1.5 text-xs">
                        {Object.entries(seriesDetail.metadata).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-gray-300">
                            <span className="text-gray-400 capitalize">{k}:</span>
                            <span className="font-medium text-right text-fuchsia-200 line-clamp-1">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Synopsis & All Episodes */}
                  <div className="md:col-span-3 space-y-4">
                    {seriesDetail.synopsis && (
                      <div>
                        <h3 className="text-sm font-bold text-white mb-1.5">Sinopsis Drama</h3>
                        <p className="text-xs text-gray-300 leading-relaxed max-h-36 overflow-y-auto pr-2 scrollbar-thin">
                          {seriesDetail.synopsis}
                        </p>
                      </div>
                    )}

                    {/* All Episodes Drawer */}
                    {seriesDetail.episodes && seriesDetail.episodes.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <ListOrdered className="w-4 h-4 text-fuchsia-400" />
                          <span>Daftar Semua Episode ({seriesDetail.episodes.length})</span>
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                          {seriesDetail.episodes.map((ep, i) => {
                            const isCurrent =
                              episodeData?.url === ep.url ||
                              (rawUrl && ep.url.includes(rawUrl.replace(/https?:\/\/[^\/]+/, "")));

                            return (
                              <Link
                                key={`${ep.url}-${i}`}
                                href={`/oppadrama/watch?url=${encodeURIComponent(
                                  ep.url
                                )}&title=${encodeURIComponent(ep.title || `Episode ${ep.episode}`)}`}
                                className={`p-2.5 rounded-xl text-xs font-medium transition-all text-left flex items-center justify-between border ${
                                  isCurrent
                                    ? "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50 shadow-sm"
                                    : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/5 hover:border-white/10"
                                }`}
                              >
                                <span className="line-clamp-1">
                                  {ep.episode ? `Episode ${ep.episode}` : ep.title}
                                </span>
                                {isCurrent && (
                                  <span className="w-2 h-2 rounded-full bg-fuchsia-400 ml-1.5 flex-shrink-0 animate-ping" />
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

              {/* Downloads list */}
              {episodeData?.downloads && episodeData.downloads.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Tautan Download Episode / Film</span>
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {episodeData.downloads.map((dl, dIdx) => (
                      <a
                        key={`${dl.url}-${dIdx}`}
                        href={dl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#181824] hover:bg-fuchsia-500 hover:text-black text-xs font-semibold text-gray-300 transition-colors flex items-center gap-1.5 border border-white/5"
                      >
                        <span>{dl.server}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
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

export default function OppaDramaWatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070A] flex items-center justify-center text-fuchsia-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <OppaDramaWatchContent />
    </Suspense>
  );
}
