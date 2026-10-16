/**
 * MangaDex Scraper Service
 * Creator: IzzXd
 * Base: https://mangadex.org
 * API: https://api.mangadex.org
 */

if (typeof process !== "undefined") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import dns from "dns";
import https from "https";
import axios from "axios";

export * from "./mangaTypes";
import {
  MangaItem,
  MangaChapter,
  MangaDetail,
  ChapterPages,
  ChapterDownload,
  CREATOR,
  SALURAN,
} from "./mangaTypes";

// MangaDex real load balancer IPs (bypasses ISP/DNS poisoning to 127.0.0.1 or 103.169.239.26)
export const MANGADEX_IP = "45.129.229.1";
export const AT_HOME_IP = "104.26.2.73";

export const customAgent = new https.Agent({
  rejectUnauthorized: false,
  lookup: (hostname, options, callback) => {
    const cb = typeof options === "function" ? options : callback;
    const opts = typeof options === "object" ? options : {};
    if (hostname === "api.mangadex.org" || hostname === "uploads.mangadex.org") {
      if (opts.all) {
        return cb(null, [{ address: MANGADEX_IP, family: 4 }]);
      }
      return cb(null, MANGADEX_IP, 4);
    }
    if (hostname.endsWith(".mangadex.network") || hostname === "mangadex.network") {
      if (opts.all) {
        return cb(null, [{ address: AT_HOME_IP, family: 4 }]);
      }
      return cb(null, AT_HOME_IP, 4);
    }
    dns.lookup(hostname, options, callback);
  },
});

export function proxyMangaImage(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("/api/manga?action=image")) return url;
  return `/api/manga?action=image&url=${encodeURIComponent(url)}`;
}

const client = axios.create({
  baseURL: "https://api.mangadex.org",
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    Accept: "application/json",
  },
  httpsAgent: customAgent,
});

export function parseId(url: string): { type: "manga" | "chapter"; id: string } | null {
  if (!url) return null;
  const mangaMatch = url.match(/mangadex\.org\/title\/([a-f0-9-]{36})/i);
  const chapterMatch = url.match(/mangadex\.org\/chapter\/([a-f0-9-]{36})/i);
  if (mangaMatch) return { type: "manga", id: mangaMatch[1] };
  if (chapterMatch) return { type: "chapter", id: chapterMatch[1] };
  if (/^[a-f0-9-]{36}$/i.test(url.trim())) return { type: "manga", id: url.trim() };
  return null;
}

function getTitle(titles: any): string {
  if (!titles) return "Unknown";
  if (typeof titles === "string") return titles;
  return (
    titles.en ||
    titles["ja-ro"] ||
    titles.ko ||
    titles.id ||
    Object.values(titles)[0] ||
    "Unknown"
  );
}

export async function getPopularManga(): Promise<MangaItem[]> {
  try {
    const res = await client.get("/manga", {
      params: {
        limit: 18,
        "includes[]": "cover_art",
        "order[followedCount]": "desc",
        "contentRating[]": ["safe", "suggestive"],
      },
    });

    if (!res.data || res.data.result !== "ok" || !res.data.data) return [];

    return res.data.data.map((m: any) => {
      const cover = m.relationships?.find((r: any) => r.type === "cover_art");
      const tags = (m.attributes?.tags || []).map((t: any) => getTitle(t.attributes?.name));
      const origLang = m.attributes?.originalLanguage;
      const isManhwa = tags.includes("Manhwa") || origLang === "ko";
      const isManhua = tags.includes("Manhua") || origLang === "zh";

      return {
        id: m.id,
        title: getTitle(m.attributes?.title),
        status: m.attributes?.status || "ongoing",
        year: m.attributes?.year,
        contentRating: m.attributes?.contentRating || "safe",
        tags,
        type: isManhwa ? "Manhwa" : isManhua ? "Manhua" : "Manga",
        coverUrl: cover
          ? proxyMangaImage(`https://uploads.mangadex.org/covers/${m.id}/${cover.attributes?.fileName}.512.jpg`)
          : null,
        url: `https://mangadex.org/title/${m.id}`,
        synopsis: getTitle(m.attributes?.description) || "",
      };
    });
  } catch (err: any) {
    console.error("getPopularManga error:", err.message);
    return [];
  }
}

