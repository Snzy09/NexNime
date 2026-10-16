process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import axios from "axios";
import * as cheerio from "cheerio";

export const BASE_URL = "https://oppadrama.io";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36";

export interface OppaDramaCard {
  title: string;
  slug: string;
  url: string;
  thumbnail: string;
  type?: string;
  episode?: string;
  status?: string;
}

export interface OppaDramaMirror {
  name: string;
  url: string;
}

export interface OppaDramaDownload {
  server: string;
  url: string;
}

export interface OppaDramaEpisodeDetail {
  title: string;
  slug: string;
  url: string;
  streamUrl?: string;
  mirrors?: OppaDramaMirror[];
  downloads?: OppaDramaDownload[];
  navigation: {
    prev?: string;
    next?: string;
    seriesUrl?: string;
  };
}

export interface OppaDramaEpisodeListItem {
  episode?: string;
  title?: string;
  date?: string;
  slug: string;
  url: string;
}

export interface OppaDramaSeriesDetail {
  title: string;
  slug: string;
  url: string;
  thumbnail: string;
  genres: string[];
  metadata: Record<string, string>;
  synopsis?: string;
  totalEpisodes: number;
  episodes: OppaDramaEpisodeListItem[];
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

async function requestHtml(url: string): Promise<string> {
  const target = url.startsWith("http") ? url : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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

function parseCards($: cheerio.CheerioAPI): OppaDramaCard[] {
  const list: OppaDramaCard[] = [];
  const seen = new Set<string>();

  $(".bsx").each((_, el) => {
    const a = $(el).find("a").first();
    const url = a.attr("href") || "";
    const titleRaw = $(el).find(".tt").text().trim() || a.attr("title") || "";
    const title = titleRaw.split("\t")[0].trim() || cleanText(titleRaw);
    const thumb =
      $(el).find("img").first().attr("src") ||
      $(el).find("img").first().attr("data-src") ||
      "";
    const type = cleanText($(el).find(".typez").text());
    const ep = cleanText($(el).find(".epx").text());
    const status = cleanText($(el).find(".status").text());

    if (url && title && !seen.has(url)) {
      seen.add(url);
      list.push({
        title,
        slug: extractSlug(url),
        url,
        thumbnail: thumb,
        type: type || undefined,
        episode: ep || undefined,
        status: status || undefined,
      });
    }
  });

  return list;
}

/**
 * Mengambil daftar drama & film terbaru dari OppaDrama
 */
export async function getOppaDramaLatest(page: number = 1): Promise<{
  page: number;
  total: number;
  results: OppaDramaCard[];
}> {
  const targetUrl = page > 1 ? `${BASE_URL}/page/${page}/` : `${BASE_URL}/`;
  const html = await requestHtml(targetUrl);
  const $ = cheerio.load(html);
  const results = parseCards($);

  return {
    page: Number(page) || 1,
    total: results.length,
    results,
  };
}

/**
 * Mencari drama atau film di OppaDrama
 */
export async function searchOppaDrama(
  query: string,
  page: number = 1
): Promise<{
  query: string;
  page: number;
  total: number;
  results: OppaDramaCard[];
}> {
  if (!query) throw new Error("Query pencarian diperlukan");
  const pageParam = page > 1 ? `page/${page}/` : "";
  const targetUrl = `${BASE_URL}/${pageParam}?s=${encodeURIComponent(query)}`;
  const html = await requestHtml(targetUrl);
  const $ = cheerio.load(html);
  const results = parseCards($);

  return {
    query,
    page: Number(page) || 1,
    total: results.length,
    results,
  };
}

/**
 * Mengambil detail series/drama beserta sinopsis dan episode list
 */
export async function getOppaDramaDetail(
  slugOrUrl: string
): Promise<OppaDramaSeriesDetail> {
  if (!slugOrUrl) throw new Error("Slug atau URL drama diperlukan");
  let targetUrl = slugOrUrl;
  if (!/^https?:\/\//i.test(targetUrl)) {
    const cleanSlug = slugOrUrl.replace(/^series\//, "").replace(/\/+$/, "");
    targetUrl = `${BASE_URL}/series/${cleanSlug}/`;
  }

  const html = await requestHtml(targetUrl);
  const $ = cheerio.load(html);

  const title = cleanText($("h1.entry-title, h1").first().text());
  if (!title) throw new Error("Halaman drama tidak ditemukan");

  const thumbnail =
    $(".thumb img, .infox img, .entry-content img").first().attr("src") ||
    $(".thumb img, .infox img, .entry-content img").first().attr("data-src") ||
    "";
  const synopsis = cleanText(
    $(".entry-content, .synopsis, .desc").first().text()
  );

  const metadata: Record<string, string> = {};
  $(".info-content span, .spe span, .infox span").each((_, el) => {
    const raw = cleanText($(el).text());
    if (raw.includes(":")) {
      const idx = raw.indexOf(":");
      const key = raw.slice(0, idx).trim().toLowerCase();
      const val = raw.slice(idx + 1).trim();
      if (key && val) metadata[key] = val;
    }
  });

  const genres: string[] = [];
  $(".genxed a, .genre a").each((_, el) => {
    const g = cleanText($(el).text());
    if (g && !genres.includes(g)) genres.push(g);
  });

  const episodes: OppaDramaEpisodeListItem[] = [];
  $(".eplister li, .episodelist li").each((_, el) => {
    const a = $(el).find("a").first();
    const epUrl = a.attr("href") || "";
    const epNum = cleanText($(el).find(".epl-num").text());
    const epTitle =
      cleanText($(el).find(".epl-title").text()) || cleanText(a.text());
    const epDate = cleanText($(el).find(".epl-date").text());

    if (epUrl) {
      episodes.push({
        episode: epNum || undefined,
        title: epTitle || undefined,
        date: epDate || undefined,
        slug: extractSlug(epUrl),
        url: epUrl,
      });
    }
  });

  return {
    title,
    slug: extractSlug(targetUrl),
    url: targetUrl,
    thumbnail,
    genres,
    metadata,
    synopsis: synopsis || undefined,
    totalEpisodes: episodes.length,
    episodes,
  };
}

/**
 * Mengambil informasi episode & stream player OppaDrama
 */
export async function getOppaDramaEpisode(
  slugOrUrl: string
): Promise<OppaDramaEpisodeDetail> {
  if (!slugOrUrl) throw new Error("Slug atau URL episode diperlukan");
  let targetUrl = slugOrUrl;
  if (!/^https?:\/\//i.test(targetUrl)) {
    const cleanSlug = slugOrUrl.replace(/\/+$/, "");
    targetUrl = `${BASE_URL}/${cleanSlug}/`;
  }

  const html = await requestHtml(targetUrl);
  const $ = cheerio.load(html);

  const title = cleanText($("h1.entry-title, h1").first().text());
  if (!title) throw new Error("Halaman episode tidak ditemukan");

  let streamUrl =
    $(".player-embed iframe, #pembed iframe").attr("src") || "";

  const mirrors: OppaDramaMirror[] = [];
  $(".mirror option, select.mirror option, select option").each((_, el) => {
    const optVal = $(el).val() as string || "";
    const optText = cleanText($(el).text());
    if (optVal && optVal.length > 20) {
      try {
        const decoded = Buffer.from(optVal, "base64").toString("utf8");
        const srcMatch = decoded.match(/src=["']([^"']+)["']/i);
        if (srcMatch && srcMatch[1]) {
          let mirrorUrl = srcMatch[1];
          if (mirrorUrl.startsWith("//")) mirrorUrl = "https:" + mirrorUrl;
          mirrors.push({
            name: optText || "Mirror",
            url: mirrorUrl,
          });
          if (!streamUrl) streamUrl = mirrorUrl;
        }
      } catch {}
    }
  });

  const downloads: OppaDramaDownload[] = [];
  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = cleanText($(el).text());
    if (
      href &&
      (href.includes("fpgo.xyz") ||
        href.includes("drive.google") ||
        href.includes("mega.nz") ||
        text.toLowerCase() === "download")
    ) {
      if (!downloads.some((d) => d.url === href)) {
        downloads.push({
          server: text || "Download",
          url: href,
        });
      }
    }
  });

  const prevUrl =
    $('.naveps .nvs a[href*="episode"]:contains("Prev")').attr("href") ||
    undefined;
  const nextUrl =
    $('.naveps .nvs a[href*="episode"]:contains("Next")').attr("href") ||
    undefined;
  const seriesUrl =
    $('.naveps .nvs a[href*="series"]').attr("href") ||
    $(".headpost a").attr("href") ||
    undefined;

  return {
    title,
    slug: extractSlug(targetUrl),
    url: targetUrl,
    streamUrl: streamUrl || undefined,
    mirrors: mirrors.length ? mirrors : undefined,
    downloads: downloads.length ? downloads : undefined,
    navigation: {
      prev: prevUrl,
      next: nextUrl,
      seriesUrl,
    },
  };
}
