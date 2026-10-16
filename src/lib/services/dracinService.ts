/**
 * Dracin (Chinese Short Drama / Mini Drama 9:16 Reels) Service
 * Base: https://asiaboxdrama.com
 */

if (typeof process !== "undefined") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import * as cheerio from "cheerio";

const BASE = "https://asiaboxdrama.com";
const LANG = "id";
const UA =
  "Mozilla/5.0 (Linux; Android 13; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";

export interface DracinItem {
  id?: string;
  title: string;
  slug: string;
  image?: string;
  episodes?: number;
  views?: number;
  genres?: string[];
  description?: string;
  url: string;
}

export interface DracinEpisode {
  number: number;
  watch_url: string;
  video: string | null;
  subtitle: string | null;
  image?: string;
  title?: string;
  views?: number;
}

export interface DracinDetail {
  film: DracinItem;
  total_episode: number;
  episodes: DracinEpisode[];
}

async function get(url: string, cookie?: string) {
  const headers: Record<string, string> = {
    "user-agent": UA,
    accept: "text/html,application/xhtml+xml",
    "accept-language": "id-ID,id;q=0.9",
  };
  if (cookie) headers.cookie = cookie;

  const res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error("HTTP " + res.status + " " + url);
  return await res.text();
}

function flight(html: string) {
  const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
  let out = "";
  let m;
  while ((m = re.exec(html))) {
    try {
      out += JSON.parse('"' + m[1] + '"');
    } catch {}
  }
  return out;
}

function grab(text: string, key: string): any[] {
  const res: any[] = [];
  const needle = '"' + key + '":';
  let i = text.indexOf(needle);
  while (i !== -1) {
    const s = i + needle.length;
    const open = text[s];
    if (open === "[" || open === "{") {
      const close = open === "[" ? "]" : "}";
      let depth = 0;
      let inStr = false;
      let esc = false;
      let j = s;
      for (; j < text.length; j++) {
        const c = text[j];
        if (inStr) {
          if (esc) esc = false;
          else if (c === "\\") esc = true;
          else if (c === '"') inStr = false;
          continue;
        }
        if (c === '"') inStr = true;
        else if (c === open) depth++;
        else if (c === close && --depth === 0) break;
      }
      try {
        res.push(JSON.parse(text.slice(s, j + 1)));
      } catch {}
    }
    i = text.indexOf(needle, i + needle.length);
  }
  return res;
}

function uniq(arr: any[]) {
  const map = new Map();
  for (const x of arr) {
    const k = x && (x.id || x.slug);
    if (k && !map.has(k)) map.set(k, x);
  }
  return [...map.values()];
}

const item = (e: any): DracinItem => ({
  id: e.id,
  title: e.title || e.slug,
  slug: e.slug,
  image: e.image,
  episodes: e.episodes_count,
  views: e.views,
  genres: (e.tags || []).map((t: any) => t.name),
  description: e.description,
  url: `${BASE}/${LANG}/movie/${e.slug}`,
});

const watchUrl = (slug: string, n: number) => `${BASE}/${LANG}/watch/${slug}/episode/${n}`;

function fromHtml(html: string): DracinItem[] {
  if (!html) return [];
  const $ = cheerio.load(html);
  const out: DracinItem[] = [];
  const seen = new Set<string>();

  $('a[href*="/movie/"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    const m = href.match(/\/movie\/([a-z0-9-]+)/);
    if (!m) return;
    const slug = m[1];
    if (seen.has(slug)) return;
    seen.add(slug);

    const card = $(el).closest('[class*="mobileBg"], [class*="cardRoot"], .mantine-Paper-root');
    let img = card.find("img").attr("src") || "";
    if (!img) {
      const p = $(el).parents().filter((_, parent) => $(parent).find("img").length > 0).first();
      img = p.find("img").attr("src") || "";
    }

    if (img.includes("url=")) {
      const matchUrl = img.match(/url=([^&]+)/);
      if (matchUrl) img = decodeURIComponent(matchUrl[1]);
    } else if (img.startsWith("/")) {
      img = `${BASE}${img}`;
    }

    const title =
      $(el).find("h4, h3, h2").text().trim() ||
      $(el).text().trim() ||
      slug.replace(/-/g, " ");

    const epText = card.find("p").text().trim();
    const epMatch = epText.match(/(\d+)\s*Episode/i);
    const episodes = epMatch ? parseInt(epMatch[1]) : 60;
    const genre = card.find('[class*="badgeLink"]').text().trim();

    out.push({
      slug,
      title: title || slug.replace(/-/g, " "),
      image: img || undefined,
      episodes,
      genres: genre ? [genre] : ["Drama Pendek China"],
      url: `${BASE}/${LANG}/movie/${slug}`,
    });
  });

  return out;
}