export async function searchManga(query: string, limit = 18): Promise<MangaItem[]> {
  try {
    const parsed = parseId(query);
    if (parsed && parsed.type === "manga") {
      const single = await getMangaDetail(parsed.id);
      if (single) return [single.manga];
    }

    const res = await client.get("/manga", {
      params: {
        title: query,
        limit,
        "includes[]": "cover_art",
        "order[relevance]": "desc",
        "contentRating[]": ["safe", "suggestive", "erotica"],
      },
    });

    if (!res.data || res.data.result !== "ok" || !res.data.data) return [];

    return res.data.data.map((m: any) => {
      const cover = m.relationships?.find((r: any) => r.type === "cover_art");
      const tags = (m.attributes?.tags || []).map((t: any) => getTitle(t.attributes?.name));
      const origLang = m.attributes?.originalLanguage;
      const isManhwa = tags.includes("Manhwa") || origLang === "ko";
      const isManhua = tags.includes("Manhua") || origLang === "zh";

      return {
        id: m.id,
        title: getTitle(m.attributes?.title),
        status: m.attributes?.status || "ongoing",
        year: m.attributes?.year,
        contentRating: m.attributes?.contentRating || "safe",
        tags,
        type: isManhwa ? "Manhwa" : isManhua ? "Manhua" : "Manga",
        coverUrl: cover
          ? proxyMangaImage(`https://uploads.mangadex.org/covers/${m.id}/${cover.attributes?.fileName}.512.jpg`)
          : null,
        url: `https://mangadex.org/title/${m.id}`,
        synopsis: getTitle(m.attributes?.description) || "",
      };
    });
  } catch (err: any) {
    console.error("searchManga error:", err.message);
    return [];
  }
}

export async function getMangaDetail(target: string, lang: string = "all"): Promise<MangaDetail | null> {
  try {
    const parsed = parseId(target) || { type: "manga", id: target };
    let mangaId = parsed.id;

    // If target is not a 36-char UUID, resolve title/slug to UUID
    if (!/^[a-f0-9-]{36}$/i.test(mangaId)) {
      const cleanTitle = decodeURIComponent(mangaId).replace(/-/g, " ").trim();
      const searchResults = await searchManga(cleanTitle, 5);
      if (searchResults.length > 0) {
        mangaId = searchResults[0].id;
      } else {
        return null;
      }
    }

    const res = await client.get(
      `/manga/${mangaId}?includes[]=cover_art&includes[]=author&includes[]=artist`
    );
    if (!res.data || res.data.result !== "ok") return null;

    const m = res.data.data;
    const attr = m.attributes;
    const cover = m.relationships?.find((r: any) => r.type === "cover_art");
    const author = m.relationships?.find((r: any) => r.type === "author");
    const artist = m.relationships?.find((r: any) => r.type === "artist");
    const tags = (attr.tags || []).map((t: any) => getTitle(t.attributes?.name));

    // Fetch real chapters feed
    const fetchFeed = async (language?: string) => {
      const params: any = {
        limit: 100,
        "order[chapter]": "desc",
        "includes[]": "scanlation_group",
        "contentRating[]": ["safe", "suggestive", "erotica"],
      };
      if (language && language !== "all") {
        params["translatedLanguage[]"] = language;
      }
      return client.get(`/manga/${mangaId}/feed`, { params });
    };

    let feedRes = await fetchFeed(lang);
    let chList = (feedRes.data?.data || []).filter((c: any) => (c.attributes?.pages ?? 1) > 0);

    if (chList.length === 0 && lang !== "en" && lang !== "all") {
      feedRes = await fetchFeed("en");
      chList = (feedRes.data?.data || []).filter((c: any) => (c.attributes?.pages ?? 1) > 0);
    }

    if (chList.length === 0 && lang !== "all") {
      feedRes = await fetchFeed("all");
      chList = (feedRes.data?.data || []).filter((c: any) => (c.attributes?.pages ?? 1) > 0);
    }

    // If still 0 with pages > 0, take all available chapters
    if (chList.length === 0) {
      chList = feedRes.data?.data || [];
    }

    const chapters: MangaChapter[] = chList.map((ch: any) => {
      const a = ch.attributes;
      const group = ch.relationships?.find((r: any) => r.type === "scanlation_group");
      return {
        id: ch.id,
        chapter: a.chapter || "1",
        volume: a.volume || null,
        title: a.title || null,
        pages: a.pages || 0,
        language: a.translatedLanguage || "en",
        group: group?.attributes?.name || "Scanlation",
        publishAt: a.publishAt || new Date().toISOString(),
        url: `https://mangadex.org/chapter/${ch.id}`,
      };
    });

    const origLang = attr.originalLanguage;
    const isManhwa = tags.includes("Manhwa") || origLang === "ko";
    const isManhua = tags.includes("Manhua") || origLang === "zh";

    return {
      manga: {
        id: m.id,
        title: getTitle(attr.title),
        status: attr.status,
        year: attr.year,
        contentRating: attr.contentRating,
        tags,
        type: isManhwa ? "Manhwa" : isManhua ? "Manhua" : "Manga",
        coverUrl: cover
          ? proxyMangaImage(`https://uploads.mangadex.org/covers/${mangaId}/${cover.attributes?.fileName}.512.jpg`)
          : null,
        url: `https://mangadex.org/title/${mangaId}`,
        synopsis: getTitle(attr.description),
        author: author?.attributes?.name,
        artist: artist?.attributes?.name,
      },
      totalChapters: chapters.length,
      chapters,
    };
  } catch (err: any) {
    console.error("getMangaDetail error:", err.message);
    return null;
  }
}

