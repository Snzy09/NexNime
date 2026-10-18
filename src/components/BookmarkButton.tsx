"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Check } from "lucide-react";
import {
  WatchlistItem,
  isInWatchlist,
  toggleWatchlist,
} from "@/lib/services/watchlistService";

export interface BookmarkButtonProps {
  item: Omit<WatchlistItem, "addedAt">;
  variant?: "button" | "icon";
  accentColor?: "amber" | "rose" | "blue" | "emerald" | "cyan" | "purple";
  className?: string;
}

export default function BookmarkButton({
  item,
  variant = "button",
  accentColor = "amber",
  className = "",
}: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false);
  const [justToggled, setJustToggled] = useState(false);

  useEffect(() => {
    if (!item?.id) return;
    setSaved(isInWatchlist(item.id));

    const handleUpdate = (e: any) => {
      if (e?.detail?.id === item.id) {
        setSaved(Boolean(e.detail.isSaved));
      } else {
        setSaved(isInWatchlist(item.id));
      }
    };

    window.addEventListener("nexnime_watchlist_updated", handleUpdate);
    return () => window.removeEventListener("nexnime_watchlist_updated", handleUpdate);
  }, [item?.id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item?.id) return;
    const newState = toggleWatchlist(item);
    setSaved(newState);
    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 1200);
  };

  const activeColorStyles = {
    amber: "bg-amber-400 text-black border-amber-400 shadow-amber-400/20",
    rose: "bg-rose-500 text-white border-rose-500 shadow-rose-500/20",
    blue: "bg-blue-500 text-white border-blue-500 shadow-blue-500/20",
    emerald: "bg-emerald-500 text-black border-emerald-400 shadow-emerald-500/20",
    cyan: "bg-cyan-500 text-black border-cyan-400 shadow-cyan-500/20",
    purple: "bg-purple-600 text-white border-purple-500 shadow-purple-600/20",
  }[accentColor] || "bg-amber-400 text-black border-amber-400 shadow-amber-400/20";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-90 ${
          saved
            ? `${activeColorStyles} shadow-lg font-bold`
            : "bg-black/60 hover:bg-black/80 border-white/10 text-gray-300 hover:text-white"
        } ${className}`}
        title={saved ? "Hapus dari Favorit" : "Simpan ke Favorit"}
      >
        <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all select-none active:scale-95 ${
        saved
          ? `${activeColorStyles} font-bold shadow-md`
          : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white"
      } ${className}`}
      title={saved ? "Tersimpan di Favorit Saya" : "Tambah ke Daftar Favorit"}
    >
      {justToggled ? (
        <Check className="w-3.5 h-3.5 text-current animate-in zoom-in-75 duration-150" />
      ) : (
        <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
      )}
      <span>{saved ? "Disimpan" : "Favorit"}</span>
    </button>
  );
}