function collect(text: string) {
  const keys = ["movies", "films", "dramas", "items", "list", "results", "data"];
  let out: any[] = [];
  for (const k of keys) {
    for (const v of grab(text, k)) {
      if (Array.isArray(v)) out.push(...v);
      else if (v && Array.isArray(v.data)) out.push(...v.data);
      else if (v && v.id && v.slug) out.push(v);
    }
  }
  return uniq(out.filter((o) => o && o.slug));
}

export async function getDracinHome(): Promise<DracinItem[]> {
  try {
    const html = await get(`${BASE}/${LANG}`);
    const text = flight(html);
    let data = collect(text).map(item);
    if (!data.length) data = fromHtml(html);
    return data;
  } catch (err) {
    console.error("Dracin home error:", err);
    return [];
  }
}

export async function getDracinList(page: number = 1, genre?: string): Promise<DracinItem[]> {
  try {
    const q = new URLSearchParams({ page: String(page) });
    if (genre) q.set("genre", genre);
    const html = await get(`${BASE}/${LANG}/serialdrama?${q}`);
    const text = flight(html);
    let data = collect(text).map(item);
    if (!data.length) data = fromHtml(html);
    return data;
  } catch (err) {
    console.error("Dracin list error:", err);
    return [];
  }
}

export async function searchDracin(query: string, page: number = 1): Promise<DracinItem[]> {
  try {
    const q = new URLSearchParams({ drama: query, page: String(page) });
    const html = await get(`${BASE}/${LANG}/search?${q}`);
    const text = flight(html);
    let data = collect(text).map(item);
    if (!data.length) data = fromHtml(html);
    return data;
  } catch (err) {
    console.error("Dracin search error:", err);
    return [];
  }
}

function findFilm(text: string, slug: string) {
  for (const key of ["film", "datafilm", "data", "entries"]) {
    for (const v of grab(text, key)) {
      const hit = (Array.isArray(v) ? v : [v]).find((o) => o && o.slug === slug && o.title);
      if (hit) return hit;
    }
  }
  return null;
}

function findEpisodes(text: string) {
  const all = grab(text, "episodes").filter(Array.isArray);
  return all.sort((a, b) => b.length - a.length)[0] || [];
}

export async function getDracinDetail(slug: string): Promise<DracinDetail | null> {
  try {
    const text = flight(await get(`${BASE}/${LANG}/movie/${slug}`));
    const film = findFilm(text, slug);
    let eps = findEpisodes(text);
    if (!eps.length) {
      const t2 = flight(await get(`${BASE}/${LANG}/episode-list/${slug}`));
      eps = findEpisodes(t2);
    }
    return {
      film: film ? item(film) : { slug, title: slug.replace(/-/g, " "), url: `${BASE}/${LANG}/movie/${slug}` },
      total_episode: eps.length,
      episodes: eps.map((e) => ({
        number: e.number,
        watch_url: watchUrl(slug, e.number),
        video: e.video || null,
        subtitle: e.subtitle || null,
        image: e.image || null,
        title: e.seo?.title || `Episode ${e.number}`,
        views: e.views || 0,
      })),
    };
  } catch (err) {
    console.error("Dracin detail error:", err);
    return null;
  }
}

export async function getDracinEpisode(slug: string, num: number, id?: string): Promise<DracinEpisode | null> {
  try {
    const cookie = id ? "movie=" + encodeURIComponent(JSON.stringify({ id, slug })) : undefined;
    const text = flight(await get(watchUrl(slug, num), cookie));
    const cur =
      grab(text, "currentEpisode")[0] ||
      findEpisodes(text).find((e) => String(e.number) === String(num)) ||
      null;
    const files = cur
      ? []
      : [...new Set(text.match(/https?:\/\/[^"\\\s]+?\.(?:mp4|m3u8|vtt|srt|ass)[^"\\\s]*/gi) || [])];
    const direct = cur ? null : (text.match(/"video":"([^"]+)"/) || [])[1];
    let video = (cur && cur.video) || direct || files.find((u: string) => /\.(mp4|m3u8)/i.test(u)) || null;
    const subtitle =
      (cur && (cur.subtitle || cur.subtitle_url || cur.sub)) ||
      files.find((u: string) => /\.(vtt|srt|ass)/i.test(u)) ||
      null;

    if (!video) {
      const detail = await getDracinDetail(slug);
      const epHit = detail?.episodes?.find((e) => e.number === Number(num));
      if (epHit?.video) {
        video = epHit.video;
      }
    }

    return {
      number: Number(num),
      watch_url: watchUrl(slug, num),
      video,
      subtitle,
      title: cur?.seo?.title || `Episode ${num}`,
      image: cur?.image || null,
      views: cur?.views || 0,
    };
  } catch (err) {
    console.error("Dracin episode error:", err);
    return null;
  }
}
