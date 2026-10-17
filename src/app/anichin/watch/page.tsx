"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Tv,
  Star,
  Layers,
  Server,
  ListOrdered,
  AlertCircle,
  Download,
  Share2,
  Sparkles,
  Loader2,
  Play,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import { AnichinStream, AnichinDetail } from "@/lib/services/anichinService";

function AnichinWatchContent() {
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get("url") || searchParams.get("slug") || "";
  const initialTitle = searchParams.get("title") || "";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stream, setStream] = useState<AnichinStream | null>(null);
  const [detail, setDetail] = useState<AnichinDetail | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState(rawUrl);

  useEffect(() => {
    if (rawUrl) {
      setCurrentUrl(rawUrl);
    }
  }, [rawUrl]);

  // Fetch Stream & Detail
  useEffect(() => {
    if (!currentUrl) return;
    setLoading(true);
    setError(null);

    // 1. Fetch stream/embed
    fetch(`/api/anichin?action=stream&url=${encodeURIComponent(currentUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stream) {
          setStream(data.stream);
        } else {
          setError(data.error || "Gagal memuat video stream episode AniChin.");
        }
      })
      .catch((err) => {
        setError(err.message || "Gagal terhubung ke scraper AniChin.");
      });

    // 2. Fetch anime episodes list & details
    fetch(`/api/anichin?action=episodes&url=${encodeURIComponent(currentUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.episodes && Array.isArray(data.episodes)) {
          setEpisodes(data.episodes);
        }
        // If series URL available, fetch full detail metadata
        const seriesUrl = data.anime_source || data.source;
        if (seriesUrl) {
          fetch(`/api/anichin?action=detail&url=${encodeURIComponent(seriesUrl)}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.detail) setDetail(d.detail);
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUrl]);

  const streamSrc = stream?.iframe || stream?.stream_url || stream?.embed_url || "";

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <Link
            href="/anichin"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg bg-white/5 border border-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Katalog AniChin</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 text-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              AniChin Moe Player
            </span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="aspect-video w-full rounded-2xl bg-[#13131A] border border-white/5 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-rose-400 animate-spin mb-2" />
              <p className="text-sm text-gray-400">Memuat Pemutar Video AniChin...</p>
            </div>
            <div className="h-8 bg-white/5 rounded-xl w-1/2" />
            <div className="h-4 bg-white/5 rounded-lg w-3/4" />
          </div>
        ) : error && !streamSrc ? (
          <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center my-12">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Gagal Memutar Donghua</h3>
            <p className="text-xs text-gray-300 mb-4">{error || "Data stream tidak ditemukan"}</p>
            <Link
              href="/anichin"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
            >
              Lihat Donghua Lainnya
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Player Container */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
              {streamSrc ? (
                <iframe
                  src={streamSrc}
                  className="w-full h-full border-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-rose-400 mb-2" />
                  <p className="text-sm font-semibold">Iframe stream tidak tersedia secara langsung</p>
                  <p className="text-xs text-gray-500 mt-1">Coba tautan download atau tonton episode lainnya.</p>
                </div>
              )}
            </div>

            {/* Video Title & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="space-y-1">
                <h1 className="text-lg sm:text-2xl font-bold text-white leading-snug">
                  {stream?.title || initialTitle || "Streaming Donghua AniChin"}
                </h1>
                {detail?.alternative && (
                  <p className="text-xs text-gray-400 italic">{detail.alternative}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: stream?.title || "AniChin Donghua",
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Tautan berhasil disalin!");
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </button>
              </div>
            </div>

            {/* Download Links if Available */}
            {stream?.download && stream.download.length > 0 && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-4 space-y-3">
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Tautan Download
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stream.download.map((dl, idx) => (
                    <a
                      key={idx}
                      href={dl.url || dl.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-xs font-medium text-gray-200 hover:text-rose-300 transition-colors flex items-center gap-1.5"
                    >
                      <span className="font-bold text-rose-400">{dl.quality}:</span>
                      <span>{dl.label || "Unduh"}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Episode Selector */}
            {episodes && episodes.length > 0 && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-rose-400" />
                    <span>Daftar Episode ({episodes.length})</span>
                  </h3>
                  <span className="text-xs text-gray-400">Pilih episode untuk ditonton</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-72 overflow-y-auto pr-1">
                  {episodes.map((ep, idx) => {
                    const epUrl = ep.url || ep.href;
                    const isActive = currentUrl === epUrl || currentUrl.includes(ep.slug || "");
                    const epLabel = ep.episode || `Ep ${idx + 1}`;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentUrl(epUrl);
                          window.scrollTo({ top: 120, behavior: "smooth" });
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold truncate transition-all text-center flex items-center justify-center gap-1 ${
                          isActive
                            ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 font-bold"
                            : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5"
                        }`}
                        title={ep.title || epLabel}
                      >
                        <Play className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{epLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Donghua Information & Synopsis */}
            {detail && (
              <div className="rounded-2xl bg-[#12121A] border border-white/10 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-5">
                  {detail.poster && (
                    <div className="w-28 sm:w-36 aspect-[2/3] rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/40">
                      <img
                        src={detail.poster}
                        alt={detail.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-3 flex-1">
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {detail.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {detail.rating && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {detail.rating}
                        </span>
                      )}
                      {detail.genres?.map((g, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/5"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {detail.synopsis || detail.description || "Tidak ada sinopsis tersedia."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function AnichinWatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070A] text-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      }
    >
      <AnichinWatchContent />
    </Suspense>
  );
}
