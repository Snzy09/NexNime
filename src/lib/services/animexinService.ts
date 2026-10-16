process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import axios from "axios";
import * as cheerio from "cheerio";

export const BASE_URL = "https://animexin.dev";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
};

export interface AnimeXinItem {
  title: string;
  url: string;
  slug: string;
  poster: string;
  episode?: string;
  type?: string;
  rating?: string;
}

export interface AnimeXinServer {
  name: string;
  embed_url: string;
  raw_value: string;
}

export interface AnimeXinEpisodeItem {
  title: string;
  episode_number: string;
  url: string;
  slug: string;
}

export interface AnimeXinDetail {
  title: string;
  poster: string;
  synopsis: string;
  rating?: string;
  status?: string;
  genres: string[];
  type?: string;
  current_stream?: string;
  servers: AnimeXinServer[];
  episodes: AnimeXinEpisodeItem[];
  url: string;
}

function extractSlug(url: string): string {
  const clean = url.replace(BASE_URL, "").replace(/\/$/, "");
  const parts = clean.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

function decodeIframeSrc(val: string): string {
  if (!val) return "";
  try {
    let decoded = val;
    if (!val.startsWith("http") && !val.startsWith("//")) {
      decoded = Buffer.from(val, "base64").toString("utf8");
    }
    const match = decoded.match(/src=["']([^"']+)["']/i);
    if (match) {
      let src = match[1];
      if (src.startsWith("//")) src = "https:" + src;
      return src;
    }
    if (decoded.startsWith("http")) return decoded;
    return "";
  } catch {
    return "";
  }
}

export function proxyAnimeXinImage(url: string): string {
  if (!url) return "";
  if (url.startsWith("/api/animexin?action=image")) return url;
  return `/api/animexin?action=image&url=${encodeURIComponent(url)}`;
}

/**
 * Mengambil daftar Donghua / AnimeXin terbaru dari halaman utama
 */
export async function getAnimeXinLatest(): Promise<AnimeXinItem[]> {
  try {
    const res = await axios.get(BASE_URL, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(res.data);
    const items: AnimeXinItem[] = [];

    $("article.bs, .animposx, .listupd article, .style2 article").each((_, el) => {
      const a = $(el).find("a").first();
      const href = a.attr("href") || "";
      const title =
        $(el).find(".tt h2, .title, h4, h2").first().text().trim() ||
        a.attr("title") ||
        "";
      const rawImg =
        $(el).find("img").attr("data-src") ||
        $(el).find("img").attr("data-lazy-src") ||
        $(el).find("img").attr("src") ||
        "";
      const img = rawImg ? proxyAnimeXinImage(rawImg) : "";
      const ep =
        $(el).find(".bt .epx, .epx, .status").first().text().trim() || "";
      const type = $(el).find(".typez").text().trim() || "Donghua";
      const rating = $(el).find(".rating, .numscore").text().trim() || "8.8";

      if (href && title && !items.some((x) => x.url === href)) {
        items.push({
          title,
          url: href,
          slug: extractSlug(href),
          poster: img,
          episode: ep,
          type,
          rating,
        });
      }
    });

    return items;
  } catch (err: any) {
    console.error("AnimeXin getAnimeXinLatest error:", err.message);
    return [];
  }
}

/**
 * Mencari judul Donghua / Anime di AnimeXin
 */
export async function searchAnimeXin(query: string): Promise<AnimeXinItem[]> {
  try {
    if (!query.trim()) return [];
    const url = `${BASE_URL}/?s=${encodeURIComponent(query.trim())}`;
    const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(res.data);
    const results: AnimeXinItem[] = [];

    $("article.bs, .animposx, .listupd article").each((_, el) => {
      const a = $(el).find("a").first();
      const href = a.attr("href") || "";
      const title =
        $(el).find(".tt h2, .title, h4, h2").first().text().trim() ||
        a.attr("title") ||
        "";
      const rawImg =
        $(el).find("img").attr("data-src") ||
        $(el).find("img").attr("data-lazy-src") ||
        $(el).find("img").attr("src") ||
        "";
      const img = rawImg ? proxyAnimeXinImage(rawImg) : "";
      const ep =
        $(el).find(".bt .epx, .epx, .status").first().text().trim() || "";
      const type = $(el).find(".typez").text().trim() || "Donghua";

      if (href && title && !results.some((x) => x.url === href)) {
        results.push({
          title,
          url: href,
          slug: extractSlug(href),
          poster: img,
          episode: ep,
          type,
        });
      }
    });

    return results;
  } catch (err: any) {
    console.error("AnimeXin searchAnimeXin error:", err.message);
    return [];
  }
}

/**
 * Mengambil detail Donghua, daftar episode, dan server streaming video dari halaman episode / anime
 */
export async function getAnimeXinDetail(targetUrlOrSlug: string): Promise<AnimeXinDetail | null> {
  try {
    let url = targetUrlOrSlug.trim();
    if (!url.startsWith("http")) {
      url = `${BASE_URL}/${url.replace(/^\//, "")}/`;
    }

    const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(res.data);

    const title =
      $("h1.entry-title, .entry-title, h1").first().text().trim() ||
      $("title").text().split("-")[0].trim();
    const rawPoster =
      $(".thumb img, .poster img, .entry-content img, .bigcover img")
        .first()
        .attr("src") ||
      $(".thumb img").first().attr("data-src") ||
      "";
    const poster = rawPoster ? proxyAnimeXinImage(rawPoster) : "";
    const synopsis =
      $(".desc, .entry-content p, .synopsis").text().trim() ||
      "Saksikan animasi Donghua seru dengan subtitle Indonesia resmi di AnimeXin.";
    const rating = $(".rating strong, .numscore").first().text().trim() || "8.9";
    const status = $(".spe span:contains('Status')").text().replace("Status:", "").trim() || "Ongoing";
    const type = $(".spe span:contains('Type')").text().replace("Type:", "").trim() || "Donghua ONA";

    const genres: string[] = [];
    $(".genxed a, .genre a, .spe a[href*='genre']").each((_, el) => {
      const g = $(el).text().trim();
      if (g && !genres.includes(g)) genres.push(g);
    });

    // Extract streaming servers
    const servers: AnimeXinServer[] = [];
    $("select.mirror option, .server-item, .player-list a, .mobius select option").each((_, el) => {
      const val = $(el).attr("value") || $(el).attr("data-src") || $(el).attr("href") || "";
      const name = $(el).text().trim();
      const embed = decodeIframeSrc(val);
      if (embed && name && !servers.some((s) => s.embed_url === embed)) {
        servers.push({
          name,
          embed_url: embed,
          raw_value: val,
        });
      }
    });

    // Also check direct iframe in page
    let currentStream = "";
    const directIframe = $("iframe").first().attr("src");
    if (directIframe) {
      currentStream = directIframe.startsWith("//") ? "https:" + directIframe : directIframe;
      if (!servers.some((s) => s.embed_url === currentStream)) {
        servers.unshift({
          name: "Default Player AX",
          embed_url: currentStream,
          raw_value: currentStream,
        });
      }
    } else if (servers.length > 0) {
      currentStream = servers[0].embed_url;
    }

    // Extract episodes list
    const episodes: AnimeXinEpisodeItem[] = [];
    $(".eplister ul li a, .episodelist ul li a, .lstepsiode ul li a").each((_, el) => {
      const epHref = $(el).attr("href") || "";
      const epNum = $(el).find(".epl-num").text().trim() || $(el).text().trim();
      const epTitle = $(el).find(".epl-title").text().trim() || epNum;

      if (epHref && !episodes.some((e) => e.url === epHref)) {
        episodes.push({
          title: epTitle,
          episode_number: epNum,
          url: epHref,
          slug: extractSlug(epHref),
        });
      }
    });

    return {
      title,
      poster,
      synopsis,
      rating,
      status,
      genres,
      type,
      current_stream: currentStream,
      servers,
      episodes,
      url,
    };
  } catch (err: any) {
    console.error("AnimeXin getAnimeXinDetail error:", err.message);
    return null;
  }
}
