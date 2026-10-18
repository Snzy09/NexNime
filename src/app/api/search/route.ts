import { NextResponse } from "next/server";
import { searchSamehadaku } from "@/lib/services/samehadakuService";
import { searchAnimeSail } from "@/lib/services/animesailService";
import { searchAnimeXin } from "@/lib/services/animexinService";
import { searchDonghua } from "@/lib/services/donghuaFilmService";
import { searchAnime } from "@/lib/services/animeService";
import {
  searchFreeReels,
  searchPineDrama,
  searchMelolo,
} from "@/lib/services/dramoxService";
import { searchDracin } from "@/lib/services/dracinService";
import { searchReelShort } from "@/lib/services/reelshortService";
import { searchNetShort } from "@/lib/services/netshortService";
import { searchDrakor } from "@/lib/services/drakorService";
import { searchOppaDrama } from "@/lib/services/oppadramaService";
import { searchManga } from "@/lib/services/mangaService";
import { searchNovel } from "@/lib/services/novelService";
import { searchVidbox } from "@/lib/services/vidboxService";

export interface UniversalSearchItem {
  id: string;
  title: string;
  cover: string;
  href: string;
  provider: string;
  category: "anime" | "dracin" | "drakor" | "manga" | "film" | "novel";
  badge?: string;
  subText?: string;
}

