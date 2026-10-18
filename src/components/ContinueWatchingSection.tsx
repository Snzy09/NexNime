"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Play, X, Clock, Trash2, ChevronRight, Share2 } from "lucide-react";
import {
  WatchHistoryItem,
  getWatchHistory,
  removeWatchHistory,
  clearWatchHistory,
  importWatchHistory,
} from "@/lib/services/watchHistory";
import SyncHistoryModal from "@/components/SyncHistoryModal";
import DraggableCarousel from "@/components/DraggableCarousel";

function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ContinueWatchingSection() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHistory(getWatchHistory());

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const syncCode = params.get("sync");
      if (syncCode && syncCode.length >= 6) {
        fetch(`/api/sync-history?code=${encodeURIComponent(syncCode)}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.success && Array.isArray(data.history)) {
              importWatchHistory(data.history);
              setHistory(getWatchHistory());
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, "", cleanUrl);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  if (!mounted || history.length === 0) return null;

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeWatchHistory(id);
    setHistory(getWatchHistory());
  };

  const handleClearAll = () => {
    if (confirm("Hapus semua riwayat tontonan?")) {
      clearWatchHistory();
      setHistory([]);
    }
  };

  const categoryColors: Record<string, { badge: string; bar: string }> = {
    anime: { badge: "bg-amber-500/20 text-amber-300 border-amber-500/30", bar: "bg-amber-400" },
    drakor: { badge: "bg-blue-500/20 text-blue-300 border-blue-500/30", bar: "bg-blue-500" },
    dracin: { badge: "bg-rose-500/20 text-rose-300 border-rose-500/30", bar: "bg-rose-500" },
    donghua: { badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", bar: "bg-cyan-400" },
    film: { badge: "bg-red-500/20 text-red-300 border-red-500/30", bar: "bg-red-500" },
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-rose-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Lanjutkan Menonton</span>
              <span className="text-xs font-semibold text-rose-400 font-mono bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                {history.length}
              </span>
            </h2>
          </div>
          <div className="mt-1">
            <p className="text-xs sm:text-sm text-gray-400">
              Lanjutkan video dari menit terakhir kamu menonton
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-xl"
            title="Sinkronisasi riwayat ke HP atau perangkat lain"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">Sinkronisasi</span>
          </button>

          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-gray-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-rose-500/20"
            title="Hapus riwayat tontonan"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bersihkan</span>
          </button>
        </div>
      </div>

      {/* Horizontal Draggable Carousel */}
      <DraggableCarousel className="pb-2">
        {history.map((item) => {
          const catStyle = categoryColors[item.category] || categoryColors.dracin;
          const targetUrl = item.watchUrl.includes("?")
            ? `${item.watchUrl}&t=${Math.floor(item.currentTime)}`
            : `${item.watchUrl}?t=${Math.floor(item.currentTime)}`;

          return (
            <div
              key={item.id}
              className="group relative flex-none w-56 sm:w-64 rounded-2xl overflow-hidden bg-[#101018] border border-white/10 hover:border-white/30 transition-all shadow-lg hover:shadow-2xl flex flex-col justify-between shrink-0"
            >
              <Link href={targetUrl} className="block relative aspect-video bg-black/80 overflow-hidden">
                {item.poster ? (
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-500">
                    <Play className="w-8 h-8 opacity-40" />
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, item.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-gray-300 hover:text-white flex items-center justify-center transition-colors z-20 backdrop-blur-sm"
                  title="Hapus dari daftar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Center Play Button on Hover */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl scale-95 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Badges on Thumbnail */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] z-10">
                  <span
                    className={`px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider border ${catStyle.badge}`}
                  >
                    {item.category}
                  </span>
                  {item.episodeNumber && (
                    <span className="px-2 py-0.5 rounded-md bg-black/80 text-white font-mono font-bold border border-white/10 backdrop-blur-sm">
                      EP {item.episodeNumber}
                    </span>
                  )}
                </div>

                {/* Progress Bar at the bottom of thumbnail */}
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20">
                  <div
                    className={`h-full ${catStyle.bar} transition-all`}
                    style={{ width: `${Math.max(5, item.progress)}%` }}
                  />
                </div>
              </Link>

              {/* Title & Info */}
              <div className="p-3 space-y-1">
                <Link href={targetUrl} className="block">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-rose-400 transition-colors">
                    {item.title}
                  </h3>
                </Link>
                <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                  <span>
                    {formatDuration(item.currentTime)}{" "}
                    {item.duration > 0 && `/${formatDuration(item.duration)}`}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {item.progress}% ditonton
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </DraggableCarousel>

      {/* Sync History Modal */}
      <SyncHistoryModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncSuccess={() => setHistory(getWatchHistory())}
      />
    </section>
  );
}
