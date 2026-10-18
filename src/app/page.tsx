"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import HeroBanner from "@/components/HeroBanner";
import PopularRankingSection from "@/components/PopularRankingSection";
import ScheduleSection from "@/components/ScheduleSection";
import CatalogFilterGrid from "@/components/CatalogFilterGrid";
import MangaSpotlightSection from "@/components/MangaSpotlightSection";
import DrakorSection from "@/components/DrakorSection";
import DracinReelsSection from "@/components/DracinReelsSection";
import ReelShortSection, { ReelShortItem } from "@/components/ReelShortSection";
import NetShortSection from "@/components/NetShortSection";
import AnimeXinSection from "@/components/AnimeXinSection";
import AnimeSailSection from "@/components/AnimeSailSection";
import OppaDramaSection from "@/components/OppaDramaSection";
import NovelSection from "@/components/NovelSection";
import ContinueWatchingSection from "@/components/ContinueWatchingSection";
import { NetShortItem } from "@/lib/services/netshortService";
import { AnimeXinItem } from "@/lib/services/animexinService";
import { AnimeSailCard } from "@/lib/services/animesailService";
import { OppaDramaCard } from "@/lib/services/oppadramaService";
import { NovelCard } from "@/lib/services/novelService";
import Footer from "@/components/Footer";

// Skeletons
import HeroSkeleton from "@/components/skeletons/HeroSkeleton";
import RankingCardsSkeleton from "@/components/skeletons/RankingCardsSkeleton";
import ScheduleSkeleton from "@/components/skeletons/ScheduleSkeleton";
import CatalogGridSkeleton from "@/components/skeletons/CatalogGridSkeleton";
import MangaSpotlightSkeleton from "@/components/skeletons/MangaSpotlightSkeleton";
import DrakorSkeleton from "@/components/skeletons/DrakorSkeleton";
import DracinReelsSkeleton from "@/components/skeletons/DracinReelsSkeleton";

