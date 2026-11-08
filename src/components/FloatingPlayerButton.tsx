"use client";

import React from "react";
import { PictureInPicture2 } from "lucide-react";

export interface FloatingPlayerButtonProps {
  isPipActive: boolean;
  onClick: () => void;
  accentColor?: "rose" | "amber" | "blue" | "sky" | "fuchsia" | "emerald" | "cyan" | "purple" | "red";
  className?: string;
  label?: string;
}

export default function FloatingPlayerButton({
  isPipActive,
  onClick,
  accentColor = "amber",
  className = "",
  label = "Floating Player",
}: FloatingPlayerButtonProps) {
  const activeColorMap: Record<string, string> = {
    amber: "bg-amber-400 text-black border-amber-400 shadow-amber-400/25",
    rose: "bg-rose-600 text-white border-rose-500 shadow-rose-600/25",
    red: "bg-red-600 text-white border-red-500 shadow-red-600/25",
    blue: "bg-blue-600 text-white border-blue-500 shadow-blue-600/25",
    sky: "bg-sky-400 text-black border-sky-400 shadow-sky-400/25",
    fuchsia: "bg-fuchsia-600 text-white border-fuchsia-500 shadow-fuchsia-600/25",
    emerald: "bg-emerald-500 text-black border-emerald-400 shadow-emerald-500/25",
    cyan: "bg-cyan-400 text-black border-cyan-400 shadow-cyan-400/25",
    purple: "bg-purple-600 text-white border-purple-500 shadow-purple-600/25",
  };

  const iconColorMap: Record<string, string> = {
    amber: "text-amber-400",
    rose: "text-rose-400",
    red: "text-red-400",
    blue: "text-blue-400",
    sky: "text-sky-400",
    fuchsia: "text-fuchsia-400",
    emerald: "text-emerald-400",
    cyan: "text-cyan-400",
    purple: "text-purple-400",
  };

  const activeClass = activeColorMap[accentColor] || activeColorMap.amber;
  const iconClass = isPipActive ? "text-current" : (iconColorMap[accentColor] || iconColorMap.amber);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all select-none active:scale-95 ${
        isPipActive
          ? `${activeClass} font-bold shadow-lg ring-2 ring-white/20`
          : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white"
      } ${className}`}
      title={
        isPipActive
          ? "Klik untuk kembalikan Floating Player ke halaman utama"
          : "Mini Floating Player (Tetap tampil di layar desktop saat browser diminimalkan)"
      }
    >
      <PictureInPicture2 className={`w-3.5 h-3.5 ${iconClass} transition-transform ${isPipActive ? "scale-110" : ""}`} />
      <span className="hidden sm:inline">{label}</span>
      {isPipActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse ml-0.5" />
      )}
    </button>
  );
}
