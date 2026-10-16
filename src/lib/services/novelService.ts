process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import axios from "axios";
import * as cheerio from "cheerio";

export const BASE_URL = "https://bacaln.com";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36";

export interface NovelCard {
  title: string;
  slug: string;
  url: string;
  thumbnail: string;
  latestChapter?: string;
  updated?: string;
  snippet?: string;
}

export interface NovelChapterItem {
  title: string;
  slug: string;
  url: string;
}

export interface NovelDetail {
  title: string;
  slug: string;
  url: string;
  thumbnail: string;
  genres: string[];
  synopsis: string;
  totalChapters: number;
  chapters: NovelChapterItem[];
}

export interface NovelChapterRead {
  title: string;
  slug: string;
  url: string;
  seriesUrl?: string | null;
  seriesTitle?: string | null;
  thumbnail?: string | null;
  navigation: {
    prev: string | null;
    next: string | null;
  };
  totalParagraphs: number;
  paragraphs: string[];
  content: string;
}

function cleanText(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

function extractSlug(url: string): string {
  if (!url) return "";
  const trimmed = url.replace(/\/+$/, "");
  const parts = trimmed.split("/");
  return parts.pop() || "";
}

function extractImageUrl($el: cheerio.Cheerio<any>): string {
  if (!$el || $el.length === 0) return "";
  const $img = $el.is("img") ? $el : $el.find("img").first();
  if (!$img || $img.length === 0) return "";

  const isPlaceholder = (val: string | undefined): boolean =>
    !val ||
    val.includes("image-placeholder.png") ||
    val.includes("flip-8496325764.png") ||
    val.includes("placeholder");

  // 1. Check data-sxrx (used by BacaLN lazyload)
  const sxrx = $img.attr("data-sxrx");
  if (sxrx && !isPlaceholder(sxrx)) {
    if (/^https?:\/\//i.test(sxrx)) return sxrx;
    if (sxrx.startsWith("/")) return `${BASE_URL}${sxrx}`;
    return `${BASE_URL}/wp-content/uploads/${sxrx}`;
  }

  // 2. Check other common lazyload attributes
  const lazy =
    $img.attr("data-src") ||
    $img.attr("data-lazy-src") ||
    $img.attr("data-original");
  if (lazy && !isPlaceholder(lazy)) {
    if (/^https?:\/\//i.test(lazy)) return lazy;
    if (lazy.startsWith("/")) return `${BASE_URL}${lazy}`;
    return `${BASE_URL}/wp-content/uploads/${lazy}`;
  }

  // 3. Check regular src
  const src = $img.attr("src");
  if (src && !isPlaceholder(src)) {
    return src;
  }

  // 4. Check srcset if present
  const srcset = $img.attr("srcset");
  if (srcset) {
    const firstCandidate = srcset.split(",")[0]?.trim()?.split(" ")[0];
    if (firstCandidate && !isPlaceholder(firstCandidate)) {
      return firstCandidate;
    }
  }

  return "";
}

async function requestHtml(url: string): Promise<string> {
  const target = url.startsWith("http")
    ? url
    : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  const res = await axios.get(target, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Referer: BASE_URL + "/",
    },
    timeout: 30000,
  });
  return res.data;
}

/**
 * Mengambil daftar light novel rilis / update terbaru dari BacaLN
 */
export async function getNovelLatest(page: number = 1): Promise<{
  page: number;
  total: number;
  results: NovelCard[];
}> {
  const targetUrl = page > 1 ? `${BASE_URL}/page/${page}/` : `${BASE_URL}/`;
  const html = await requestHtml(targetUrl);
  const $ = cheerio.load(html);
  const results: NovelCard[] = [];
  const seen = new Set<string>();

  $("article").each((_, el) => {
    const linkEl = $(el).find("h2 a, h3 a, .entry-title a").first();
    const title =
      cleanText(linkEl.text()) || cleanText($(el).find("h2, h3").first().text());
    const url = linkEl.attr("href") || "";
    const thumb = extractImageUrl($(el));
    const chapter = cleanText(
      $(el).find(".epxs, .chapter, a[href*='chapter']").first().text()
    );
    const time = cleanText(
      $(el).find(".entry-date, time, .posted-on").first().text()
    );

    if (title && url && !seen.has(url)) {
      seen.add(url);
      results.push({
        title,
        slug: extractSlug(url),
        url,
        thumbnail: thumb,
        latestChapter: chapter || undefined,
        updated: time || undefined,
      });
    }
  });

  return {
    page: Number(page) || 1,
    total: results.length,
    results,
  };
}

/**
 * Mencari light novel di BacaLN
 */
export async function searchNovel(
  query: string,
  page: number = 1
): Promise<{
  query: string;
  page: number;
  total: number;
  results: NovelCard[];
}> {
  if (!query) throw new Error("Query pencarian diperlukan");
  const pageParam = page > 1 ? `&paged=${page}` : "";
  const targetUrl = `${BASE_URL}/?s=${encodeURIComponent(query)}${pageParam}`;
  const html = await requestHtml(targetUrl);
  const $ = cheerio.load(html);
  const results: NovelCard[] = [];
  const seen = new Set<string>();

  $("article").each((_, el) => {
    const linkEl = $(el).find("h2 a, h3 a, .entry-title a").first();
    const title = cleanText(linkEl.text());
    const url = linkEl.attr("href") || "";
    const thumb = extractImageUrl($(el));
    const snippet = cleanText(
      $(el).find(".entry-summary, p").first().text()
    );

    if (title && url && !seen.has(url)) {
      seen.add(url);
      results.push({
        title,
        slug: extractSlug(url),
        url,
        thumbnail: thumb,
        snippet: snippet || undefined,
      });
    }
  });

  return {
    query,
    page: Number(page) || 1,
    total: results.length,
    results,
  };
}

/**
 * Mengambil detail novel (sinopsis, genre, list chapter)
 */
export async function getNovelDetail(
  slugOrUrl: string
): Promise<NovelDetail> {
  if (!slugOrUrl) throw new Error("Slug atau URL series diperlukan");
  let targetUrl = slugOrUrl;
  if (!/^https?:\/\//i.test(targetUrl)) {
    const cleanSlug = slugOrUrl.replace(/^series\//, "").replace(/\/+$/, "");
    targetUrl = `${BASE_URL}/series/${cleanSlug}/`;
  }

  const html = await requestHtml(targetUrl);
  const $ = cheerio.load(html);

  const title = cleanText($("h1").first().text());
  if (!title) throw new Error("Series novel tidak ditemukan");

  const $thumbEl = $(
    ".imgprop img, .thumb img, img.wp-post-image, .series-thumb img, .series-image img, article img"
  ).first();
  const thumbnail = extractImageUrl($thumbEl);
  const synopsis = cleanText(
    $(".series-synops, .synopsis, .entry-content p, .entry-content")
      .first()
      .text()
  );

  const genres: string[] = [];
  $(".series-genres a, .genre a").each((_, el) => {
    const g = cleanText($(el).text());
    if (g && !genres.includes(g)) genres.push(g);
  });

  const chapters: NovelChapterItem[] = [];
  const seen = new Set<string>();

  $(
    ".series-chapterlist li, .eplister li, .chapter-list li, .chlist-pool a, ul.clstyle li a, a[href*='chapter']"
  ).each((_, el) => {
    const a = $(el).is("a") ? $(el) : $(el).find("a").first();
    const cUrl = a.attr("href") || "";
    const cTitle = cleanText(a.text());
    const cSlug = extractSlug(cUrl);

    if (
      cUrl &&
      cTitle &&
      cUrl.includes("chapter") &&
      !seen.has(cUrl) &&
      !cTitle.toLowerCase().includes("prev") &&
      !cTitle.toLowerCase().includes("next")
    ) {
      seen.add(cUrl);
      chapters.push({
        title: cTitle,
        slug: cSlug,
        url: cUrl,
      });
    }
  });

  return {
    title,
    slug: extractSlug(targetUrl),
    url: targetUrl,
    thumbnail,
    genres,
    synopsis,
    totalChapters: chapters.length,
    chapters,
  };
}

/**
 * Mengambil isi konten chapter untuk dibaca
 */
export async function readNovelChapter(
  slugOrUrl: string
): Promise<NovelChapterRead> {
  if (!slugOrUrl) throw new Error("Slug atau URL chapter diperlukan");
  let targetUrl = slugOrUrl;
  if (!/^https?:\/\//i.test(targetUrl)) {
    const cleanSlug = slugOrUrl.replace(/\/+$/, "");
    targetUrl = `${BASE_URL}/${cleanSlug}/`;
  }

  const html = await requestHtml(targetUrl);
  const $ = cheerio.load(html);

  const title = cleanText($("h1, .entry-title").first().text());
  if (!title) throw new Error("Chapter novel tidak ditemukan");

  // Hapus elemen yang bukan isi novel
  $("script, style, noscript, iframe, .ads, .advertisement, header, footer").remove();

  const prevEl = $(
    "a:contains('Prev'), a:contains('Previous'), .nav-previous a, .prevnext .prev a"
  ).first();
  const nextEl = $(
    "a:contains('Next'), .nav-next a, .prevnext .next a"
  ).first();
  const prevUrl = prevEl.attr("href") || null;
  const nextUrl = nextEl.attr("href") || null;

  const paragraphs: string[] = [];
  $(".entry-content p, #content p, .epcontent p, article p").each((_, el) => {
    const pText = cleanText($(el).text());
    if (
      pText &&
      !pText.includes("var ") &&
      !pText.toLowerCase().includes("baca novel lainnya") &&
      !pText.toLowerCase().includes("copyright") &&
      !pText.toLowerCase().includes("bacaln.com")
    ) {
      paragraphs.push(pText);
    }
  });

  const seriesEl = $("a[href*='/series/']").first();
  const seriesUrl = seriesEl.attr("href") || null;
  const seriesTitle =
    cleanText(seriesEl.text().replace(/Semua Chapter/i, "").trim()) || null;

  return {
    title,
    slug: extractSlug(targetUrl),
    url: targetUrl,
    seriesUrl,
    seriesTitle,
    navigation: {
      prev: prevUrl,
      next: nextUrl,
    },
    totalParagraphs: paragraphs.length,
    paragraphs,
    content: paragraphs.join("\n\n"),
  };
}
