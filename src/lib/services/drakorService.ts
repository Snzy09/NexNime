/**
 * Drakor (Korean Drama) Service
 * Base: https://drakorid.co
 */

if (typeof process !== "undefined") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const BASE = "https://drakorid.co";

export interface DrakorItem {
  title: string;
  slug: string;
  url: string;
  poster: string | null;
  rating?: string;
  episode?: string;
}

export interface DrakorDetail {
  title: string | null;
  poster: string | null;
  synopsis: string | null;
  genres: string[];
  total_episodes: number;
  episodes: {
    episode: number;
    label: string;
    embed?: {
      watch_lite?: string;
      watch_max?: string;
      watch_fast?: string;
      download_lite?: string;
      download_fast?: string;
      sid?: string;
      streaming_id?: string;
      thumbnail?: string;
      is_cdn?: boolean;
    } | null;
  }[];
}

async function req(url: string, opts: any = {}) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    Accept: opts.method === "POST" ? "application/json, */*" : "text/html,*/*;q=0.8",
    "Accept-Language": "id-ID,id;q=0.9",
    Referer: BASE,
    ...(opts.method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    ...(opts.headers || {}),
  };

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body: opts.body,
    signal: AbortSignal.timeout(15000),
  });

  return {
    status: res.status,
    text: await res.text(),
  };
}

function parseList(html: string): DrakorItem[] {
  const clean = html.replace(/<aside[^>]*app-right-rail[\s\S]*?<\/aside>/gi, "");
  const map = new Map<string, DrakorItem>();
  const rx = /<a\b[^>]*href="https:\/\/drakorid\.co\/nonton\/([^"\/]+)\/?"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = rx.exec(clean)) !== null) {
    const slug = m[1];
    const tag = m[0];
    const inner = m[2];
    const t1 = (tag.match(/^<a[^>]*\btitle="([^"]+)"/i) || [])[1];
    const t2 = (inner.match(/<img[^>]*\balt="([^"]+)"/i) || [])[1];
    const t3 = inner.replace(/<[^>]+>/g, "").trim() || null;
    const poster = (inner.match(/<img[^>]*\bsrc="([^"]+)"/i) || [])[1] || null;
    const title = (t1 || t2 || t3 || "").trim();
    const prev = map.get(slug);
    if (!prev) {
      map.set(slug, { title, slug, url: `${BASE}/nonton/${slug}/`, poster, rating: "9.2" });
    } else {
      if (!prev.title && title) prev.title = title;
      if (!prev.poster && poster) prev.poster = poster;
    }
  }
  return [...map.values()].filter((i) => i.title);
}

function parseDetailPage(html: string) {
  const get = (rx: RegExp) => {
    const m = html.match(rx);
    return m ? m[1].trim() : null;
  };

  const title = get(/property="og:title"\s+content="([^"]+)"/i);
  const poster =
    get(/property='og:image'\s+content="([^"]+)"/i) ||
    get(/property="og:image"\s+content="([^"]+)"/i);
  const synopsis = get(/name="twitter:card"\s+content="([^"]+)"/i);

  const token = get(/var token\s*=\s*"([^"]+)"/);
  const link = get(/var link\s*=\s*"([^"]+)"/);
  const mId = (() => {
    const m = html.match(/var mId\s*=\s*(\d+)/);
    return m ? parseInt(m[1]) : null;
  })();
  const mTipe = (() => {
    const m = html.match(/var mTipe\s*=\s*(\d+)/);
    return m ? parseInt(m[1]) : null;
  })();

  const episodes: { episode: number; label: string }[] = [];
  const epRx = /data-episode="(\d+)"\s+data-ep-label="([^"]+)"/gi;
  let em;
  const seen = new Set();
  while ((em = epRx.exec(html)) !== null) {
    const num = parseInt(em[1]);
    if (!seen.has(num)) {
      seen.add(num);
      episodes.push({ episode: num, label: em[2] });
    }
  }
  episodes.sort((a, b) => a.episode - b.episode);

  const genres: string[] = [];
  const gRx = /href="https:\/\/drakorid\.co\/kategori\/[^"]+">([^<]+)<\/a>/gi;
  let gm;
  while ((gm = gRx.exec(html)) !== null) {
    const g = gm[1].trim();
    if (g && !genres.includes(g)) genres.push(g);
  }

  return { title, poster, synopsis, genres, token, link, mId, mTipe, episodes };
}

