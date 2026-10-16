process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import axios from "axios";
import * as cheerio from "cheerio";

export const BASE_TARGET = "https://v1.animesail.xyz";

const COOKIES = "_as_ipin_tz=Asia%2FJakarta; _as_ipin_lc=id-ID; _as_ipin_ct=ID";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  Cookie: COOKIES,
  Referer: BASE_TARGET + "/",
};

export interface AnimeSailCard {
  title: string;
  slug: string;
  url: string;
  thumbnail: string;
  type: string;
  year: string | null;
  episode: string | null;
  latestTime: string | null;
}

export interface AnimeSailEmbed {
  server: string;
  iframe: string;
  streamUrl: string;
}

export interface AnimeSailEpisodeDetail {
  title: string;
  url: string;
  animeUrl: string | null;
  navigation: {
    prev: string | null;
    next: string | null;
  };
  embeds: AnimeSailEmbed[];
  downloads: Record<string, { server: string; url: string }[]>;
}

export interface AnimeSailAnimeDetail {
  title: string;
  url: string;
  thumbnail: string;
  metadata: Record<string, string>;
  synopsis: string;
  totalEpisodesCount: number;
  episodes: {
    title: string;
    episode: string | null;
    url: string;
    slug: string;
  }[];
}

export function normalizeUrl(input: string): string {
  if (!input) return "";
  let str = String(input).trim();
  if (str.startsWith("http://") || str.startsWith("https://")) {
    str = str.replace(
      /^https?:\/\/(?:anisail\.com|animesail\.xyz|animesail\.net|animesail\.tv|animesail\.id)/i,
      BASE_TARGET
    );
    return str;
  }
  if (str.startsWith("/")) {
    return BASE_TARGET + str;
  }
  return BASE_TARGET + "/" + str.replace(/^\/+/, "");
}

async function fetchHtml(url: string): Promise<cheerio.CheerioAPI> {
  const target = normalizeUrl(url);
  const res = await axios.get(target, {
    headers: HEADERS,
    timeout: 30000,
    validateStatus: (s) => s < 500,
  });
  if (res.status === 404) {
    throw new Error("Halaman tidak ditemukan (404): " + target);
  }
  if (res.status !== 200) {
    throw new Error("HTTP Error " + res.status + " saat mengakses " + target);
  }
  return cheerio.load(res.data);
}

function parseCard($: cheerio.CheerioAPI, el: any): AnimeSailCard | null {
  const a = $(el).find("a").first();
  if (!a.length) return null;
  const href = a.attr("href") || "";
  const title =
    $(el).find(".tt h2, h2, h3").first().text().trim() ||
    a.attr("title") ||
    "";
  const img =
    $(el).find("img").attr("src") || $(el).find("img").attr("data-src") || "";
  const typeText = $(el).find(".tt span").text().trim();
  const yearMatch = typeText.match(/\b(19\d\d|20\d\d)\b/);
  const timeMatch = $(el).find("x-ts").text().trim() || "";
  const epMatch = title.match(/Episode\s+(\d+(?:\.\d+)?)/i);
  const cleanHref = href.replace(/^https?:\/\/[^\/]+/, "");
  const slug = cleanHref.replace(/^\/+|\/+$/g, "");

  let type = "";
  if (typeText.includes("Movie")) type = "Movie";
  else if (typeText.includes("ONA")) type = "ONA";
  else if (typeText.includes("TV")) type = "TV";

  return {
    title,
    slug,
    url: normalizeUrl(href),
    thumbnail: img,
    type,
    year: yearMatch ? yearMatch[1] : null,
    episode: epMatch ? epMatch[1] : null,
    latestTime: timeMatch || null,
  };
}

async function fetchDownloadTable(
  dlPath: string
): Promise<Record<string, { server: string; url: string }[]> | null> {
  const dlUrl = normalizeUrl(dlPath);
  try {
    const $ = await fetchHtml(dlUrl);
    const result: Record<string, { server: string; url: string }[]> = {};
    $("table tr").each((_, tr) => {
      const q = $(tr).find("td").first().text().trim();
      if (!q) return;
      const links: { server: string; url: string }[] = [];
      $(tr)
        .find("a[data-href]")
        .each((_, a) => {
          const sName = $(a).text().trim() || $(a).attr("title") || "";
          const rawHref = $(a).attr("data-href") || "";
          const cleanHref = rawHref.trim();
          if (cleanHref && cleanHref !== "#/") {
            links.push({ server: sName, url: cleanHref });
          }
        });
      if (links.length) {
        result[q] = links;
      }
    });
    return result;
  } catch {
    return null;
  }
}