import { AnimeItem, ScheduleDay } from "@/lib/services/animeService";
import { MangaItem } from "@/lib/services/mangaService";
import { DrakorItem } from "@/lib/services/drakorService";
import { DracinItem } from "@/lib/services/dracinService";

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Data states
  const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
  const [scheduleList, setScheduleList] = useState<ScheduleDay[]>([]);
  const [mangaList, setMangaList] = useState<MangaItem[]>([]);
  const [drakorList, setDrakorList] = useState<DrakorItem[]>([]);
  const [dracinList, setDracinList] = useState<DracinItem[]>([]);
  const [reelshortList, setReelshortList] = useState<ReelShortItem[]>([]);
  const [netshortList, setNetshortList] = useState<NetShortItem[]>([]);
  const [animexinList, setAnimexinList] = useState<AnimeXinItem[]>([]);
  const [animeSailList, setAnimeSailList] = useState<AnimeSailCard[]>([]);
  const [oppadramaList, setOppadramaList] = useState<OppaDramaCard[]>([]);
  const [novelList, setNovelList] = useState<NovelCard[]>([]);

  // Loading states for skeletons
  const [loadingAnime, setLoadingAnime] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loadingManga, setLoadingManga] = useState(true);
  const [loadingDrakor, setLoadingDrakor] = useState(true);
  const [loadingDracin, setLoadingDracin] = useState(true);
  const [loadingReelshort, setLoadingReelshort] = useState(true);
  const [loadingNetshort, setLoadingNetshort] = useState(true);
  const [loadingAnimexin, setLoadingAnimexin] = useState(true);
  const [loadingAnimeSail, setLoadingAnimeSail] = useState(true);
  const [loadingOppadrama, setLoadingOppadrama] = useState(true);
  const [loadingNovel, setLoadingNovel] = useState(true);

  useEffect(() => {
    // 1. Scrape Real Anime from AnimeIndo
    fetch("/api/anime?action=popular")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && d.items.length > 0) setAnimeList(d.items);
      })
      .catch((e) => console.error("Anime fetch error:", e))
      .finally(() => setLoadingAnime(false));

    // 2. Scrape Real Schedule
    fetch("/api/anime?action=schedule")
      .then((r) => r.json())
      .then((d) => {
        if (d.schedule && d.schedule.length > 0) setScheduleList(d.schedule);
      })
      .catch((e) => console.error("Schedule fetch error:", e))
      .finally(() => setLoadingSchedule(false));

    // 3. Scrape Real Manga from MangaDex
    fetch("/api/manga?action=popular")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && d.items.length > 0) setMangaList(d.items);
      })
      .catch((e) => console.error("Manga fetch error:", e))
      .finally(() => setLoadingManga(false));

    // 4. Scrape Real Drakor from DrakorID
    fetch("/api/drakor?action=trending")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && d.items.length > 0) setDrakorList(d.items);
      })
      .catch((e) => console.error("Drakor fetch error:", e))
      .finally(() => setLoadingDrakor(false));

    // 5. Scrape Real Dracin from AsiaBox
    fetch("/api/dracin?action=home")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && d.items.length > 0) setDracinList(d.items);
      })
      .catch((e) => console.error("Dracin fetch error:", e))
      .finally(() => setLoadingDracin(false));

    // 6. Scrape Real ReelShort Vertical Drama
    fetch("/api/reelshort?action=popular&category=Billionaire")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && d.items.length > 0) setReelshortList(d.items);
      })
      .catch((e) => console.error("ReelShort fetch error:", e))
      .finally(() => setLoadingReelshort(false));

    // 7. Scrape Real NetShort Vertical Drama
    fetch("/api/netshort?action=list")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && d.items.length > 0) setNetshortList(d.items);
      })
      .catch((e) => console.error("NetShort fetch error:", e))
      .finally(() => setLoadingNetshort(false));

    // 8. Scrape Real AnimeXin Donghua Hub
    fetch("/api/animexin?action=latest")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && d.items.length > 0) setAnimexinList(d.items);
      })
      .catch((e) => console.error("AnimeXin fetch error:", e))
      .finally(() => setLoadingAnimexin(false));

    // 9. Scrape Real AnimeSail Updates
    fetch("/api/animesail?action=latest")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && d.items.length > 0) setAnimeSailList(d.items);
      })
      .catch((e) => console.error("AnimeSail fetch error:", e))
      .finally(() => setLoadingAnimeSail(false));

    // 10. Scrape Real OppaDrama Drakor & Movies
    fetch("/api/oppadrama?action=latest")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && d.items.length > 0) setOppadramaList(d.items);
      })
      .catch((e) => console.error("OppaDrama fetch error:", e))
      .finally(() => setLoadingOppadrama(false));

    // 11. Scrape Real BacaLN Light Novels
    fetch("/api/novel?action=latest")
      .then((r) => r.json())
      .then((d) => {
        if (d.items && d.items.length > 0) setNovelList(d.items);
      })
      .catch((e) => console.error("Novel fetch error:", e))
      .finally(() => setLoadingNovel(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col selection:bg-amber-400 selection:text-black">
      {/* Top Navbar */}
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Global Quick Search Modal (Ctrl+K) */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Main Content Sections with Skeleton Loaders */}
      <main className="flex-1 space-y-6">
        {/* 1. Hero Banner with Realtime Scraped Backgrounds & Data */}
        {loadingAnime && animeList.length === 0 ? (
          <HeroSkeleton />
        ) : (
          <HeroBanner
            animeList={animeList}
            mangaList={mangaList}
            drakorList={drakorList}
            dracinList={dracinList}
            animexinList={animexinList}
          />
        )}

        {/* Continue Watching / Lanjutkan Menonton (Saved Progress) */}
        <ContinueWatchingSection />

        {/* 2. Anime Populer Pekan Ini (Screenshot 2) */}
        {loadingAnime ? (
          <RankingCardsSkeleton />
        ) : (
          <PopularRankingSection items={animeList} />
        )}

        {/* 3. Jadwal Rilis Hari Ini (Screenshot 3) */}
        {loadingSchedule ? (
          <ScheduleSkeleton />
        ) : (
          <ScheduleSection schedule={scheduleList} />
        )}

        {/* 4. Katalog Anime Lengkap with Filters (Screenshot 4) */}
        {loadingAnime ? (
          <CatalogGridSkeleton count={12} />
        ) : (
          <CatalogFilterGrid items={animeList} />
        )}

        {/* 5. Manga & Manhwa Reading Spotlight (Screenshot 5) */}
        {loadingManga ? (
          <MangaSpotlightSkeleton />
        ) : (
          <MangaSpotlightSection items={mangaList} />
        )}

        {/* 6. Drama Korea (Drakor) Streaming Hub */}
        {loadingDrakor ? (
          <DrakorSkeleton />
        ) : (
          <DrakorSection items={drakorList} />
        )}

        {/* 7. Dracin Short Video Reels */}
        {loadingDracin ? (
          <DracinReelsSkeleton />
        ) : (
          <DracinReelsSection items={dracinList} />
        )}

        {/* 8. ReelShort Vertical Drama Reels */}
        {loadingReelshort ? (
          <DracinReelsSkeleton />
        ) : (
          <ReelShortSection items={reelshortList} />
        )}

        {/* 9. NetShort Vertical Drama Reels */}
        {loadingNetshort ? (
          <DracinReelsSkeleton />
        ) : (
          <NetShortSection items={netshortList} />
        )}

        {/* 10. AnimeXin Donghua Animation Hub */}
        {loadingAnimexin ? (
          <CatalogGridSkeleton count={6} />
        ) : (
          <AnimeXinSection items={animexinList} />
        )}

        {/* 11. AnimeSail Streaming Hub */}
        {loadingAnimeSail ? (
          <CatalogGridSkeleton count={6} />
        ) : (
          <AnimeSailSection items={animeSailList} />
        )}

        {/* 12. OppaDrama Streaming Hub */}
        {loadingOppadrama ? (
          <CatalogGridSkeleton count={6} />
        ) : (
          <OppaDramaSection items={oppadramaList} />
        )}

        {/* 13. BacaLN Light Novel Hub */}
        {loadingNovel ? (
          <CatalogGridSkeleton count={6} />
        ) : (
          <NovelSection items={novelList} />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
