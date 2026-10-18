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
  BookMarked,
  Calendar,
  Settings,
  X,
  Sparkles,
  ShieldCheck,
  Trash2,
  LogIn,
  UserPlus,
  ChevronRight,
  Bookmark,
} from "lucide-react";

interface NavbarProps {
  onOpenSearch: () => void;
}

export default function Navbar({ onOpenSearch }: NavbarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOtherOpen, setIsOtherOpen] = useState(false);
  const pathname = usePathname();

  // Desktop navigation items
  const desktopNavItems = [
    { href: "/", label: "Beranda", icon: Home, match: (p: string) => p === "/" },
    {
      href: "/anime",
      label: "Anime",
      icon: Tv,
      match: (p: string) =>
        (p.startsWith("/anime") && !p.includes("#jadwal")) ||
        p.startsWith("/anichin") ||
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
      href: "/jadwal",
      label: "Jadwal",
      icon: Calendar,
      match: (p: string) => p.startsWith("/jadwal") || p.includes("#jadwal"),
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
    {
      href: "/bookmark",
      label: "Favorit",
      icon: Bookmark,
      match: (p: string) => p.startsWith("/bookmark"),
    },
  ];

  // Detect active tab index for the 5-item mobile dock (0: Home, 1: Anime, 2: Other, 3: Jadwal, 4: Setting)
  const isOtherActive =
    pathname.startsWith("/manga") ||
    pathname.startsWith("/film") ||
    pathname.startsWith("/vidbox") ||
    pathname.startsWith("/dracin") ||
    pathname.startsWith("/reelshort") ||
    pathname.startsWith("/netshort") ||
    pathname.startsWith("/drakor") ||
    pathname.startsWith("/oppadrama") ||
    pathname.startsWith("/novel") ||
    pathname.startsWith("/bookmark");

  let activeTabIdx = 0;
  if (isSettingsOpen) {
    activeTabIdx = 4;
  } else if (isOtherOpen || isOtherActive) {
    activeTabIdx = 2;
  } else if (pathname.startsWith("/jadwal") || pathname.includes("#jadwal")) {
    activeTabIdx = 3;
  } else if (
    pathname.startsWith("/anime") ||
    pathname.startsWith("/anichin") ||
    pathname.startsWith("/animesail") ||
    pathname.startsWith("/animexin") ||
    pathname.startsWith("/donghuafilm") ||
    pathname.startsWith("/samehadaku")
  ) {
    activeTabIdx = 1;
  } else {
    activeTabIdx = 0;
  }

  // Items for the "Other" categories bottom sheet modal
  const otherCategories = [
    {
      title: "Manga & Komik",
      desc: "Manga, Manhwa & Manhua Sub Indo",
      href: "/manga",
      icon: BookOpen,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-400/50",
    },
    {
      title: "Film Bioskop HD",
      desc: "Box Office & Serial TV Barat",
      href: "/film",
      icon: Film,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10 border-rose-500/20 group-hover:border-rose-400/50",
    },
    {
      title: "Dracin",
      desc: "Drama Vertikal AsiaBox & ReelShort",
      href: "/dracin",
      icon: Video,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10 border-purple-500/20 group-hover:border-purple-400/50",
    },
    {
      title: "Drakor Asia",
      desc: "Serial Drama Korea & Asia Lengkap",
      href: "/drakor",
      icon: Clapperboard,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/20 group-hover:border-blue-400/50",
    },
    {
      title: "Light Novel",
      desc: "Novel & Web Novel Terjemahan",
      href: "/novel",
      icon: BookMarked,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/20 group-hover:border-amber-400/50",
    },
    {
      title: "Favorit Saya",
      desc: "Daftar Tontonan & Bacaan Tersimpan",
      href: "/bookmark",
      icon: Bookmark,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/20 group-hover:border-amber-400/50",
    },
  ];

  return (
    <>
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-[#0B0B12]/90 backdrop-blur-md border-b border-white/[0.08] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2.5 sm:gap-4 lg:gap-6">
          {/* Left: Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-3 lg:gap-5 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                <div className="w-full h-full bg-[#0B0B10] rounded-full flex items-center justify-center font-black text-xs sm:text-sm tracking-tight">
                  <span className="text-amber-500">N</span>
                  <span className="text-amber-300">N</span>
                </div>
              </div>
              <span className="font-black text-lg sm:text-xl tracking-tight leading-none group-hover:opacity-90 transition-opacity">
                <span className="text-amber-400">Nex</span>
                <span className="text-white">Nime</span>
              </span>
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
            {/* Search Trigger Button */}
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

            {/* Quick Bookmark Link */}
            <Link
              href="/bookmark"
              className={`h-9 px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all shrink-0 ${
                pathname?.startsWith("/bookmark")
                  ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                  : "bg-[#12121A] hover:bg-[#181824] border-white/10 text-gray-300 hover:text-white"
              }`}
              title="Buka Favorit Saya"
            >
              <Bookmark className={`w-3.5 h-3.5 ${pathname?.startsWith("/bookmark") ? "fill-amber-400 text-amber-400" : "text-amber-400"}`} />
              <span className="hidden sm:inline">Favorit</span>
            </Link>

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

      {/* Redesigned Minimalist 5-Item Mobile Bottom Navigation Dock */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-50 max-w-md mx-auto select-none"
      >
        <div className="relative rounded-2xl sm:rounded-3xl bg-[#0C0C14]/90 backdrop-blur-2xl border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.8)] px-1.5 py-1">
          {/* Smooth Sliding Switch Indicator Pill (Geser Animasi) */}
          <div
            className="absolute top-1.5 bottom-1.5 w-[20%] rounded-xl sm:rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-500/10 border border-amber-400/30 shadow-sm shadow-amber-400/15 pointer-events-none transition-all duration-300"
            style={{
              transform: `translateX(${activeTabIdx * 100}%)`,
              transitionTimingFunction: "cubic-bezier(0.34, 1.3, 0.64, 1)",
              opacity: activeTabIdx === 2 ? 0 : 1, // Sembunyikan pill di belakang tombol Other yang melayang
            }}
          />

          {/* 5 Menu Items Grid */}
          <div className="relative z-10 grid grid-cols-5 items-center">
            {/* 1. HOME */}
            <Link
              href="/"
              onClick={() => {
                setIsOtherOpen(false);
                setIsSettingsOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-200 ${
                activeTabIdx === 0
                  ? "text-amber-400 font-bold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Home
                className={`w-5 h-5 transition-transform duration-200 ${
                  activeTabIdx === 0 ? "scale-110 text-amber-400" : ""
                }`}
              />
              <span className="text-[10px] tracking-tight leading-none mt-1">
                Home
              </span>
            </Link>

            {/* 2. ANIME */}
            <Link
              href="/anime"
              onClick={() => {
                setIsOtherOpen(false);
                setIsSettingsOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-200 ${
                activeTabIdx === 1
                  ? "text-amber-400 font-bold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Tv
                className={`w-5 h-5 transition-transform duration-200 ${
                  activeTabIdx === 1 ? "scale-110 text-amber-400" : ""
                }`}
              />
              <span className="text-[10px] tracking-tight leading-none mt-1">
                Anime
              </span>
            </Link>

            {/* 3. OTHER (CENTER FLOATING SPECIAL SPARKLES BUTTON) */}
            <div className="flex flex-col items-center justify-center relative -mt-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  setIsOtherOpen(!isOtherOpen);
                }}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 transition-all duration-300 shadow-md ${
                  isOtherOpen || isOtherActive
                    ? "bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-amber-500/40 scale-105 ring-2 ring-[#0C0C14]"
                    : "bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 shadow-amber-500/25 hover:scale-105 active:scale-95 ring-2 ring-[#0C0C14]"
                }`}
                aria-label="Kategori Lainnya (Other)"
              >
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center transition-all ${
                    isOtherOpen || isOtherActive
                      ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-black shadow-inner"
                      : "bg-[#11111A] text-amber-400 group-hover:text-amber-300"
                  }`}
                >
                  <Sparkles
                    className={`w-5 h-5 transition-transform duration-300 ${
                      isOtherOpen
                        ? "rotate-45 scale-110"
                        : "animate-pulse"
                    }`}
                  />
                </div>
              </button>
              <span
                className={`text-[9px] tracking-tight font-bold leading-none mt-0.5 transition-colors ${
                  isOtherOpen || isOtherActive ? "text-amber-400" : "text-gray-400"
                }`}
              >
                Other
              </span>
            </div>

            {/* 4. JADWAL */}
            <Link
              href="/jadwal"
              onClick={() => {
                setIsOtherOpen(false);
                setIsSettingsOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-200 ${
                activeTabIdx === 3
                  ? "text-amber-400 font-bold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Calendar
                className={`w-5 h-5 transition-transform duration-200 ${
                  activeTabIdx === 3 ? "scale-110 text-amber-400" : ""
                }`}
              />
              <span className="text-[10px] tracking-tight leading-none mt-1">
                Jadwal
              </span>
            </Link>

            {/* 5. SETTING */}
            <button
              type="button"
              onClick={() => {
                setIsOtherOpen(false);
                setIsSettingsOpen(!isSettingsOpen);
              }}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-200 ${
                activeTabIdx === 4
                  ? "text-amber-400 font-bold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Settings
                className={`w-5 h-5 transition-transform duration-200 ${
                  activeTabIdx === 4 ? "scale-110 text-amber-400 rotate-45" : ""
                }`}
              />
              <span className="text-[10px] tracking-tight leading-none mt-1">
                Setting
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* "Other" Categories Bottom Sheet Modal */}
      {isOtherOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOtherOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#111119] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto no-scrollbar pb-24 sm:pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 shadow-md shadow-amber-500/20">
                  <div className="w-full h-full bg-[#0E0E16] rounded-[10px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Kategori Hiburan</h3>
                  <p className="text-[11px] text-gray-400">Pilih jenis tontonan &amp; bacaan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOtherOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                aria-label="Tutup kategori"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Other Categories Cards Grid */}
            <div className="grid grid-cols-1 gap-2.5">
              {otherCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={() => setIsOtherOpen(false)}
                    className={`group p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${cat.bgColor}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                        <Icon className={`w-5 h-5 ${cat.color}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                          {cat.title}
                        </h4>
                        <p className="text-[11px] text-gray-400">{cat.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal (Interactive Sheet for Setting Menu) */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#111119] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto no-scrollbar pb-24 sm:pb-6"
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
                  <p className="text-[10px] text-gray-400">Preferensi &amp; Akun NexNime</p>
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
                NexNime Hub v2.5.0 • Web App Ready
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
