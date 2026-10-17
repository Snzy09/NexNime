/**
 * Dramox ShortDrama Platform Service
 * Providers: FreeReels (HLS + 24 Subtitles), PineDrama (TikTok Mini Drama), Melolo (ByteDance)
 * Base: https://app.dramox.bond
 */

const BASE_URL = "https://app.dramox.bond";

export interface FreeReelsItem {
  id?: string;
  key?: string;
  title?: string;
  name?: string;
  cover?: string;
  desc?: string;
  labels?: string;
  series_tag?: string[];
  total_episodes?: number;
  episode_count?: number;
  booking_count?: number;
  listing_time?: number;
}

export interface FreeReelsCategory {
  name: string;
  tab_key: string;
  position_index?: number;
  business_name?: string;
}

export interface FreeReelsSubtitle {
  language: string;
  name: string;
  vtt_url?: string;
  srt_url?: string;
}

export interface FreeReelsStream {
  success: boolean;
  series_id: string;
  episode_key: string;
  stream_url: string;
  raw_stream_url?: string;
  proxy_stream_url?: string;
  subtitle_type?: string;
  subtitles?: FreeReelsSubtitle[];
  error?: string;
}

export interface PineDramaLanguage {
  code: string;
  name: string;
  region?: string;
}

export interface PineDramaItem {
  id: string;
  collection_id?: string;
  title: string;
  cover: string;
  summary?: string;
  total?: number;
  views?: number;
}

export interface PineDramaEpisode {
  num: number;
  seq_id: number;
  video_id: string;
  is_limited_free?: boolean;
  is_paid?: boolean;
}

export interface MeloloItem {
  id: string;
  title: string;
  cover: string;
  intro?: string;
  book_name?: string;
  thumb_url?: string;
  total_episode?: number;
}

async function fetchDramox(endpoint: string) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
    next: { revalidate: 300 }, // 5 min cache
  });
  if (!res.ok) {
    throw new Error(`Dramox API error ${res.status}: ${res.statusText}`);
  }
  return await res.json();
}

// -------------------------------------------------------------
// FreeReels API Methods
// -------------------------------------------------------------

export async function getFreeReelsFeed(limit = 12): Promise<FreeReelsItem[]> {
  try {
    const data = await fetchDramox(`/api/freereels/feed?limit=${limit}`);
    return data.items || [];
  } catch (e) {
    console.error("FreeReels feed error:", e);
    return [];
  }
}

export async function getFreeReelsPopular(limit = 12): Promise<FreeReelsItem[]> {
  try {
    const data = await fetchDramox(`/api/freereels/popular?limit=${limit}`);
    if (Array.isArray(data)) return data;
    if (data.items) return data.items;
    // Normalized dictionary {"0": {...}, "1": {...}}
    return Object.values(data).filter(
      (v: any) => v && typeof v === "object" && (v.id || v.title)
    ) as FreeReelsItem[];
  } catch (e) {
    console.error("FreeReels popular error:", e);
    return [];
  }
}

export async function getFreeReelsSoon(limit = 12): Promise<FreeReelsItem[]> {
  try {
    const data = await fetchDramox(`/api/freereels/soon?limit=${limit}`);
    if (Array.isArray(data)) return data;
    if (data.items) return data.items;
    return Object.values(data).filter(
      (v: any) => v && typeof v === "object" && (v.id || v.title)
    ) as FreeReelsItem[];
  } catch (e) {
    console.error("FreeReels soon error:", e);
    return [];
  }
}

export async function getFreeReelsFreeSoon(limit = 12): Promise<FreeReelsItem[]> {
  try {
    const data = await fetchDramox(`/api/freereels/freesoon?limit=${limit}`);
    if (Array.isArray(data)) return data;
    if (data.items) return data.items;
    return Object.values(data).filter(
      (v: any) => v && typeof v === "object" && (v.id || v.title)
    ) as FreeReelsItem[];
  } catch (e) {
    console.error("FreeReels freesoon error:", e);
    return [];
  }
}

export async function getFreeReelsCategories(): Promise<FreeReelsCategory[]> {
  try {
    const data = await fetchDramox("/api/freereels/categories");
    return data.categories || [];
  } catch (e) {
    console.error("FreeReels categories error:", e);
    return [];
  }
}

export async function getFreeReelsCategory(
  id: string,
  limit = 12
): Promise<FreeReelsItem[]> {
  try {
    const data = await fetchDramox(`/api/freereels/category/${encodeURIComponent(id)}?limit=${limit}`);
    if (Array.isArray(data)) return data;
    if (data.items) return data.items;
    return Object.values(data).filter(
      (v: any) => v && typeof v === "object" && (v.id || v.title)
    ) as FreeReelsItem[];
  } catch (e) {
    console.error("FreeReels category error:", e);
    return [];
  }
}

export async function getFreeReelsTrending(): Promise<any[]> {
  try {
    const data = await fetchDramox("/api/freereels/trending");
    return data.trending || [];
  } catch (e) {
    console.error("FreeReels trending error:", e);
    return [];
  }
}

export async function searchFreeReels(q: string, limit = 15): Promise<FreeReelsItem[]> {
  try {
    const data = await fetchDramox(`/api/freereels/search?q=${encodeURIComponent(q)}&limit=${limit}`);
    return data.items || [];
  } catch (e) {
    console.error("FreeReels search error:", e);
    return [];
  }
}