async function getEpisodeEmbed(token: string, mId: number, link: string, epNumber: number) {
  try {
    const body = `token=${encodeURIComponent(token)}&id=${mId}&episode=${epNumber}`;
    const res = await req(`${BASE}/myapi/episode_detail.php`, {
      method: "POST",
      body,
      headers: { Referer: `${BASE}/nonton/${link}/` },
    });

    const data = JSON.parse(res.text);
    if (data.status !== 1) return null;

    return {
      watch_lite: `${BASE}/watch-lite/${link}/${epNumber}`,
      watch_max: `${BASE}/watch-max/${link}/${epNumber}`,
      watch_fast: `${BASE}/watch-fast/${link}/${epNumber}`,
      download_lite: `${BASE}/download-lite/${link}/${epNumber}`,
      download_fast: `${BASE}/download-fast/${link}/${epNumber}`,
      sid: data.sid || null,
      streaming_id: data.streaming || null,
      thumbnail: data.img || null,
      is_cdn: !!data.is_any_cdn,
    };
  } catch {
    return null;
  }
}

export async function getDrakorTrending(): Promise<DrakorItem[]> {
  try {
    const res = await req(`${BASE}/trending.html`);
    if (res.status === 200) {
      return parseList(res.text);
    }
  } catch (err) {
    console.error("Drakor trending error:", err);
  }
  return [];
}

export async function getDrakorOngoing(): Promise<DrakorItem[]> {
  try {
    const res = await req(`${BASE}/drama-ongoing/`);
    if (res.status === 200) {
      return parseList(res.text);
    }
  } catch (err) {
    console.error("Drakor ongoing error:", err);
  }
  return [];
}

export async function getDrakorList(page: number = 1): Promise<{ page: number; items: DrakorItem[] }> {
  try {
    const res = await req(`${BASE}/list/${page}`);
    if (res.status === 200) {
      return { page, items: parseList(res.text) };
    }
  } catch (err) {
    console.error("Drakor list error:", err);
  }
  return { page, items: [] };
}

export async function searchDrakor(query: string): Promise<DrakorItem[]> {
  try {
    const res = await req(`${BASE}/cari.html?q=${encodeURIComponent(query)}`);
    if (res.status === 200) {
      return parseList(res.text);
    }
  } catch (err) {
    console.error("Drakor search error:", err);
  }
  return [];
}

export async function getDrakorDetail(slug: string): Promise<DrakorDetail | null> {
  try {
    const res = await req(`${BASE}/nonton/${slug}/`);
    if (res.status !== 200) return null;

    const detail = parseDetailPage(res.text);
    const episodesWithEmbed = [];

    for (const ep of detail.episodes) {
      const embed =
        detail.token && detail.mId
          ? await getEpisodeEmbed(detail.token, detail.mId, detail.link || slug, ep.episode)
          : {
              watch_lite: `${BASE}/watch-lite/${slug}/${ep.episode}`,
              watch_max: `${BASE}/watch-max/${slug}/${ep.episode}`,
              watch_fast: `${BASE}/watch-fast/${slug}/${ep.episode}`,
            };

      episodesWithEmbed.push({ ...ep, embed });
    }

    return {
      title: detail.title,
      poster: detail.poster,
      synopsis: detail.synopsis,
      genres: detail.genres,
      total_episodes: detail.episodes.length,
      episodes: episodesWithEmbed,
    };
  } catch (err) {
    console.error("Drakor detail error:", err);
    return null;
  }
}

export async function getDrakorStream(slug: string, ep: number = 1, server: string = "max") {
  const serverPath = server === "fast" ? "watch-fast" : server === "lite" ? "watch-lite" : "watch-max";
  const url = `${BASE}/${serverPath}/${slug}/${ep}`;
  try {
    const res = await req(url, {
      headers: { Referer: `${BASE}/nonton/${slug}/` },
    });
    if (res.status === 200) {
      const html = res.text;
      const iframes: string[] = [];
      const rx = /<iframe\b[^>]*src=["']([^"']+)["']/gi;
      let m;
      while ((m = rx.exec(html)) !== null) {
        if (m[1].includes("/player/")) {
          iframes.push(m[1]);
        }
      }

      const iframeUrl = iframes.length > 0 ? iframes[iframes.length - 1] : null;
      let streamUrl: string | null = null;
      if (iframeUrl && iframeUrl.includes("v=")) {
        const vMatch = iframeUrl.match(/[?&]v=([^&]+)/);
        if (vMatch) {
          try {
            streamUrl = Buffer.from(decodeURIComponent(vMatch[1]), "base64").toString("utf-8");
          } catch {}
        }
      }

      return {
        iframe: iframeUrl || `${BASE}/player/bunny.php`,
        stream: streamUrl,
        all_iframes: iframes,
        fallback_url: url,
      };
    }
  } catch (e) {
    console.error("Drakor stream error:", e);
  }
  return null;
}