/**
 * Mengambil daftar anime rilis terbaru dari AnimeSail
 */
export async function getAnimeSailLatest(page: number = 1): Promise<{
  page: number;
  totalItems: number;
  items: AnimeSailCard[];
}> {
  const path = page > 1 ? `/page/${page}/` : "/";
  const $ = await fetchHtml(path);
  const items: AnimeSailCard[] = [];
  const seen = new Set<string>();

  $(".bsx").each((_, el) => {
    const card = parseCard($, el);
    if (card && card.title && !seen.has(card.url)) {
      seen.add(card.url);
      items.push(card);
    }
  });

  return {
    page,
    totalItems: items.length,
    items,
  };
}

/**
 * Mencari anime di AnimeSail
 */
export async function searchAnimeSail(
  query: string,
  page: number = 1
): Promise<{
  query: string;
  page: number;
  totalItems: number;
  items: AnimeSailCard[];
}> {
  const path =
    `/?s=${encodeURIComponent(query)}` + (page > 1 ? `&page=${page}` : "");
  const $ = await fetchHtml(path);
  const items: AnimeSailCard[] = [];
  const seen = new Set<string>();

  $(".bsx").each((_, el) => {
    const card = parseCard($, el);
    if (card && card.title && !seen.has(card.url)) {
      seen.add(card.url);
      items.push(card);
    }
  });

  return {
    query,
    page,
    totalItems: items.length,
    items,
  };
}

/**
 * Mengambil daftar Movie dari AnimeSail
 */
export async function getAnimeSailMovie(page: number = 1): Promise<{
  page: number;
  totalItems: number;
  items: AnimeSailCard[];
}> {
  const path =
    page > 1 ? `/movie-terbaru/page/${page}/` : "/movie-terbaru/";
  const $ = await fetchHtml(path);
  const items: AnimeSailCard[] = [];
  const seen = new Set<string>();

  $(".bsx").each((_, el) => {
    const card = parseCard($, el);
    if (card && card.title && !seen.has(card.url)) {
      seen.add(card.url);
      items.push(card);
    }
  });

  return {
    page,
    totalItems: items.length,
    items,
  };
}

/**
 * Mengambil daftar Donghua dari AnimeSail
 */
export async function getAnimeSailDonghua(page: number = 1): Promise<{
  page: number;
  totalItems: number;
  items: AnimeSailCard[];
}> {
  const path =
    page > 1
      ? `/rilisan-donghua-terbaru/page/${page}/`
      : "/rilisan-donghua-terbaru/";
  const $ = await fetchHtml(path);
  const items: AnimeSailCard[] = [];
  const seen = new Set<string>();

  $(".bsx").each((_, el) => {
    const card = parseCard($, el);
    if (card && card.title && !seen.has(card.url)) {
      seen.add(card.url);
      items.push(card);
    }
  });

  return {
    page,
    totalItems: items.length,
    items,
  };
}

/**
 * Mengambil jadwal rilis tayang anime dari AnimeSail
 */
export async function getAnimeSailSchedule(): Promise<{
  schedule: Record<
    string,
    { title: string; url: string; thumbnail: string; time: string | null }[]
  >;
}> {
  const $ = await fetchHtml("/jadwal-tayang/");
  const result: Record<
    string,
    { title: string; url: string; thumbnail: string; time: string | null }[]
  > = {};
  const days = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Jum'at",
    "Sabtu",
  ];

  $(".bixbox").each((_, el) => {
    const day = $(el).find("h3").text().trim();
    if (days.includes(day)) {
      const dayList: {
        title: string;
        url: string;
        thumbnail: string;
        time: string | null;
      }[] = [];
      const seen = new Set<string>();
      $(el)
        .find(".listupd .bsx")
        .each((__, art) => {
          const a = $(art).find("a").first();
          const title =
            $(art).find(".tt h2, h2").text().trim() || a.attr("title") || "";
          const href = a.attr("href") || "";
          const img =
            $(art).find("img").attr("src") ||
            $(art).find("img").attr("data-src") ||
            "";
          const timeInfo = $(art).find(".tt span").text().trim();
          const fullUrl = normalizeUrl(href);
          if (title && href && !seen.has(fullUrl)) {
            seen.add(fullUrl);
            dayList.push({
              title,
              url: fullUrl,
              thumbnail: img,
              time: timeInfo || null,
            });
          }
        });
      if (dayList.length) {
        result[day] = dayList;
      }
    }
  });

  return { schedule: result };
}

/**
 * Mengambil detail episode beserta stream embeds & download links
 */
