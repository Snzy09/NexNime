"use client";

import React, { useRef, useEffect } from "react";
import { Moon, Check, X, Play } from "lucide-react";

export interface SleepTimerButtonProps {
  sleepOption: number | null;
  formattedRemaining: string | null;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onSelectOption: (minutes: number | null) => void;
  accentColor?: "rose" | "amber" | "blue" | "sky" | "fuchsia" | "emerald" | "cyan" | "purple" | "red";
  className?: string;
}

export function SleepTimerButton({
  sleepOption,
  formattedRemaining,
  isMenuOpen,
  onToggleMenu,
  onSelectOption,
  accentColor = "amber",
  className = "",
}: SleepTimerButtonProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onToggleMenu();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onToggleMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, onToggleMenu]);

  const isActive = sleepOption !== null;

  const colorStyles: Record<string, string> = {
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

  const activeOptionStyles: Record<string, string> = {
    amber: "bg-amber-400 text-black font-bold",
    rose: "bg-rose-600 text-white font-bold",
    red: "bg-red-600 text-white font-bold",
    blue: "bg-blue-600 text-white font-bold",
    sky: "bg-sky-400 text-black font-bold",
    fuchsia: "bg-fuchsia-600 text-white font-bold",
    emerald: "bg-emerald-500 text-black font-bold",
    cyan: "bg-cyan-400 text-black font-bold",
    purple: "bg-purple-600 text-white font-bold",
  };

  const activeClass = colorStyles[accentColor] || colorStyles.amber;
  const activeOptClass = activeOptionStyles[accentColor] || activeOptionStyles.amber;

  const options = [
    { label: "15 Menit", value: 15 },
    { label: "30 Menit", value: 30 },
    { label: "45 Menit", value: 45 },
    { label: "60 Menit", value: 60 },
    { label: "Akhir Episode Ini", value: -1 },
  ];

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        onClick={onToggleMenu}
        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all select-none active:scale-95 ${
          isActive
            ? `${activeClass} font-bold shadow-lg ring-2 ring-white/20`
            : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white"
        } ${className}`}
        title={
          isActive
            ? `Sleep Timer aktif: ${formattedRemaining}`
            : "Pengatur Waktu Tidur (Hentikan video otomatis saat tidur)"
        }
      >
        <Moon className={`w-3.5 h-3.5 ${isActive ? "fill-current animate-pulse" : ""}`} />
        <span>{isActive ? `Tidur (${formattedRemaining})` : "Sleep Timer"}</span>
      </button>

      {/* Popover Dropdown (Opens downwards below header) */}
      {isMenuOpen && (
        <>
          {/* Subtle mobile click-away backdrop */}
          <div
            className="fixed inset-0 z-40 sm:hidden bg-black/40 backdrop-blur-xs"
            onClick={onToggleMenu}
          />

          <div className="absolute right-0 top-full mt-2 w-64 bg-[#12121A]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
            <div className="px-3 py-2 border-b border-white/10 mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span>Waktu Tidur (Sleep Timer)</span>
              </div>
              {isActive && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
                  {formattedRemaining}
                </span>
              )}
            </div>

            <div className="space-y-1">
              {options.map((opt) => {
                const selected = sleepOption === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onSelectOption(opt.value);
                      onToggleMenu();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                      selected
                        ? activeOptClass
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}

              {isActive && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectOption(null);
                    onToggleMenu();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-between border-t border-white/10 mt-1 pt-2"
                >
                  <span>Matikan Timer</span>
                  <X className="w-3.5 h-3.5 text-rose-400" />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export interface SleepTimerOverlayProps {
  show: boolean;
  onWakeUp: () => void;
  accentColor?: "rose" | "amber" | "blue" | "sky" | "fuchsia" | "emerald" | "cyan" | "purple" | "red";
}

export function SleepTimerOverlay({
  show,
  onWakeUp,
  accentColor = "amber",
}: SleepTimerOverlayProps) {
  if (!show) return null;

  const btnBg: Record<string, string> = {
    amber: "bg-amber-400 hover:bg-amber-300 text-black",
    rose: "bg-rose-600 hover:bg-rose-500 text-white",
    red: "bg-red-600 hover:bg-red-500 text-white",
    blue: "bg-blue-600 hover:bg-blue-500 text-white",
    sky: "bg-sky-400 hover:bg-sky-300 text-black",
    fuchsia: "bg-fuchsia-600 hover:bg-fuchsia-500 text-white",
    emerald: "bg-emerald-500 hover:bg-emerald-400 text-black",
    cyan: "bg-cyan-400 hover:bg-cyan-300 text-black",
    purple: "bg-purple-600 hover:bg-purple-500 text-white",
  };

  const btnClass = btnBg[accentColor] || btnBg.amber;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 z-50 bg-[#06060c]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-500 pointer-events-auto"
    >
      <div className="w-16 h-16 rounded-3xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center mb-4 shadow-2xl shadow-amber-400/20 animate-pulse">
        <Moon className="w-8 h-8 fill-amber-400/30" />
      </div>

      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mb-2">
        Waktu Tidur Telah Tiba 🌙
      </h3>

      <p className="text-xs sm:text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
        Pemutaran video telah dihentikan secara otomatis untuk menghemat daya baterai dan kuota internet Anda.
      </p>

      <button
        type="button"
        onClick={onWakeUp}
        className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-2xl transition-all active:scale-95 flex items-center gap-2 ${btnClass}`}
      >
        <Play className="w-4 h-4 fill-current" />
        <span>Lanjutkan Menonton</span>
      </button>
    </div>
  );
}
