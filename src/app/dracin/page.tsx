"use client";

import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Play,
  Sparkles,
  Video,
  Flame,
  Layers,
  Heart,
  Clock,
  Gift,
  TrendingUp,
  Globe,
  Film,
} from "lucide-react";
import { DracinItem } from "@/lib/services/dracinService";
import { ReelShortItem } from "@/lib/services/reelshortService";
import { NetShortItem } from "@/lib/services/netshortService";
import { FreeReelsItem, FreeReelsCategory, PineDramaItem, PineDramaLanguage } from "@/lib/services/dramoxService";
import { REAL_DRACIN_SHORTS } from "@/lib/services/realDataFallback";
import DracinReelsSkeleton from "@/components/skeletons/DracinReelsSkeleton";

function DracinHubContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 1. FreeReels State
  const [freeReelsTab, setFreeReelsTab] = useState<"feed" | "popular" | "soon" | "freesoon" | "category">("feed");
  const [freeReelsItems, setFreeReelsItems] = useState<FreeReelsItem[]>([]);
  const [freeReelsCategories, setFreeReelsCategories] = useState<FreeReelsCategory[]>([]);
  const [selectedFreeCat, setSelectedFreeCat] = useState<string>("");
  const [freeReelsTrending, setFreeReelsTrending] = useState<any[]>([]);
  const [loadingFreeReels, setLoadingFreeReels] = useState(true);

  // 2. PineDrama State
  const [pineLang, setPineLang] = useState<string>("id");
  const [pineLanguages, setPineLanguages] = useState<PineDramaLanguage[]>([
    { code: "id", name: "Indonesian" },
    { code: "en", name: "English" },
    { code: "th", name: "Thai" },
    { code: "vi", name: "Vietnamese" },
    { code: "es", name: "Spanish" },
    { code: "ko", name: "Korean" },
    { code: "ja", name: "Japanese" },
  ]);
  const [pineTab, setPineTab] = useState<"popular" | "trending">("popular");
  const [pineItems, setPineItems] = useState<PineDramaItem[]>([]);
  const [loadingPine, setLoadingPine] = useState(true);

  // 3. Melolo State
  const [meloloCategories, setMeloloCategories] = useState<any[]>([]);
  const [selectedMeloloCat, setSelectedMeloloCat] = useState<string>("Romance");
  const [meloloItems, setMeloloItems] = useState<any[]>([]);
  const [loadingMelolo, setLoadingMelolo] = useState(true);

  // 4. AsiaBox State
  const [dramaList, setDramaList] = useState<DracinItem[]>(REAL_DRACIN_SHORTS);
  const [loadingAsiaList, setLoadingAsiaList] = useState(true);

  // 5. ReelShort State
  const [reelShortCategory, setReelShortCategory] = useState("Billionaire");
  const [reelShortDramas, setReelShortDramas] = useState<ReelShortItem[]>([]);
  const [loadingReelShort, setLoadingReelShort] = useState(true);

  // 6. NetShort State
  const [netShortDramas, setNetShortDramas] = useState<NetShortItem[]>([]);
  const [loadingNetShort, setLoadingNetShort] = useState(true);

  // -------------------------------------------------------------
  // Data Fetching: FreeReels
  // -------------------------------------------------------------
  useEffect(() => {
    // Fetch categories and trending once
    fetch("/api/dracin?provider=freereels&action=categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.categories && Array.isArray(d.categories)) {
          setFreeReelsCategories(d.categories);
          if (d.categories.length > 0 && !selectedFreeCat) {
            setSelectedFreeCat(d.categories[0].tab_key);
          }
        }
      })
      .catch(() => {});

    fetch("/api/dracin?provider=freereels&action=trending")
      .then((r) => r.json())
      .then((d) => {
        if (d.trending && Array.isArray(d.trending)) {
          setFreeReelsTrending(d.trending.slice(0, 8));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoadingFreeReels(true);
    let url = `/api/dracin?provider=freereels&action=${freeReelsTab}&limit=12`;
    if (freeReelsTab === "category" && selectedFreeCat) {
      url = `/api/dracin?provider=freereels&action=category&id=${encodeURIComponent(selectedFreeCat)}&limit=12`;
    }

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d.items && Array.isArray(d.items)) {
          setFreeReelsItems(d.items);
        } else {
          setFreeReelsItems([]);
        }
      })
      .catch((err) => {
        console.error("FreeReels fetch error:", err);
        setFreeReelsItems([]);
      })
      .finally(() => setLoadingFreeReels(false));
  }, [freeReelsTab, selectedFreeCat]);

  // -------------------------------------------------------------
  // Data Fetching: PineDrama
  // -------------------------------------------------------------
  useEffect(() => {
    fetch("/api/dracin?provider=pinedrama&action=languages")
      .then((r) => r.json())
      .then((d) => {
        if (d.languages && Array.isArray(d.languages)) {
          setPineLanguages(d.languages);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoadingPine(true);
    fetch(`/api/dracin?provider=pinedrama&action=${pineTab}&lang=${pineLang}&limit=12`)
      .then((r) => r.json())
      .then((d) => {
        if (d.items && Array.isArray(d.items)) {
          setPineItems(d.items);
        } else {
          setPineItems([]);
        }
      })
      .catch(() => setPineItems([]))
      .finally(() => setLoadingPine(false));
  }, [pineTab, pineLang]);

  // -------------------------------------------------------------
  // Data Fetching: Melolo
  // -------------------------------------------------------------
  useEffect(() => {
    fetch("/api/dracin?provider=melolo&action=categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.categories && Array.isArray(d.categories)) {
          setMeloloCategories(d.categories.slice(0, 8));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoadingMelolo(true);
    fetch(`/api/dracin?provider=melolo&action=search&q=${encodeURIComponent(selectedMeloloCat)}&limit=12`)
      .then((r) => r.json())
      .then((d) => {
        if (d.items && Array.isArray(d.items)) {
          setMeloloItems(d.items);
        } else {
          setMeloloItems([]);
        }
      })
      .catch(() => setMeloloItems([]))
      .finally(() => setLoadingMelolo(false));
  }, [selectedMeloloCat]);

  // -------------------------------------------------------------
  // Data Fetching: AsiaBox, ReelShort, NetShort
  // -------------------------------------------------------------
  useEffect(() => {
    fetch("/api/dracin?action=home")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && d.items.length > 0) setDramaList(d.items);
      })
      .catch(() => {})
      .finally(() => setLoadingAsiaList(false));

    fetch("/api/netshort?action=list")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && Array.isArray(d.items)) setNetShortDramas(d.items);
      })
      .catch(() => {})
      .finally(() => setLoadingNetShort(false));
  }, []);

  useEffect(() => {
    setLoadingReelShort(true);
    fetch(`/api/reelshort?action=popular&category=${encodeURIComponent(reelShortCategory)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.items && Array.isArray(data.items)) setReelShortDramas(data.items);
      })
      .catch(() => {})
      .finally(() => setLoadingReelShort(false));
  }, [reelShortCategory]);

  return (
    <div className="min-h-screen bg-[#07070A] text-white flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Header Hub Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
        <div className="rounded-2xl bg-gradient-to-r from-rose-950/60 via-[#190F17] to-[#0D0D14] p-4 sm:p-6 border border-rose-500/20 shadow-xl flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-white flex items-center gap-2">
                <Video className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500 shrink-0" />
                <span>Short Drama Hub (9:16 Vertikal)</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
                Semua serial drama pendek vertikal rasio 9:16 dari 6 platform (FreeReels, PineDrama, Melolo, AsiaBox, ReelShort, NetShort) tergabung dalam 1 halaman. Klik judul untuk langsung menonton di player vertikal.
              </p>
            </div>

            {/* Quick jump anchor links */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <a
                href="#freereels"
                className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-500/30 hover:bg-rose-400 transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>FreeReels</span>
              </a>
              <a
                href="#pinedrama"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition-colors"
              >
                PineDrama
              </a>
              <a
                href="#melolo"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition-colors"
              >
                Melolo
              </a>
              <a
                href="#asiabox"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition-colors"
              >
                AsiaBox
              </a>
              <a
                href="#reelshort"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition-colors"
              >
                ReelShort
              </a>
              <a
                href="#netshort"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition-colors"
              >
                NetShort
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: FREEREELS (Flagship Multi-Sub Softsub 24 Bahasa) */}
      {/* ========================================================= */}
      <section id="freereels" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-4 w-full scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-rose-500/20">
          <div>
            <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <span>FreeReels Short Drama (HLS &amp; 24 Subtitles)</span>
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Streaming HLS multi-resolusi dengan pilihan subtitle eksternal (termasuk Bahasa Indonesia)
            </p>
          </div>

          {/* FreeReels Sub-feature Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setFreeReelsTab("feed")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                freeReelsTab === "feed"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3 h-3" /> Beranda
            </button>
            <button
              type="button"
              onClick={() => setFreeReelsTab("popular")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                freeReelsTab === "popular"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" /> Populer
            </button>
            <button
              type="button"
              onClick={() => setFreeReelsTab("soon")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                freeReelsTab === "soon"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Clock className="w-3 h-3 text-blue-400" /> Segera Tayang
            </button>
            <button
              type="button"
              onClick={() => setFreeReelsTab("freesoon")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                freeReelsTab === "freesoon"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Gift className="w-3 h-3 text-emerald-400" /> Gratis Harian
            </button>
            {freeReelsCategories.length > 0 && (
              <button
                type="button"
                onClick={() => setFreeReelsTab("category")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                  freeReelsTab === "category"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <Layers className="w-3 h-3 text-purple-400" /> Kategori
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Category Chips if Category Tab Active */}
        {freeReelsTab === "category" && freeReelsCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {freeReelsCategories.map((cat) => (
              <button
                key={cat.tab_key}
                type="button"
                onClick={() => setSelectedFreeCat(cat.tab_key)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  selectedFreeCat === cat.tab_key
                    ? "bg-purple-600 text-white font-bold"
                    : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* FreeReels Trending Keywords Chips */}
        {freeReelsTrending.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 bg-white/[0.02] p-2 rounded-xl border border-white/5">
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 shrink-0 mr-1">
              <TrendingUp className="w-3.5 h-3.5" /> Trending:
            </span>
            {freeReelsTrending.map((t, idx) => (
              <Link
                key={idx}
                href={`/dracin/watch?provider=freereels&id=${encodeURIComponent(t.id || t.key || "")}&title=${encodeURIComponent(t.name || t.title || "")}`}
                className="px-2.5 py-0.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-300 hover:text-white text-[11px] font-medium shrink-0 transition-colors border border-white/5"
              >
                {t.name || t.title}
              </Link>
            ))}
          </div>
        )}

        {/* FreeReels Catalog Grid */}
        {loadingFreeReels ? (
          <DracinReelsSkeleton />
        ) : freeReelsItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {freeReelsItems.map((item, idx) => {
              const itemId = item.id || item.key || `fr-${idx}`;
              const itemTitle = item.title || item.name || "FreeReels Short";
              return (
                <Link
                  key={idx}
                  href={`/dracin/watch?provider=freereels&id=${encodeURIComponent(itemId)}&title=${encodeURIComponent(itemTitle)}`}
                  className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-rose-500/40 transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-950/40"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                    {item.cover ? (
                      <img
                        src={item.cover}
                        alt={itemTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-rose-950/30 text-rose-300 text-xs text-center p-3">
                        {itemTitle}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl shadow-rose-600/50">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600/90 text-white shadow-sm flex items-center gap-1 backdrop-blur-sm">
                        <Sparkles className="w-2.5 h-2.5" />
                        FreeReels
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-emerald-300 backdrop-blur-sm border border-white/10">
                        24 Sub
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                      <p className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-rose-300 transition-colors">
                        {itemTitle}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 truncate">
                        Klik untuk tonton
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-400">
            Tidak ada drama ditemukan di kategori ini.
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: PINEDRAMA (TikTok Mini Drama 13 Bahasa Hardsub) */}
      {/* ========================================================= */}
      <section id="pinedrama" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-4 w-full scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-amber-500/20">
          <div>
            <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-400" />
              <span>PineDrama (TikTok Mini Drama)</span>
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Serial pendek trending ByteDance dengan subtitle hardsub bahasa terpilih
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
              <Globe className="w-3.5 h-3.5 text-amber-400 ml-1.5" />
              <select
                value={pineLang}
                onChange={(e) => setPineLang(e.target.value)}
                className="bg-transparent text-xs font-bold text-amber-300 focus:outline-none pr-2 cursor-pointer"
              >
                {pineLanguages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-[#12121A] text-white">
                    {l.name} ({l.code.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Pine Tabs */}
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setPineTab("popular")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  pineTab === "popular" ? "bg-amber-500 text-black" : "text-gray-300 hover:text-white"
                }`}
              >
                Populer
              </button>
              <button
                type="button"
                onClick={() => setPineTab("trending")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  pineTab === "trending" ? "bg-amber-500 text-black" : "text-gray-300 hover:text-white"
                }`}
              >
                Trending
              </button>
            </div>
          </div>
        </div>

        {/* PineDrama Grid */}
        {loadingPine ? (
          <DracinReelsSkeleton />
        ) : pineItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {pineItems.map((item, idx) => (
              <Link
                key={idx}
                href={`/dracin/watch?provider=pinedrama&id=${encodeURIComponent(item.id)}&title=${encodeURIComponent(item.title)}&lang=${pineLang}`}
                className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-amber-500/40 transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-950/40"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-950/30 text-amber-300 text-xs text-center p-3">
                      {item.title}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-xl shadow-amber-500/50">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black ml-0.5" />
                    </div>
                  </div>

                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-sm font-mono">
                      PINEDRAMA
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-amber-300 border border-white/10 uppercase">
                      {pineLang}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                    <p className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 truncate">
                      Klik untuk tonton
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-400">
            Tidak ada drama PineDrama ditemukan.
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: MELOLO (ByteDance Bilingual Drama) */}
      {/* ========================================================= */}
      {meloloCategories.length > 0 && (
        <section id="melolo" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-4 w-full scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cyan-500/20">
            <div>
              <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-cyan-400" />
                <span>Melolo (ByteDance Bilingual Drama)</span>
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Katalog serial pendek Melolo dengan subtitle bilingual English &amp; Mandarin
              </p>
            </div>

            {/* Melolo Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {meloloCategories.map((c) => (
                <button
                  key={c.id || c.name}
                  type="button"
                  onClick={() => setSelectedMeloloCat(c.name)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedMeloloCat === c.name
                      ? "bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30 scale-105"
                      : "bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {loadingMelolo ? (
            <DracinReelsSkeleton />
          ) : meloloItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {meloloItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/dracin/watch?provider=melolo&id=${encodeURIComponent(item.id || item.book_id)}&title=${encodeURIComponent(item.title || item.book_name || "Melolo Drama")}`}
                  className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-cyan-500/40 transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-950/40"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                    {item.cover || item.thumb_url ? (
                      <img
                        src={item.cover || item.thumb_url}
                        alt={item.title || item.book_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-cyan-950/30 text-cyan-300 text-xs text-center p-3">
                        {item.title || item.book_name}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-xl shadow-cyan-500/50">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black ml-0.5" />
                      </div>
                    </div>

                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-black shadow-sm font-mono">
                        MELOLO
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                      <p className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                        {item.title || item.book_name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 truncate">
                        Klik untuk tonton
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-gray-400">
              Katalog Melolo dalam pembaruan.
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* SECTION 4: ASIABOX CATALOG */}
      {/* ========================================================= */}
      <section id="asiabox" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-4 w-full scroll-mt-20">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <span>Koleksi Serial AsiaBox (Klik untuk Nonton)</span>
          </h2>
          <span className="text-xs text-gray-400">
            {loadingAsiaList ? "Memuat katalog..." : `${dramaList.length} Judul`}
          </span>
        </div>

        {loadingAsiaList ? (
          <DracinReelsSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {dramaList.map((drama, idx) => (
              <Link
                key={idx}
                href={`/dracin/watch?provider=asiabox&slug=${encodeURIComponent(drama.slug)}&title=${encodeURIComponent(drama.title)}`}
                className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-rose-500/40 transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-950/40"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
                  {drama.image ? (
                    <img
                      src={drama.image}
                      alt={drama.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-rose-950/30 text-rose-300 text-xs text-center p-3">
                      {drama.title}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl shadow-rose-600/50">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600/90 text-white shadow-sm flex items-center gap-1 backdrop-blur-sm">
                      <Sparkles className="w-2.5 h-2.5" />
                      AsiaBox
                    </span>
                    {drama.episodes && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-amber-300 backdrop-blur-sm border border-white/10">
                        {drama.episodes} Ep
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                    <p className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-rose-300 transition-colors">
                      {drama.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 truncate">
                      Klik untuk tonton
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: REELSHORT CATALOG */}
      {/* ========================================================= */}
      <section id="reelshort" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-4 w-full scroll-mt-20">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Koleksi ReelShort (Serial Romantis &amp; Billionaire)</span>
          </h2>
          <span className="text-xs text-gray-400">
            {loadingReelShort ? "Memuat..." : `${reelShortDramas.length} Judul`}
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="rounded-xl sm:rounded-2xl bg-[#121218] border border-white/10 p-2.5 sm:p-3 shadow-xl">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs text-gray-400 font-medium shrink-0 flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5 text-rose-400" /> Kategori:
            </span>
            {[
              "Billionaire",
              "Romance",
              "Revenge",
              "Werewolf",
              "Forbidden Love",
              "Marriage",
              "CEO",
              "Urban",
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setReelShortCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  reelShortCategory === cat
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loadingReelShort && (
          <div className="py-12 flex justify-center items-center">
            <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
          </div>
        )}

        {!loadingReelShort && reelShortDramas.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {reelShortDramas.map((item, idx) => (
              <Link
                key={idx}
                href={`/reelshort/watch?id=${item.book_id}&title=${encodeURIComponent(item.title)}`}
                className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-rose-500/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-950/40"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/70">
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-rose-950/20 text-xs text-rose-300 p-2 text-center">
                      {item.title}
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                    REELSHORT
                  </div>
                  {item.total_episodes ? (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-amber-300 text-[10px] font-bold border border-white/10 flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5" />
                      {item.total_episodes} Ep
                    </div>
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-lg shadow-rose-500/50 scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-gray-300">
                    {item.read_count ? (
                      <span className="bg-black/60 px-1.5 py-0.5 rounded">
                        {(item.read_count / 1000000).toFixed(1)}M
                      </span>
                    ) : null}

                    {item.collect_count ? (
                      <span className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded text-amber-300">
                        <Heart className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {(item.collect_count / 1000).toFixed(0)}k
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-rose-300 transition-colors leading-snug">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: NETSHORT CATALOG */}
      {/* ========================================================= */}
      <section id="netshort" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-4 w-full scroll-mt-20">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Koleksi NetShort (Drama Vertikal HD)</span>
          </h2>
          <span className="text-xs text-gray-400">
            {loadingNetShort ? "Memuat..." : `${netShortDramas.length} Judul`}
          </span>
        </div>

        {loadingNetShort && (
          <div className="py-12 flex justify-center items-center">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
        )}

        {!loadingNetShort && netShortDramas.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {netShortDramas.map((item, idx) => (
              <Link
                key={idx}
                href={`/netshort/watch?slug=${item.slug}&title=${encodeURIComponent(item.title)}`}
                className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#13131A] border border-white/5 hover:border-purple-500/40 transition-all flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-950/40"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/70">
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-950/20 text-xs text-purple-300 p-2 text-center">
                      {item.title}
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider">
                    NETSHORT
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg shadow-purple-600/50 scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                    </span>
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-purple-300 transition-colors leading-snug">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default function DracinHubPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070A] text-white flex items-center justify-center">
          <div className="text-center space-y-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 mx-auto" />
            <p className="text-xs text-rose-400 font-mono">Memuat Short Drama Hub...</p>
          </div>
        </div>
      }
    >
      <DracinHubContent />
    </Suspense>
  );
}
