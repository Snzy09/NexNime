"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Home,
  Tv,
  Film,
  Clapperboard,
  Video,
  BookOpen,
  Calendar,
  Settings,
  X,
  Sparkles,
  ShieldCheck,
  Trash2,
  LogIn,
  UserPlus,
} from "lucide-react";

interface NavbarProps {
  onOpenSearch: () => void;
}

export default function Navbar({ onOpenSearch }: NavbarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const pathname = usePathname();

  // Desktop navigation items
  const desktopNavItems = [
    { href: "/", label: "Beranda", icon: Home, match: (p: string) => p === "/" },
    {
      href: "/anime",
      label: "Anime",
      icon: Tv,
      match: (p: string) =>
        p.startsWith("/anime") ||
        p.startsWith("/animesail") ||
        p.startsWith("/animexin") ||
        p.startsWith("/donghuafilm") ||
        p.startsWith("/samehadaku"),
    },
    {
      href: "/manga",
      label: "Manga",
      icon: BookOpen,
      match: (p: string) => p.startsWith("/manga") || p.startsWith("/novel"),
    },
    {
      href: "/film",
      label: "Film",
      icon: Film,
      match: (p: string) => p.startsWith("/film") || p.startsWith("/vidbox"),
    },
    {
      href: "/anime#jadwal",
      label: "Jadwal",
      icon: Calendar,
      match: (p: string) => p.includes("#jadwal"),
    },
    {
      href: "/dracin",
      label: "Dracin",
      icon: Video,
      match: (p: string) =>
        p.startsWith("/dracin") ||
        p.startsWith("/reelshort") ||
        p.startsWith("/netshort"),
    },
    {
      href: "/drakor",
      label: "Drakor",
      icon: Clapperboard,
      match: (p: string) =>
        p.startsWith("/drakor") || p.startsWith("/oppadrama"),
    },
  ];

  // Mobile bottom navigation items (Strict 8 items as requested)
  const mobileNavItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      match: (p: string) => p === "/",
    },
    {
      label: "Anime",
      href: "/anime",
      icon: Tv,
      match: (p: string) =>
        (p.startsWith("/anime") && !p.includes("#jadwal")) ||
        p.startsWith("/animesail") ||
        p.startsWith("/animexin") ||
        p.startsWith("/donghuafilm") ||
        p.startsWith("/samehadaku"),
    },
    {
      label: "Manga",
      href: "/manga",
      icon: BookOpen,
      match: (p: string) => p.startsWith("/manga") || p.startsWith("/novel"),
    },
    {
      label: "Film",
      href: "/film",
      icon: Film,
      match: (p: string) => p.startsWith("/film") || p.startsWith("/vidbox"),
    },
    {
      label: "Jadwal",
      href: "/anime#jadwal",
      icon: Calendar,
      match: (p: string) => p.includes("#jadwal"),
    },
    {
      label: "Dracin",
      href: "/dracin",
      icon: Video,
      match: (p: string) =>
        p.startsWith("/dracin") ||
        p.startsWith("/reelshort") ||
        p.startsWith("/netshort"),
    },
    {
      label: "Drakor",
      href: "/drakor",
      icon: Clapperboard,
      match: (p: string) =>
        p.startsWith("/drakor") || p.startsWith("/oppadrama"),
    },
    {
      label: "Setting",
      href: "#",
      icon: Settings,
      onClick: () => setIsSettingsOpen(true),
    },
  ];

  return (
    <>
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-[#0B0B12]/90 backdrop-blur-md border-b border-white/[0.08] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2.5 sm:gap-4 lg:gap-6">
          {/* Left: Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-3 lg:gap-5 shrink-0">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 flex items-center justify-center p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0E0E14] rounded-[10px] flex items-center justify-center font-black text-amber-400 text-[11px] sm:text-xs tracking-tighter">
                  LV
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent group-hover:opacity-90 leading-tight">
                  LuoyiV<span className="text-white font-light text-xs sm:text-sm">Bond</span>
                </span>
                <span className="text-[7px] sm:text-[8px] tracking-widest uppercase text-amber-400/70 font-semibold -mt-0.5 hidden xs:block">
                  Streaming &amp; Manga
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links - Visible on lg+ */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs xl:text-sm font-medium shrink-0">
              {desktopNavItems.map((item) => {
                const isActive = item.match(pathname || "");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`h-9 px-2 xl:px-2.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                      isActive
                        ? "bg-amber-400/15 text-amber-300 font-semibold border border-amber-400/30 shadow-sm shadow-amber-400/10"
                        : "text-gray-300 hover:text-white hover:bg-white/[0.06] border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 transition-colors ${
                        isActive ? "text-amber-400" : "text-gray-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search Bar & Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-1 lg:flex-initial justify-end">
            {/* Search Trigger Button (Takes available width on mobile) */}
            <button
              onClick={onOpenSearch}
              className="h-9 w-full max-w-[220px] sm:max-w-[280px] lg:w-48 xl:w-56 flex items-center justify-between gap-2 bg-[#12121A] hover:bg-[#181824] text-gray-400 hover:text-white px-2.5 sm:px-3 rounded-xl border border-white/10 hover:border-amber-400/40 transition-all text-xs group shrink-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-400 transition-colors shrink-0" />
                <span className="truncate whitespace-nowrap text-left text-gray-400 group-hover:text-gray-200 text-[11px] sm:text-xs">
                  Cari anime, film, komik...
                </span>
              </div>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] bg-white/5 text-gray-400 rounded border border-white/10 font-mono shrink-0">
                Ctrl K
              </kbd>
            </button>

            {/* Desktop User Auth Buttons */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <Link
                href="/login"
                className="h-9 px-3 text-xs font-semibold text-gray-300 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors whitespace-nowrap flex items-center justify-center"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="h-9 px-3.5 text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex items-center justify-center"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (8 Menu Items: Home, Anime, Manga, Film, Jadwal, Dracin, Drakor, Setting) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0B12]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_25px_rgba(0,0,0,0.65)] select-none"
      >
        <div className="max-w-lg mx-auto grid grid-cols-8 items-center px-1 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          {mobileNavItems.map((item) => {
            const isMatched = item.match ? item.match(pathname || "") : false;
            const Icon = item.icon;

            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className={`flex flex-col items-center justify-center py-0.5 px-0.5 rounded-lg transition-all ${
                    isSettingsOpen
                      ? "text-amber-400 font-bold"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <div className={`p-1 rounded-lg transition-all ${isSettingsOpen ? "bg-amber-400/15" : ""}`}>
                    <Icon className={`w-4 h-4 transition-transform ${isSettingsOpen ? "text-amber-400 scale-110" : "text-gray-400"}`} />
                  </div>
                  <span className="text-[9px] font-medium leading-none mt-0.5 truncate max-w-full">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center py-0.5 px-0.5 rounded-lg transition-all ${
                  isMatched
                    ? "text-amber-400 font-bold"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <div className={`p-1 rounded-lg transition-all ${isMatched ? "bg-amber-400/15" : ""}`}>
                  <Icon className={`w-4 h-4 transition-transform ${isMatched ? "text-amber-400 scale-110" : "text-gray-400"}`} />
                </div>
                <span className="text-[9px] font-medium leading-none mt-0.5 truncate max-w-full">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Settings Modal (Interactive Sheet for Setting Menu) */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#111119] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pengaturan Aplikasi</h3>
                  <p className="text-[10px] text-gray-400">Preferensi &amp; Akun LuoyiVBond</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                aria-label="Tutup pengaturan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preferensi Streaming */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Preferensi Streaming &amp; Baca
              </h4>
              <div className="bg-[#161622] rounded-2xl p-3 border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Kualitas Otomatis</span>
                  <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Auto 1080p
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Server CDN Cepat</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Auto Next Episode</span>
                  <span className="text-emerald-400 font-semibold">Aktif</span>
                </div>
              </div>
            </div>

            {/* Akun Pengguna */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Akun Pengguna
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsSettingsOpen(false)}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-center text-white border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-gray-400" />
                  <span>Masuk</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsSettingsOpen(false)}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-bold text-center shadow-md shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar</span>
                </Link>
              </div>
            </div>

            {/* Pembersihan Cache */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" /> Penyimpanan Perangkat
              </h4>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch (e) {}
                  alert("Cache dan riwayat lokal berhasil dibersihkan!");
                  setIsSettingsOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Bersihkan Cache &amp; Riwayat Nonton</span>
              </button>
            </div>

            {/* Versi Info */}
            <div className="pt-2 border-t border-white/5 text-center">
              <p className="text-[10px] text-gray-500">
                LuoyiVBond Hub v2.5.0 • Web App Ready
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