async function safeRun<T>(promise: Promise<T>, ms = 6500): Promise<T | null> {
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
    ]);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const limitParam = parseInt(searchParams.get("limit") || "12", 10);

  if (!q || q.length < 2) {
    return NextResponse.json({
      query: q,
      total: 0,
      counts: { all: 0, anime: 0, dracin: 0, drakor: 0, manga: 0, film: 0, novel: 0 },
      results: { anime: [], dracin: [], drakor: [], manga: [], film: [], novel: [] },
    });
  }

  // Run all provider queries in parallel with timeouts and error isolation
  const [
    // Anime & Donghua
    samehadakuRes,
    animeSailRes,
    animeXinRes,
    donghuaRes,
    animeRes,
    // Short Drama / Dracin
    freeReelsRes,
    pineDramaRes,
    meloloRes,
    reelShortRes,
    netShortRes,
    dracinAsiaRes,
    // Drakor
    drakorRes,
    oppaDramaRes,
    // Manga
    mangaRes,
    // Novel
    novelRes,
    // Film
    filmRes,
  ] = await Promise.all([
    safeRun(searchSamehadaku(q)),
    safeRun(searchAnimeSail(q)),
    safeRun(searchAnimeXin(q)),
    safeRun(searchDonghua(q)),
    safeRun(searchAnime(q)),

    safeRun(searchFreeReels(q, limitParam)),
    safeRun(searchPineDrama(q, "id", limitParam)),
    safeRun(searchMelolo(q, limitParam, "id")),
    safeRun(searchReelShort(q)),
    safeRun(searchNetShort(q)),
    safeRun(searchDracin(q)),

    safeRun(searchDrakor(q)),
    safeRun(searchOppaDrama(q)),

    safeRun(searchManga(q, limitParam)),
    safeRun(searchNovel(q)),
    safeRun(searchVidbox(q)),
  ]);

  // ----------------------------------------------------------------
  // 1. ANIME & DONGHUA RESULTS
  // ----------------------------------------------------------------
  const animeItems: UniversalSearchItem[] = [];
  const seenAnime = new Set<string>();

  (samehadakuRes || []).forEach((item: any) => {
    const key = `smh-${item.slug}`;
    if (!seenAnime.has(key) && item.title) {
      seenAnime.add(key);
      const cover = item.thumb || item.poster || item.thumbnail || "";
      animeItems.push({
        id: item.slug,
        title: item.title,
        cover,
        href: `/samehadaku/${item.slug}`,
        provider: "Samehadaku",
        category: "anime",
        badge: item.type || item.status || "Sub Indo",
        subText: item.score ? `★ ${item.score}` : undefined,
      });
    }
  });

  (animeSailRes?.items || []).forEach((item: any) => {
    const key = `as-${item.slug || item.url}`;
    if (!seenAnime.has(key) && item.title) {
      seenAnime.add(key);
      const cover = item.thumbnail || item.poster || item.thumb || "";
      animeItems.push({
        id: item.slug || item.url,
        title: item.title,
        cover,
        href: `/animesail/watch?slug=${item.slug}`,
        provider: "AnimeSail",
        category: "anime",
        badge: item.status || "Streaming",
        subText: item.type,
      });
    }
  });

  (animeXinRes || []).forEach((item: any) => {
    const key = `ax-${item.slug || item.url}`;
    if (!seenAnime.has(key) && item.title) {
      seenAnime.add(key);
      const raw = item.poster || item.thumbnail || item.cover || "";
      const cover = raw.startsWith("http")
        ? `/api/animexin?action=image&url=${encodeURIComponent(raw)}`
        : raw;
      animeItems.push({
        id: item.slug || item.url,
        title: item.title,
        cover,
        href: `/animexin/watch?slug=${item.slug}`,
        provider: "AnimeXin",
        category: "anime",
        badge: item.type || "Donghua",
        subText: item.status,
      });
    }
  });

  (donghuaRes?.results || []).forEach((item: any) => {
    const key = `dh-${item.slug}`;
    if (!seenAnime.has(key) && item.title) {
      seenAnime.add(key);
      const cover = item.poster || item.cover || item.thumbnail || "";
      animeItems.push({
        id: item.slug,
        title: item.title,
        cover,
        href: `/donghuafilm/watch?slug=${item.slug}`,
        provider: "DonghuaFilm",
        category: "anime",
        badge: item.type || "Donghua HD",
        subText: item.status,
      });
    }
  });

  (animeRes || []).forEach((item: any) => {
    const key = `otk-${item.slug}`;
    if (!seenAnime.has(key) && item.title) {
      seenAnime.add(key);
      let cover = item.poster || item.thumbnail || "";
      if (cover.includes("placeholder.svg")) cover = "";
      animeItems.push({
        id: item.slug,
        title: item.title,
        cover,
        href: `/anime/${item.slug}`,
        provider: "AnimeIndo",
        category: "anime",
        badge: item.status || "TV",
        subText: item.episode,
      });
    }
  });

  // ----------------------------------------------------------------
  // 2. SHORT DRAMA / DRACIN (9:16)
  // ----------------------------------------------------------------
  const dracinItems: UniversalSearchItem[] = [];
  const seenDracin = new Set<string>();

  (freeReelsRes || []).forEach((item: any) => {
    const id = item.id || item.key;
    const title = item.title || item.name;
    const key = `fr-${id}`;
    if (!seenDracin.has(key) && title) {
      seenDracin.add(key);
      dracinItems.push({
        id: String(id),
        title,
        cover: item.cover || "",
        href: `/dracin/watch?provider=freereels&id=${encodeURIComponent(id)}&title=${encodeURIComponent(title)}`,
        provider: "FreeReels",
        category: "dracin",
        badge: "HLS 24 Sub",
      });
    }
  });

  (pineDramaRes || []).forEach((item: any) => {
    const key = `pine-${item.id}`;
    if (!seenDracin.has(key) && item.title) {
      seenDracin.add(key);
      dracinItems.push({
        id: String(item.id),
        title: item.title,
        cover: item.cover || "",
        href: `/dracin/watch?provider=pinedrama&id=${encodeURIComponent(item.id)}&title=${encodeURIComponent(item.title)}&lang=id`,
        provider: "PineDrama",
        category: "dracin",
        badge: "TikTok Mini",
      });
    }
  });

  (meloloRes || []).forEach((item: any) => {
    const id = item.id || item.book_id;
    const title = item.title || item.book_name;
    const key = `melolo-${id}`;
    if (!seenDracin.has(key) && title) {
      seenDracin.add(key);
      dracinItems.push({
        id: String(id),
        title,
        cover: item.cover || item.thumb_url || "",
        href: `/dracin/watch?provider=melolo&id=${encodeURIComponent(id)}&title=${encodeURIComponent(title)}`,
        provider: "Melolo",
        category: "dracin",
        badge: "ByteDance",
      });
    }
  });

  (reelShortRes?.results || []).forEach((item: any) => {
    const key = `rs-${item.book_id}`;
    if (!seenDracin.has(key) && item.title) {
      seenDracin.add(key);
      dracinItems.push({
        id: String(item.book_id),
        title: item.title,
        cover: item.cover || "",
        href: `/reelshort/watch?id=${item.book_id}&title=${encodeURIComponent(item.title)}`,
        provider: "ReelShort",
        category: "dracin",
        badge: item.total_episodes ? `${item.total_episodes} Eps` : "Romance",
      });
    }
  });

  (netShortRes?.results || []).forEach((item: any) => {
    const key = `ns-${item.slug}`;
    if (!seenDracin.has(key) && item.title) {
      seenDracin.add(key);
      dracinItems.push({
        id: item.slug,
        title: item.title,
        cover: item.cover || "",
        href: `/netshort/watch?slug=${item.slug}&title=${encodeURIComponent(item.title)}`,
        provider: "NetShort",
        category: "dracin",
        badge: "Vertikal HD",
      });
    }
  });

  (dracinAsiaRes || []).forEach((item: any) => {
    const id = item.slug || item.id;
    const key = `asia-${id}`;
    if (!seenDracin.has(key) && item.title) {
      seenDracin.add(key);
      dracinItems.push({
        id: String(id),
        title: item.title,
        cover: item.image || item.cover || "",
        href: `/dracin/watch?provider=asiabox&slug=${encodeURIComponent(id)}&title=${encodeURIComponent(item.title)}`,
        provider: "AsiaBox",
        category: "dracin",
        badge: item.episodes ? `${item.episodes} Ep` : "Sub Indo",
      });
    }
  });

  // ----------------------------------------------------------------
  // 3. DRAMA KOREA & ASIA (DRAKOR)
  // ----------------------------------------------------------------
  const drakorItems: UniversalSearchItem[] = [];
  const seenDrakor = new Set<string>();

  (drakorRes || []).forEach((item: any) => {
    const key = `dk-${item.slug}`;
    if (!seenDrakor.has(key) && item.title) {
      seenDrakor.add(key);
      drakorItems.push({
        id: item.slug,
        title: item.title,
        cover: item.poster || "",
        href: `/drakor/${item.slug}`,
        provider: "DrakorID",
        category: "drakor",
        badge: item.episode || "Drakor",
        subText: item.rating ? `★ ${item.rating}` : undefined,
      });
    }
  });

  (oppaDramaRes?.results || []).forEach((item: any) => {
    const key = `od-${item.slug}`;
    if (!seenDrakor.has(key) && item.title) {
      seenDrakor.add(key);
      drakorItems.push({
        id: item.slug,
        title: item.title,
        cover: item.poster || "",
        href: `/oppadrama/watch?slug=${item.slug}`,
        provider: "OppaDrama",
        category: "drakor",
        badge: item.type || "Serial Asia",
        subText: item.status,
      });
    }
  });

  // ----------------------------------------------------------------
  // 4. MANGA & MANHWA
  // ----------------------------------------------------------------
  const mangaItems: UniversalSearchItem[] = [];
  const seenManga = new Set<string>();

  (mangaRes || []).forEach((item: any) => {
    const key = `mg-${item.id}`;
    if (!seenManga.has(key) && item.title) {
      seenManga.add(key);
      const cover = item.coverUrl || item.cover || item.image || item.thumbnail || "";
      mangaItems.push({
        id: item.id,
        title: item.title,
        cover,
        href: `/manga/${item.id}`,
        provider: "Komik",
        category: "manga",
        badge: item.type || "Manga",
        subText: item.latestChapter || item.status,
      });
    }
  });

  // ----------------------------------------------------------------
  // 5. FILM & MOVIE
  // ----------------------------------------------------------------
  const filmItems: UniversalSearchItem[] = [];
  const seenFilm = new Set<string>();

  (filmRes || []).forEach((item: any) => {
    const key = `film-${item.id}`;
    if (!seenFilm.has(key) && item.title) {
      seenFilm.add(key);
      filmItems.push({
        id: item.id,
        title: item.title,
        cover: item.poster || item.cover || item.thumbnail || "",
        href: `/film/watch?id=${item.id}&title=${encodeURIComponent(item.title)}`,
        provider: "VidBox",
        category: "film",
        badge: item.quality || "Movie HD",
        subText: item.year || item.rating,
      });
    }
  });

  // ----------------------------------------------------------------
  // 6. LIGHT NOVEL
  // ----------------------------------------------------------------
  const novelItems: UniversalSearchItem[] = [];
  const seenNovel = new Set<string>();

  (novelRes?.results || []).forEach((item: any) => {
    const id = item.url || item.id || item.title;
    const key = `nv-${id}`;
    if (!seenNovel.has(key) && item.title) {
      seenNovel.add(key);
      const rawThumb = item.thumbnail || item.cover || item.thumb || "";
      let cover = rawThumb;
      if (rawThumb && rawThumb.startsWith("http")) {
        cover = `/api/novel?action=image&url=${encodeURIComponent(rawThumb)}`;
      } else if (rawThumb) {
        cover = `https://bacaln.com/${rawThumb.replace(/^\//, "")}`;
      }
      novelItems.push({
        id,
        title: item.title,
        cover,
        href: `/novel/read?url=${encodeURIComponent(item.url || "")}`,
        provider: "BacaLN",
        category: "novel",
        badge: item.author || "Light Novel",
        subText: item.latestChapter,
      });
    }
  });

  const total =
    animeItems.length +
    dracinItems.length +
    drakorItems.length +
    mangaItems.length +
    filmItems.length +
    novelItems.length;

  return NextResponse.json({
    query: q,
    total,
    counts: {
      all: total,
      anime: animeItems.length,
      dracin: dracinItems.length,
      drakor: drakorItems.length,
      manga: mangaItems.length,
      film: filmItems.length,
      novel: novelItems.length,
    },
    results: {
      anime: animeItems,
      dracin: dracinItems,
      drakor: drakorItems,
      manga: mangaItems,
      film: filmItems,
      novel: novelItems,
    },
  });
}
