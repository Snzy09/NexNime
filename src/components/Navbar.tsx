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
  Menu,
  X,
} from "lucide-react";

interface NavbarProps {
  onOpenSearch: () => void;
}

export default function Navbar({ onOpenSearch }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
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
      href: "/film",
      label: "Film",
      icon: Film,
      match: (p: string) => p.startsWith("/film") || p.startsWith("/vidbox"),
    },
    {
      href: "/drakor",
      label: "Drakor",
      icon: Clapperboard,
      match: (p: string) =>
        p.startsWith("/drakor") || p.startsWith("/oppadrama"),
    },
    {
      href: "/dracin",
      label: "Short Drama",
      icon: Video,
      match: (p: string) =>
        p.startsWith("/dracin") ||
        p.startsWith("/reelshort") ||
        p.startsWith("/netshort"),
    },
    {
      href: "/manga",
      label: "Manga",
      icon: BookOpen,
      match: (p: string) => p.startsWith("/manga"),
    },
    {
      href: "/novel",
      label: "Novel",
      icon: BookMarked,
      match: (p: string) => p.startsWith("/novel"),
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0B12]/90 backdrop-blur-md border-b border-white/[0.08] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 xl:gap-6">
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-3 xl:gap-5 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 flex items-center justify-center p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0E0E14] rounded-[10px] flex items-center justify-center font-black text-amber-400 text-xs tracking-tighter">
                LV
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent group-hover:opacity-90 leading-tight">
                LuoyiV<span className="text-white font-light text-sm">Bond</span>
              </span>
              <span className="text-[8px] tracking-widest uppercase text-amber-400/70 font-semibold -mt-0.5">
                Streaming &amp; Manga
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links - Clean Symmetrical Pill Tabs */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs xl:text-sm font-medium shrink-0">
            {navItems.map((item) => {
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
        <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
          {/* Search Trigger Button - Fixed Height & Non-wrapping */}
          <button
            onClick={onOpenSearch}
            className="h-9 w-36 sm:w-44 lg:w-48 xl:w-56 flex items-center justify-between gap-2 bg-[#12121A] hover:bg-[#181824] text-gray-400 hover:text-white px-3 rounded-xl border border-white/10 hover:border-amber-400/40 transition-all text-xs group shrink-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-400 transition-colors shrink-0" />
              <span className="truncate whitespace-nowrap text-left text-gray-400 group-hover:text-gray-200">
                Cari anime, film, komik...
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] bg-white/5 text-gray-400 rounded border border-white/10 font-mono shrink-0">
              Ctrl K
            </kbd>
          </button>

          {/* User Auth Buttons */}
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

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-9 w-9 flex items-center justify-center text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D0D15]/95 backdrop-blur-xl border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm font-medium">
            {navItems.map((item) => {
              const isActive = item.match(pathname || "");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl flex items-center gap-2 border transition-all ${
                    isActive
                      ? "bg-amber-400/15 text-amber-300 font-semibold border-amber-400/30"
                      : "bg-white/[0.03] text-gray-300 hover:text-white hover:bg-white/[0.08] border-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-400" : "text-gray-400"}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2 text-xs font-semibold text-center text-gray-300 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2 text-xs font-bold text-center text-black bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl transition-all"
            >
              Daftar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