export async function getChapterPages(target: string): Promise<ChapterPages | null> {
  try {
    const parsed = parseId(target) || { type: "chapter", id: target };
    let chapterId = parsed.id;

    if (!/^[a-f0-9-]{36}$/i.test(chapterId)) {
      const detail = await getMangaDetail(chapterId, "all");
      if (detail && detail.chapters.length > 0) {
        chapterId = detail.chapters[0].id;
      }
    }

    const [chRes, srvRes] = await Promise.all([
      client.get(`/chapter/${chapterId}?includes[]=manga`),
      client.get(`/at-home/server/${chapterId}`),
    ]);

    if (!chRes.data || chRes.data.result !== "ok") return null;
    if (!srvRes.data || srvRes.data.result !== "ok") return null;

    const ch = chRes.data.data;
    const attr = ch.attributes;
    const manga = ch.relationships?.find((r: any) => r.type === "manga");
    const { baseUrl, chapter: pageData } = srvRes.data;

    return {
      id: ch.id,
      chapter: attr.chapter,
      volume: attr.volume || null,
      title: attr.title || null,
      language: attr.translatedLanguage,
      totalPages: pageData.data.length,
      mangaId: manga?.id || null,
      mangaTitle: manga ? getTitle(manga.attributes?.title) : null,
      images: {
        hq: pageData.data.map((f: string, i: number) => {
          const raw = `${baseUrl}/data/${pageData.hash}/${f}`;
          return {
            page: i + 1,
            url: proxyMangaImage(raw),
            rawUrl: raw,
          };
        }),
        dataSaver: (pageData.dataSaver || pageData.data).map((f: string, i: number) => {
          const raw = `${baseUrl}/data-saver/${pageData.hash}/${f}`;
          return {
            page: i + 1,
            url: proxyMangaImage(raw),
            rawUrl: raw,
          };
        }),
      },
    };
  } catch (err: any) {
    console.error("getChapterPages error:", err.message);
    return null;
  }
}

export async function getChapterDl(target: string): Promise<ChapterDownload | null> {
  try {
    const pages = await getChapterPages(target);
    if (!pages) return null;

    return {
      Creator: CREATOR,
      Saluran: SALURAN,
      chapter: {
        id: pages.id,
        chapter: pages.chapter,
        volume: pages.volume || null,
        title: pages.title || null,
        language: pages.language,
        totalPages: pages.totalPages,
        mangaId: pages.mangaId,
        mangaTitle: pages.mangaTitle,
        images: pages.images,
      },
    };
  } catch (err: any) {
    console.error("getChapterDl error:", err.message);
    return null;
  }
}