export async function getAnimeSailEpisode(
  slugOrUrl: string
): Promise<AnimeSailEpisodeDetail> {
  const targetUrl = normalizeUrl(slugOrUrl);
  const $ = await fetchHtml(targetUrl);
  const title = $("h1.entry-title, h1").first().text().trim();

  const embeds: AnimeSailEmbed[] = [];
  $("[data-em]").each((_, el) => {
    const sName = $(el).text().trim() || "";
    const raw = $(el).attr("data-em") || "";
    if (!raw) return;
    try {
      const decoded = Buffer.from(raw, "base64").toString("utf8");
      const $emb = cheerio.load(decoded);
      const iframeSrc = $emb("iframe").attr("src") || "";
      let streamUrl: string | null = null;
      if (iframeSrc.includes("url=")) {
        const matchUrl = iframeSrc.match(/url=([^&]+)/);
        if (matchUrl) streamUrl = decodeURIComponent(matchUrl[1]);
      } else if (iframeSrc.includes("bsrc=")) {
        const matchBsrc = iframeSrc.match(/bsrc=([^&]+)/);
        if (matchBsrc) {
          try {
            streamUrl = Buffer.from(matchBsrc[1], "base64").toString("utf8");
          } catch {}
        }
      } else if (iframeSrc.includes("/play/")) {
        streamUrl = iframeSrc;
      }
      embeds.push({
        server: sName,
        iframe: iframeSrc,
        streamUrl: streamUrl || iframeSrc,
      });
    } catch {}
  });

  const defaultEmbed = $("#pembed").attr("data-default");
  if (defaultEmbed && !embeds.length) {
    try {
      const dec = Buffer.from(defaultEmbed, "base64").toString("utf8");
      const $emb = cheerio.load(dec);
      const src = $emb("iframe").attr("src") || "";
      embeds.push({ server: "default", iframe: src, streamUrl: src });
    } catch {}
  }

  const dlLink = $('a[href*="/streaming-download/?id="]').attr("href") || null;
  let downloads: Record<string, { server: string; url: string }[]> | null = null;
  if (dlLink) {
    downloads = await fetchDownloadTable(dlLink);
  }

  const prev =
    $('.nvs a:contains("Prev"), .naveps a:contains("Prev")').attr("href") || null;
  const next =
    $('.nvs a:contains("Next"), .naveps a:contains("Next")').attr("href") || null;
  const animeLink =
    $('.nvs a[href*="/anime/"], a:contains("Semua Episode")').attr("href") ||
    null;

  return {
    title,
    url: targetUrl,
    animeUrl: animeLink ? normalizeUrl(animeLink) : null,
    navigation: {
      prev: prev ? normalizeUrl(prev) : null,
      next: next ? normalizeUrl(next) : null,
    },
    embeds,
    downloads: downloads || {},
  };
}

/**
 * Mengambil detail anime (deskripsi, genre, episode list)
 */
export async function getAnimeSailDetail(
  slugOrUrl: string
): Promise<AnimeSailAnimeDetail> {
  let target = slugOrUrl;
  if (!target.includes("/anime/") && !target.startsWith("http")) {
    target = "/anime/" + target.replace(/^\/+|\/+$/g, "") + "/";
  }
  const targetUrl = normalizeUrl(target);
  const $ = await fetchHtml(targetUrl);

  const title = $("h1.entry-title").text().trim();
  const synopsis = $(".entry-content p, .desc, .synopsis").text().trim();
  const thumbnail = $("img.wp-post-image, .thumb img").attr("src") || "";

  const metadata: Record<string, string> = {};
  $("p, tr").each((_, el) => {
    const text = $(el).text().trim();
    if (text.includes(":") && text.length < 150) {
      const parts = text.split(":");
      const key = parts[0].trim();
      const val = parts.slice(1).join(":").trim();
      if (key && val) metadata[key] = val;
    }
  });

  const episodes: {
    title: string;
    episode: string | null;
    url: string;
    slug: string;
  }[] = [];

  $("ul.daftar li a").each((_, a) => {
    const epUrl = $(a).attr("href") || "";
    const epTitle = $(a).text().trim();
    const numMatch = epTitle.match(/Episode\s+(\d+(?:\.\d+)?)/i);
    const cleanEp = epUrl.replace(/^https?:\/\/[^\/]+/, "");
    episodes.push({
      title: epTitle,
      episode: numMatch ? numMatch[1] : null,
      url: normalizeUrl(epUrl),
      slug: cleanEp.replace(/^\/+|\/+$/g, ""),
    });
  });

  return {
    title,
    url: targetUrl,
    thumbnail,
    metadata,
    synopsis,
    totalEpisodesCount: episodes.length,
    episodes,
  };
}
