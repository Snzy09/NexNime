process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import axios from "axios";
import * as cheerio from "cheerio";

export const CREATOR = "IzzXd";
export const SALURAN = "https://whatsapp.com/channel/0029VbCv97v9Bb5tC5cZFl0K";
export const BASE_URL = "https://netshort.com";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

export interface NetShortItem {
  slug: string;
  title: string;
  cover: string | null;
  url: string;
  genre?: string[];
  total_episodes?: number | null;
}

export interface NetShortEpisode {
  name: string;
  slug: string;
  url: string;
}

export interface NetShortDetail {
  slug: string;
  title: string;
  description: string | null;
  cover: string | null;
  genre: string[];
  total_episodes: number | null;
  stream_url: string | null;
  current_episode: {
    episode_number: number;
    name: string;
    duration: string | null;
    thumbnail: string | null;
    stream_url: string | null;
  };
  episodes: NetShortEpisode[];
  url: string;
}

function formatTitle(slug: string): string {
  const clean = slug.replace(/-[0-9]+$/, "").replace(/-/g, " ");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function extractPlayVoucher(html: string): string | null {
  const match =
    html.match(/playVoucher\\?":\\?"([^"\\]+)/) ||
    html.match(/"playVoucher":"([^"]+)"/);
  if (match) {
    return match[1].replace(/\\u0026/g, "&");
  }
  return null;
}

/**
 * Mendapatkan daftar serial drama NetShort real dari halaman utama dan all-episodes
 */
export async function getNetShortList(): Promise<NetShortItem[]> {
  try {
    const [homeRes, allRes] = await Promise.all([
      axios
        .get(BASE_URL, { headers: HEADERS, timeout: 15000 })
        .catch(() => ({ data: "" })),
      axios
        .get(`${BASE_URL}/all-episodes`, { headers: HEADERS, timeout: 15000 })
        .catch(() => ({ data: "" })),
    ]);

    const results: NetShortItem[] = [];
    const seen = new Set<string>();

    const parseHtml = (html: string) => {
      if (!html) return;
      const $ = cheerio.load(html);

      $('a[href*="/episode/"]').each((_, el) => {
        const href = $(el).attr("href") || "";
        const slug = href
          .replace("/episode/", "")
          .split("?")[0]
          .split("#")[0];

        if (slug && !seen.has(slug)) {
          seen.add(slug);
          const parent = $(el).closest("li, article, div.relative");
          const img =
            $(el).find("img").attr("src") ||
            parent.find("img").attr("src") ||
            null;
          const title =
            $(el).text().trim() ||
            parent.find("h2, h3, p").text().trim() ||
            formatTitle(slug);

          if (title && !title.includes("Play Now")) {
            results.push({
              slug,
              title,
              cover: img,
              url: `${BASE_URL}/episode/${slug}`,
            });
          }
        }
      });
    };

    parseHtml(homeRes.data);
    parseHtml(allRes.data);

    return results;
  } catch (err: any) {
    console.error("NetShort getNetShortList error:", err.message);
    return [];
  }
}

/**
 * Pencarian drama NetShort berdasarkan judul atau slug
 */
export async function searchNetShort(query: string): Promise<{
  total: number;
  results: NetShortItem[];
}> {
  const list = await getNetShortList();
  const q = query.toLowerCase().trim();
  const filtered = list.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q)
  );

  return {
    total: filtered.length,
    results: filtered,
  };
}

/**
 * Mengambil detail serial drama, daftar episode lengkap, dan direct stream URL (playVoucher)
 */
export async function getNetShortDetail(
  slugOrUrl: string
): Promise<NetShortDetail | null> {
  try {
    let slug = slugOrUrl.trim();
    if (slug.includes("/episode/")) {
      slug = slug.split("/episode/")[1].split(/[?#]/)[0];
    } else if (slug.includes("/full-episodes/")) {
      slug = slug.split("/full-episodes/")[1].split(/[?#]/)[0];
    }

    const url = `${BASE_URL}/episode/${slug}`;
    const fullEpisodesUrl = `${BASE_URL}/full-episodes/${slug}`;

    const [epRes, fullRes] = await Promise.all([
      axios.get(url, { headers: HEADERS, timeout: 15000 }),
      axios
        .get(fullEpisodesUrl, { headers: HEADERS, timeout: 15000 })
        .catch(() => ({ data: "" })),
    ]);

    const $ = cheerio.load(epRes.data);
    let seriesData: any = null;
    let episodeData: any = null;
    let videoData: any = null;

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const raw = $(el).html();
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const graph =
          parsed["@graph"] || (Array.isArray(parsed) ? parsed : [parsed]);
        for (const node of graph) {
          if (node["@type"] === "TVSeries") seriesData = node;
          if (node["@type"] === "TVEpisode") episodeData = node;
          if (node["@type"] === "VideoObject") videoData = node;
        }
      } catch {}
    });

    const ogTitle =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text().trim();
    const ogDesc = $('meta[property="og:description"]').attr("content") || null;
    const ogImage = $('meta[property="og:image"]').attr("content") || null;

    const streamUrl = extractPlayVoucher(epRes.data);

    const episodes: NetShortEpisode[] = [];
    if (fullRes.data) {
      const $f = cheerio.load(fullRes.data);
      $f("a").each((_, el) => {
        const href = $f(el).attr("href") || "";
        const text = $f(el).text().trim();
        if (href.includes("/episode/") && text && !text.includes("Play Now")) {
          const epSlug = href
            .replace("/episode/", "")
            .split("?")[0]
            .split("#")[0];
          if (!episodes.some((e) => e.slug === epSlug)) {
            episodes.push({
              name: text,
              slug: epSlug,
              url: `${BASE_URL}${href}`,
            });
          }
        }
      });
    }

    return {
      slug,
      title: seriesData?.name || ogTitle || formatTitle(slug),
      description: seriesData?.description || ogDesc,
      cover: seriesData?.image || ogImage,
      genre: seriesData?.genre || [],
      total_episodes: seriesData?.numberOfEpisodes || episodes.length || null,
      stream_url: streamUrl,
      current_episode: {
        episode_number: episodeData?.episodeNumber || 1,
        name: episodeData?.name || `Episode 1`,
        duration: videoData?.duration || null,
        thumbnail: videoData?.thumbnailUrl || ogImage,
        stream_url: streamUrl,
      },
      episodes: episodes.length > 0 ? episodes : [],
      url,
    };
  } catch (err: any) {
    console.error("NetShort getNetShortDetail error:", err.message);
    return null;
  }
}

/**
 * Mengambil stream video MP4 langsung untuk episode tertentu
 */
export async function getNetShortStream(slug: string): Promise<{
  success: boolean;
  slug: string;
  stream_url: string | null;
}> {
  try {
    const url = `${BASE_URL}/episode/${slug}`;
    const epRes = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const streamUrl = extractPlayVoucher(epRes.data);
    return {
      success: !!streamUrl,
      slug,
      stream_url: streamUrl,
    };
  } catch (err: any) {
    console.error("NetShort getNetShortStream error:", err.message);
    return {
      success: false,
      slug,
      stream_url: null,
    };
  }
}
