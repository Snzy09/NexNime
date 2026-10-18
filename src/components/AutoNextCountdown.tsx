"use client";

import React, { useEffect, useState } from "react";
import { Play, X, FastForward } from "lucide-react";

export interface AutoNextCountdownProps {
  show: boolean;
  nextEpisodeTitle?: string;
  countdownSeconds?: number;
  onPlayNow: () => void;
  onCancel: () => void;
  accentColor?: "rose" | "amber" | "blue" | "sky" | "fuchsia" | "emerald";
}

export default function AutoNextCountdown({
  show,
  nextEpisodeTitle,
  countdownSeconds = 5,
  onPlayNow,
  onCancel,
  accentColor = "rose",
}: AutoNextCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

  useEffect(() => {
    if (!show) {
      setSecondsLeft(countdownSeconds);
      return;
    }

    setSecondsLeft(countdownSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onPlayNow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [show, countdownSeconds, onPlayNow]);

  if (!show) return null;

  const colorStyles = {
    rose: {
      border: "border-rose-500/40",
      btn: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      ring: "text-rose-400",
    },
    amber: {
      border: "border-amber-500/40",
      btn: "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-900/50",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      ring: "text-amber-400",
    },
    blue: {
      border: "border-blue-500/40",
      btn: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50",
      badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      ring: "text-blue-400",
    },
    sky: {
      border: "border-sky-500/40",
      btn: "bg-sky-500 hover:bg-sky-400 text-black shadow-sky-900/50",
      badge: "bg-sky-500/20 text-sky-300 border-sky-500/30",
      ring: "text-sky-400",
    },
    fuchsia: {
      border: "border-fuchsia-500/40",
      btn: "bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-fuchsia-900/50",
      badge: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
      ring: "text-fuchsia-400",
    },
    emerald: {
      border: "border-emerald-500/40",
      btn: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      ring: "text-emerald-400",
    },
  }[accentColor] || {
    border: "border-rose-500/40",
    btn: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    ring: "text-rose-400",
  };

  const progressPercent = ((countdownSeconds - secondsLeft) / countdownSeconds) * 100;
  const strokeDashoffset = 100 - progressPercent;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="absolute bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-80 z-50 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div
        className={`bg-black/90 backdrop-blur-md rounded-2xl p-4 border ${colorStyles.border} shadow-2xl flex flex-col gap-3 select-none`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 shrink-0 ${colorStyles.badge}`}
            >
              <FastForward className="w-3 h-3" /> Auto-Next
            </span>
            {nextEpisodeTitle && (
              <span className="text-xs font-bold text-white truncate max-w-[150px]">
                {nextEpisodeTitle}
              </span>
            )}
          </div>

          {/* Circular Countdown Badge */}
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={colorStyles.ring}
                strokeDasharray="100, 100"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono text-xs font-black text-white">
              {secondsLeft}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-300">
          Episode berikutnya dalam{" "}
          <span className="font-bold text-white">{secondsLeft} detik</span>
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onPlayNow}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${colorStyles.btn}`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Putar Sekarang</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all active:scale-95 border border-white/5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Batal</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