export async function getFreeReelsInfo(id: string) {
  try {
    const data = await fetchDramox(`/api/freereels/info/${encodeURIComponent(id)}`);
    return data;
  } catch (e) {
    console.error("FreeReels info error:", e);
    return null;
  }
}

export async function getFreeReelsEpisodes(id: string) {
  try {
    const data = await fetchDramox(`/api/freereels/episodes/${encodeURIComponent(id)}`);
    return data;
  } catch (e) {
    console.error("FreeReels episodes error:", e);
    return null;
  }
}

export async function getFreeReelsStream(id: string, ep: string | number): Promise<FreeReelsStream | null> {
  try {
    const data = await fetchDramox(`/api/freereels/stream/${encodeURIComponent(id)}/${encodeURIComponent(ep)}`);
    return data;
  } catch (e) {
    console.error("FreeReels stream error:", e);
    return null;
  }
}

// -------------------------------------------------------------
// PineDrama API Methods
// -------------------------------------------------------------

export async function getPineDramaLanguages(): Promise<PineDramaLanguage[]> {
  try {
    const data = await fetchDramox("/api/pinedrama/languages");
    return data.languages || [];
  } catch (e) {
    console.error("PineDrama languages error:", e);
    return [
      { code: "id", name: "Indonesian" },
      { code: "en", name: "English" },
      { code: "th", name: "Thai" },
      { code: "vi", name: "Vietnamese" },
      { code: "es", name: "Spanish" },
    ];
  }
}

export async function getPineDramaPopular(lang = "id", count = 12): Promise<PineDramaItem[]> {
  try {
    const data = await fetchDramox(`/api/pinedrama/popular?lang=${encodeURIComponent(lang)}&count=${count}`);
    return data.items || [];
  } catch (e) {
    console.error("PineDrama popular error:", e);
    return [];
  }
}

export async function getPineDramaTrending(lang = "id", count = 12): Promise<PineDramaItem[]> {
  try {
    const data = await fetchDramox(`/api/pinedrama/trending?lang=${encodeURIComponent(lang)}&count=${count}`);
    return data.items || [];
  } catch (e) {
    console.error("PineDrama trending error:", e);
    return [];
  }
}

export async function getPineDramaCategories(lang = "id"): Promise<any[]> {
  try {
    const data = await fetchDramox(`/api/pinedrama/categories?lang=${encodeURIComponent(lang)}`);
    return data.categories || [];
  } catch (e) {
    console.error("PineDrama categories error:", e);
    return [];
  }
}

export async function searchPineDrama(q: string, lang = "id", count = 15): Promise<PineDramaItem[]> {
  try {
    const data = await fetchDramox(`/api/pinedrama/search?q=${encodeURIComponent(q)}&lang=${encodeURIComponent(lang)}&count=${count}`);
    return data.items || [];
  } catch (e) {
    console.error("PineDrama search error:", e);
    return [];
  }
}

export async function getPineDramaInfo(id: string, lang = "id") {
  try {
    const data = await fetchDramox(`/api/pinedrama/info/${encodeURIComponent(id)}?lang=${encodeURIComponent(lang)}`);
    return data;
  } catch (e) {
    console.error("PineDrama info error:", e);
    return null;
  }
}

export async function getPineDramaEpisodes(id: string) {
  try {
    const data = await fetchDramox(`/api/pinedrama/episodes/${encodeURIComponent(id)}`);
    return data;
  } catch (e) {
    console.error("PineDrama episodes error:", e);
    return null;
  }
}

export async function getPineDramaStream(id: string, ep: string | number, lang = "id") {
  try {
    const data = await fetchDramox(`/api/pinedrama/stream/${encodeURIComponent(id)}/${encodeURIComponent(ep)}?lang=${encodeURIComponent(lang)}`);
    return data;
  } catch (e) {
    console.error("PineDrama stream error:", e);
    return null;
  }
}

// -------------------------------------------------------------
// Melolo API Methods
// -------------------------------------------------------------

export async function getMeloloCategories(): Promise<any[]> {
  try {
    const data = await fetchDramox("/api/melolo/categories");
    return data.categories || [];
  } catch (e) {
    console.error("Melolo categories error:", e);
    return [];
  }
}

export async function searchMelolo(q: string, limit = 15, lang = "id"): Promise<any[]> {
  try {
    const data = await fetchDramox(`/api/melolo/search?q=${encodeURIComponent(q)}&limit=${limit}&lang=${encodeURIComponent(lang)}`);
    return data.results || data.items || [];
  } catch (e) {
    console.error("Melolo search error:", e);
    return [];
  }
}

export async function getMeloloEpisodes(id: string) {
  try {
    const data = await fetchDramox(`/api/melolo/episodes/${encodeURIComponent(id)}`);
    return data;
  } catch (e) {
    console.error("Melolo episodes error:", e);
    return null;
  }
}

export async function getMeloloStream(id: string, ep: string | number, lang = "en") {
  try {
    const data = await fetchDramox(`/api/melolo/stream/${encodeURIComponent(id)}/${encodeURIComponent(ep)}?lang=${encodeURIComponent(lang)}`);
    return data;
  } catch (e) {
    console.error("Melolo stream error:", e);
    return null;
  }
}
