/* Judul : anichin.ts - Anichin Scraper Service
 * Base Url : https://anichin.moe
 * Deskripsi : Scraper lengkap Anichin sampai akar (home, detail anime, list episode, populer, search, jadwal, genre, season, stream) output JSON
 * Author : Vellzyy
 * Sl Author : https://whatsapp.com/channel/0029VbDl6c1KmCPJErq9ox3F
 * Note : Dont rm this Credit 
 */

if (typeof process !== "undefined") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import { getDonghuaLatest, searchDonghua } from "./donghuaFilmService";

const BASE = "https://anichin.moe";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export interface AnichinItem {
  title: string;
  href: string;
  url: string;
  slug: string;
  episode?: string;
  type?: string;
  sub?: string;
  poster: string;
}

export interface AnichinHomeData {
  source: string;
  type: "home";
  page: number;
  count: number;
  rilisan_terbaru: AnichinItem[];
  terpopuler_hari_ini: AnichinItem[];
  jadwal: AnichinJadwal;
  items: AnichinItem[];
}

export interface AnichinDetail {
  source: string;
  type: "anime";
  title: string;
  alternative: string;
  poster: string;
  rating: string;
  rating_count: string;
  followers: string;
  description: string;
  synopsis: string;
  info: Record<string, any>;
  genres: { name: string; href: string; url: string }[];
  tags: { name: string; href: string; url: string }[];
  episodes: {
    episode: string;
    title?: string;
    sub?: string;
    date?: string;
    href: string;
    url: string;
    slug?: string;
  }[];
  episodes_count: number;
  latest_url: string;
  screenshot: string;
}

export interface AnichinStream {
  source: string;
  type: "episode" | "stream";
  title: string;
  thumbnail: string;
  iframe: string;
  stream_url: string;
  embed_url: string;
  video_embed: string;
  current_stream: string;
  streams: { server: string; url_stream: string; embed_url: string }[];
  download: { quality: string; href: string; url: string; label: string }[];
  navigation: {
    all_episodes?: string;
    next?: string;
    prev?: string;
  };
  anime?: {
    title?: string;
    rating?: string;
    anime_url?: string;
  };
}

export interface AnichinJadwal {
  source?: string;
  type?: "jadwal";
  count?: number;
  by_day: Record<string, { title: string; href: string; url: string; day?: string }[]>;
  days: string[];
  items?: { title: string; href: string; url: string; day?: string }[];
  day?: string;
}

export interface AnichinGenreItem {
  name: string;
  slug: string;
  href: string;
  url: string;
}

export interface AnichinSeasonItem {
  name: string;
  slug: string;
  href: string;
  url: string;
  filter_url: string;
}

let jar = "";

function mergeCookies(headers: any) {
  if (!headers) return;
  const arr = Array.isArray(headers) ? headers : [headers];
  for (const c of arr) {
    const kv = c.split(";")[0].trim();
    if (!kv || !kv.includes("=")) continue;
    const name = kv.split("=")[0];
    const parts = jar ? jar.split("; ").filter(Boolean) : [];
    const next = parts.filter((p) => !p.startsWith(name + "="));
    next.push(kv);
    jar = next.join("; ");
  }
}

async function fetchText(url: string, opts: any = {}) {
  const maxRetries = 2;
  let last: any;
  for (let a = 0; a <= maxRetries; a++) {
    try {
      return await _once(url, opts);
    } catch (e: any) {
      last = e;
      const m = (e && e.message) || String(e);
      const t =
        m.includes("timeout") ||
        m.includes("Timeout") ||
        m.includes("fetch failed") ||
        e.code === "UND_ERR_CONNECT_TIMEOUT";
      if (t && a < maxRetries) {
        await new Promise((r) => setTimeout(r, 1200 * (a + 1)));
        continue;
      }
      throw e;
    }
  }
  throw last;
}

async function _once(url: string, opts: any = {}) {
  let cur = url;
  let method = opts.method || "GET";
  let body = opts.body;
  let extra = opts.headers || {};
  for (let hop = 0; hop < 8; hop++) {
    const headers: Record<string, string> = {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
      Referer: BASE + "/",
      ...extra,
    };
    if (jar) headers["Cookie"] = jar;
    const signal =
      typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(15000) : undefined;
    const res = await fetch(cur, { method, headers, body, redirect: "manual", signal });
    let sc: any;
    if (typeof (res.headers as any).getSetCookie === "function") {
      sc = (res.headers as any).getSetCookie();
    } else {
      const v = res.headers.get("set-cookie");
      sc = v ? [v] : [];
    }
    mergeCookies(sc);
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      try {
        await res.text();
      } catch {}
      if (!loc) return { text: "", status: res.status, headers: res.headers, res };
      cur = new URL(loc, cur).href.split("#")[0] || new URL(loc, cur).href;
      if (res.status === 303 || method !== "GET") {
        method = "GET";
        body = undefined;
      }
      continue;
    }
    const text = await res.text();
    return { text, status: res.status, headers: res.headers, res };
  }
  throw new Error("Too many redirects");
}

function absUrl(href: string): string {
  if (!href) return "";
  if (href.startsWith("http")) return href;
  if (href.startsWith("//")) return "https:" + href;
  if (href.startsWith("/")) return BASE + href;
  return BASE + "/" + href;
}

function decodeEntities(s: string): string {
  return String(s || "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&apos;/g, "'")
    .replace(/&#8203;/g, "")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&#039;/g, "'");
}

function stripTags(s: string): string {
  return String(s || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSlug(s: string): string {
  if (!s) return "";
  s = s.trim();
  if (s.startsWith("http")) {
    try {
      s = new URL(s).pathname;
    } catch {}
  }
  s = s.replace(/^\//, "").replace(/\/$/, "");
  return s;
}

function slugToUrl(slug: string): string {
  slug = normalizeSlug(slug);
  if (!slug) return BASE + "/";
  if (slug.startsWith("http")) return slug;
  return BASE + "/" + slug + "/";
}

function extractImg(block: string): string {
  let m = block.match(/data-src="([^"]+)"/);
  if (m) return m[1];
  m = block.match(/src="([^"]+)"/);
  if (m) {
    const v = m[1];
    if (v.startsWith("data:image")) {
      const m2 = block.match(/data-src="([^"]+)"/);
      if (m2) return m2[1];
    }
    return v;
  }
  return "";
}

function parseListUpd(html: string, url: string): {
  source: string;
  type: string;
  count: number;
  items: AnichinItem[];
  next: string;
} {
  const items: AnichinItem[] = [];
  const re = /<article class="bs"[\s\S]*?<\/article>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const b = m[0];
    const href =
      (b.match(/<a[^>]*href="([^"]+)"[^>]*itemprop="url"/) ||
        b.match(/<a[^>]*href="([^"]+)"[^>]*class="tip"/) ||
        b.match(/<a[^>]*href="([^"]+)"/) ||
        [])[1] || "";
    const title =
      (b.match(/<h2[^>]*itemprop="headline"[^>]*>([\s\S]*?)<\/h2>/) ||
        b.match(/title="([^"]+)"/) ||
        [])[1] || "";
    const epx = (b.match(/<span class="epx">([\s\S]*?)<\/span>/) || [])[1] || "";
    const typez = (b.match(/<div class="typez[^"]*">([\s\S]*?)<\/div>/) || [])[1] || "";
    const sb = (b.match(/<span class="sb[^"]*">([\s\S]*?)<\/span>/) || [])[1] || "";
    const imgBlock = (b.match(/<img[^>]*>/) || [])[0] || "";
    const img = extractImg(imgBlock);
    const h2alt =
      (b.match(/<div class="tt">[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || "";
    const t = decodeEntities(stripTags(title || h2alt));
    if (!href) continue;
    items.push({
      title: t,
      href,
      url: absUrl(href),
      slug: normalizeSlug(href),
      episode: decodeEntities(stripTags(epx)),
      type: decodeEntities(stripTags(typez)) || "Donghua",
      sub: decodeEntities(stripTags(sb)) || "Sub Indo",
      poster: absUrl(img),
    });
  }
  const next =
    (html.match(/<a[^>]*href="([^"]+)"[^>]*class="r"[^>]*>Next/) ||
      html.match(/<a[^>]*href="([^"]+page\/2\/)"[^>]*>/) ||
      [])[1] || "";
  return {
    source: url,
    type: "list",
    count: items.length,
    items: items.slice(0, 80),
    next: next ? absUrl(next) : "",
  };
}

function parseJadwal(html: string): AnichinJadwal {
  const byDay: Record<string, { title: string; href: string; url: string; day?: string }[]> = {};
  const order: string[] = [];
  const reDay =
    /<div class="listSchh">[\s\S]*?<h2>([^<]+)<\/h2>[\s\S]*?<div class="subSchh">([\s\S]*?)<\/div>\s*<\/div>/g;
  let m: RegExpExecArray | null;
  while ((m = reDay.exec(html))) {
    const day = decodeEntities(stripTags(m[1])).trim();
    const block = m[2];
    const links: { title: string; href: string; url: string; day?: string }[] = [];
    const reA = /<a href="([^"]+)">([^<]+)<\/a>/g;
    let a: RegExpExecArray | null;
    while ((a = reA.exec(block))) {
      links.push({
        title: decodeEntities(stripTags(a[2])),
        href: a[1],
        url: absUrl(a[1]),
        day,
      });
    }
    byDay[day] = links;
    order.push(day);
  }
  return { by_day: byDay, days: order };
}

function parseHome(html: string, url: string): AnichinHomeData {
  let rilisan: AnichinItem[] = [];
  let terpopuler: AnichinItem[] = [];
  const rilisanBlock =
    (html.match(/<div class="listupd normal">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/) || [])[1] ||
    "";
  if (rilisanBlock) {
    const re = /<article class="bs"[\s\S]*?<\/article>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(rilisanBlock))) {
      const b = m[0];
      const href = (b.match(/<a[^>]*href="([^"]+)"/) || [])[1] || "";
      const title =
        (b.match(/title="([^"]+)"/) || b.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || "";
      const epx = (b.match(/<span class="epx">([\s\S]*?)<\/span>/) || [])[1] || "";
      const typez = (b.match(/<div class="typez[^"]*">([\s\S]*?)<\/div>/) || [])[1] || "";
      const sb = (b.match(/<span class="sb[^"]*">([\s\S]*?)<\/span>/) || [])[1] || "";
      const imgBlock = (b.match(/<img[^>]*>/) || [])[0] || "";
      const img = extractImg(imgBlock);
      const t = decodeEntities(stripTags(title));
      if (!href) continue;
      rilisan.push({
        title: t,
        href,
        url: absUrl(href),
        slug: normalizeSlug(href),
        episode: decodeEntities(stripTags(epx)),
        type: decodeEntities(stripTags(typez)) || "Donghua",
        sub: decodeEntities(stripTags(sb)) || "Sub Indo",
        poster: absUrl(img),
      });
    }
  }

  const populerBlock =
    (html.match(/<div class="listupd popularslider">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/) ||
      [])[1] ||
    "";
  if (populerBlock) {
    const re = /<article class="bs"[\s\S]*?<\/article>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(populerBlock))) {
      const b = m[0];
      const href = (b.match(/<a[^>]*href="([^"]+)"/) || [])[1] || "";
      const title =
        (b.match(/title="([^"]+)"/) || b.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || "";
      const epx = (b.match(/<span class="epx">([\s\S]*?)<\/span>/) || [])[1] || "";
      const typez = (b.match(/<div class="typez[^"]*">([\s\S]*?)<\/div>/) || [])[1] || "";
      const sb = (b.match(/<span class="sb[^"]*">([\s\S]*?)<\/span>/) || [])[1] || "";
      const imgBlock = (b.match(/<img[^>]*>/) || [])[0] || "";
      const img = extractImg(imgBlock);
      const t = decodeEntities(stripTags(title));
      if (!href) continue;
      terpopuler.push({
        title: t,
        href,
        url: absUrl(href),
        slug: normalizeSlug(href),
        episode: decodeEntities(stripTags(epx)),
        type: decodeEntities(stripTags(typez)) || "Donghua",
        sub: decodeEntities(stripTags(sb)) || "Sub Indo",
        poster: absUrl(img),
      });
    }
  }

  if (rilisan.length === 0) {
    const fallback = parseListUpd(html, url);
    rilisan = fallback.items;
  }

  const jadwal = parseJadwal(html);
  return {
    source: url,
    type: "home",
    page: 1,
    count: rilisan.length,
    rilisan_terbaru: rilisan,
    terpopuler_hari_ini: terpopuler,
    jadwal,
    items: rilisan,
  };
}

function parseAnime(html: string, url: string): AnichinDetail {
  const title =
    (html.match(/<h1 class="entry-title"[^>]*>([\s\S]*?)<\/h1>/) ||
      html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) ||
      [])[1] ||
    (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] ||
    "";
  const cleanTitle = decodeEntities(stripTags(title));
  const alter = (html.match(/<span class="alter">([\s\S]*?)<\/span>/) || [])[1] || "";
  const posterBlock = (html.match(/<div class="thumb"[^>]*>[\s\S]*?<\/div>/) || [])[0] || "";
  const posterImg = extractImg(posterBlock);
  const poster = posterImg
    ? absUrl(posterImg)
    : (html.match(/<meta property="og:image"[^>]*content="([^"]+)"/) || [])[1] || "";
  const rating =
    (html.match(/<div class="rating">[\s\S]*?<strong>Rating ([^<]+)<\/strong>/) ||
      html.match(/<meta itemprop="ratingValue"[^>]*content="([^"]+)"/) ||
      [])[1] || "9.0";
  const ratingCount =
    (html.match(/<meta itemprop="ratingCount"[^>]*content="([^"]+)"/) || [])[1] || "100";
  const bookmark = (html.match(/<div class="bmc">([^<]+)<\/div>/) || [])[1] || "";
  const mindesc = (html.match(/<div class="mindesc">([\s\S]*?)<\/div>/) || [])[1] || "";
  const synopsis =
    (html.match(/<div class="entry-content"[^>]*itemprop="description"[^>]*>([\s\S]*?)<\/div>/) ||
      html.match(/<div class="desc[^"]*">([\s\S]*?)<\/div>/) ||
      [])[1] || "";
  const info: Record<string, any> = {};
  const speBlock =
    (html.match(/<div class="spe">([\s\S]*?)<\/div>\s*<div class="genxed">/) ||
      html.match(/<div class="spe">([\s\S]*?)<\/div>/) ||
      [])[1] || "";
  const reInfo = /<span><b>([^:]+):<\/b>\s*([\s\S]*?)<\/span>/g;
  let mm: RegExpExecArray | null;
  while ((mm = reInfo.exec(speBlock))) {
    const key = mm[1].trim().toLowerCase().replace(/\s+/g, "_");
    const val = mm[2];
    const links: { name: string; href: string; url: string }[] = [];
    const reA = /<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    let aa: RegExpExecArray | null;
    while ((aa = reA.exec(val))) {
      links.push({
        name: decodeEntities(stripTags(aa[2])),
        href: aa[1],
        url: absUrl(aa[1]),
      });
    }
    const text = decodeEntities(stripTags(val));
    if (links.length > 0) info[key] = { text, links };
    else info[key] = text;
  }
  const genres: { name: string; href: string; url: string }[] = [];
  const genxed = (html.match(/<div class="genxed">([\s\S]*?)<\/div>/) || [])[1] || "";
  const reG = /<a[^>]*href="([^"]+)"[^>]*rel="tag"[^>]*>([^<]+)<\/a>/g;
  while ((mm = reG.exec(genxed))) {
    genres.push({
      name: decodeEntities(stripTags(mm[2])),
      href: mm[1],
      url: absUrl(mm[1]),
    });
  }
  const tags: { name: string; href: string; url: string }[] = [];
  const tagBlock = (html.match(/<div class="bottom tags">([\s\S]*?)<\/div>/) || [])[1] || "";
  const reT = /<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  while ((mm = reT.exec(tagBlock))) {
    tags.push({
      name: decodeEntities(stripTags(mm[2])),
      href: mm[1],
      url: absUrl(mm[1]),
    });
  }
  const episodes: any[] = [];
  const listBlock = (html.match(/<div class="eplister">([\s\S]*?)<\/ul>/) || [])[0] || "";
  const src = listBlock || html;
  const reE =
    /<li[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<div class="epl-num">([^<]+)<\/div>[\s\S]*?<div class="epl-title">([^<]+)<\/div>[\s\S]*?<div class="epl-sub">[\s\S]*?<span[^>]*>([^<]+)<\/span>[\s\S]*?<div class="epl-date">([^<]+)<\/div>/g;
  while ((mm = reE.exec(src))) {
    episodes.push({
      href: mm[1],
      url: absUrl(mm[1]),
      slug: normalizeSlug(mm[1]),
      episode: decodeEntities(stripTags(mm[2])),
      title: decodeEntities(stripTags(mm[3])),
      sub: decodeEntities(stripTags(mm[4])),
      date: decodeEntities(stripTags(mm[5])),
    });
  }
  if (episodes.length === 0) {
    const reE2 =
      /<a[^>]*href="([^"]*episode[^"]*)"[^>]*>[\s\S]*?<div class="epl-num">([^<]+)<\/div>/g;
    while ((mm = reE2.exec(html))) {
      episodes.push({
        href: mm[1],
        url: absUrl(mm[1]),
        slug: normalizeSlug(mm[1]),
        episode: decodeEntities(stripTags(mm[2])),
      });
    }
  }
  const banner =
    (html.match(/<div class="inepcx">[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>/) || [])[1] || "";
  const screenshotFallback =
    (html.match(/<meta property="og:image"[^>]*content="([^"]+)"/) || [])[1] || "";
  return {
    source: url,
    type: "anime",
    title: cleanTitle,
    alternative: decodeEntities(stripTags(alter)),
    poster: absUrl(poster),
    rating: decodeEntities(stripTags(rating)),
    rating_count: decodeEntities(stripTags(ratingCount)),
    followers: decodeEntities(stripTags(bookmark)),
    description: decodeEntities(stripTags(mindesc)),
    synopsis: decodeEntities(stripTags(synopsis)),
    info,
    genres,
    tags,
    episodes,
    episodes_count: episodes.length,
    latest_url: banner ? absUrl(banner) : "",
    screenshot: screenshotFallback ? absUrl(screenshotFallback) : "",
  };
}

function parseEpisode(html: string, url: string): AnichinStream {
  const title =
    (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] ||
    (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] ||
    "";
  const cleanTitle = decodeEntities(stripTags(title));
  const canonical = (html.match(/<link rel="canonical"[^>]*href="([^"]+)"/) || [])[1] || url;
  const thumb = (html.match(/<meta property="og:image"[^>]*content="([^"]+)"/) || [])[1] || "";
  let iframe = "";
  const liteM = html.match(/data-litespeed-src=["']([^"']+)["']/i);
  if (liteM && liteM[1] && liteM[1] !== "about:blank") iframe = liteM[1];
  if (!iframe) {
    const iframeM =
      html.match(/<IFRAME[^>]*SRC=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/i);
    if (iframeM && iframeM[1] && iframeM[1] !== "about:blank") iframe = iframeM[1];
  }
  if (!iframe) {
    const m2 = html.match(/<div class="player-embed"[^>]*>[\s\S]*?SRC=["']([^"']+)["']/i);
    if (m2 && m2[1] && m2[1] !== "about:blank") iframe = m2[1];
  }
  iframe = iframe ? decodeEntities(iframe).trim() : "";
  const download: { quality: string; href: string; url: string; label: string }[] = [];
  const soraRe =
    /<div class="soraurlx">\s*<strong>\s*([^<]+)\s*<\/strong>\s*<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  let mm: RegExpExecArray | null;
  while ((mm = soraRe.exec(html))) {
    download.push({
      quality: decodeEntities(stripTags(mm[1])),
      href: mm[2],
      url: mm[2].startsWith("http") ? mm[2] : absUrl(mm[2]),
      label: decodeEntities(stripTags(mm[3])),
    });
  }
  const tera =
    (html.match(/<a[^>]*href="(https:\/\/terabox\.com[^"]+)"[^>]*>/i) ||
      html.match(/<a[^>]*href="(https:\/\/www\.terabox[^"]+)"[^>]*>/i) ||
      [])[1] || "";
  if (tera && !download.find((d) => d.href === tera)) {
    download.push({ quality: "Terabox", href: tera, url: tera, label: "Terabox" });
  }
  const nav: Record<string, string> = {};
  const allM =
    html.match(/<div class="nvs nvsc"><a[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?All Episodes/i) ||
    html.match(/<a[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?All Episodes/i);
  if (allM && allM[1]) nav.all_episodes = absUrl(allM[1]);
  const nextM =
    html.match(/<a[^>]*aria-label=["']next["'][^>]*href=["']([^"']+)["']/i) ||
    html.match(/<a[^>]*href=["']([^"']+)["'][^>]*rel=["']next["']/i);
  if (nextM && nextM[1]) nav.next = absUrl(nextM[1]);
  const prevM = html.match(/<div class="nvs"><a[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?Prev/i);
  if (prevM && prevM[1]) nav.prev = absUrl(prevM[1]);
  const animeInfo: Record<string, string> = {};
  const infoBlock =
    (html.match(/<h2[^>]*itemprop="partOfSeries"[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || "";
  if (infoBlock) animeInfo.title = decodeEntities(stripTags(infoBlock));
  const ratingA =
    (html.match(/<div class="rating">[\s\S]*?<strong>Rating ([^<]+)<\/strong>/) || [])[1] || "";
  if (ratingA) animeInfo.rating = decodeEntities(stripTags(ratingA));
  const animeLink =
    (html.match(
      /<div class="nvs nvsc"><a[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?All Episodes/i
    ) ||
      html.match(/<a[^>]*href=["'](https:\/\/anichin\.moe\/[^"']+)["'][^>]*>[\s\S]*?All Episodes/i) ||
      html.match(/<a[^>]*href=["'](\/[^"']+)["'][^>]*>Perfect World/i) ||
      [])[1] || "";
  if (animeLink) animeInfo.anime_url = absUrl(animeLink);
  const breadcrumb =
    (html.match(
      /<a itemprop="item" href="(\/[^"]+)"><span itemprop="name">([^<]+)<\/span><\/a>[\s\S]*?<a itemprop="item" href="(\/[^"]+)"><span itemprop="name">([^<]+)<\/span><\/a>/
    ) || [])[2] || "";
  if (breadcrumb && !animeInfo.title) animeInfo.title = decodeEntities(stripTags(breadcrumb));
  const streamUrl = iframe;
  const embedUrl = iframe;
  const streams: { server: string; url_stream: string; embed_url: string }[] = [];
  if (iframe) streams.push({ server: "Server Utama", url_stream: iframe, embed_url: iframe });
  return {
    source: canonical,
    type: "episode",
    title: cleanTitle,
    thumbnail: thumb ? absUrl(thumb) : "",
    iframe,
    stream_url: streamUrl,
    embed_url: embedUrl,
    video_embed: iframe,
    current_stream: streamUrl,
    streams,
    download,
    navigation: nav,
    anime: animeInfo,
  };
}

function parseSearch(html: string, url: string): AnichinItem[] {
  const items: AnichinItem[] = [];
  const re = /<article class="bs"[\s\S]*?<\/article>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const b = m[0];
    const href =
      (b.match(/<a[^>]*href="([^"]+)"[^>]*itemprop="url"/) ||
        b.match(/<a[^>]*href="([^"]+)"[^>]*class="tip"/) ||
        b.match(/<a[^>]*href="([^"]+)"/) ||
        [])[1] || "";
    const h2 =
      (b.match(/<h2[^>]*itemprop="headline"[^>]*>([\s\S]*?)<\/h2>/) ||
        b.match(/<div class="tt">[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/) ||
        b.match(/title="([^"]+)"/) ||
        [])[1] || "";
    const epx = (b.match(/<span class="epx">([^<]+)<\/span>/) || [])[1] || "";
    const typez = (b.match(/<div class="typez[^"]*">([^<]+)<\/div>/) || [])[1] || "";
    const sb = (b.match(/<span class="sb[^"]*">([^<]+)<\/span>/) || [])[1] || "";
    const imgBlock = (b.match(/<img[^>]*>/) || [])[0] || "";
    const img = extractImg(imgBlock);
    const title = decodeEntities(stripTags(h2));
    if (!href || !title) continue;
    items.push({
      title,
      href,
      url: absUrl(href),
      slug: normalizeSlug(href),
      episode: decodeEntities(stripTags(epx)),
      type: decodeEntities(stripTags(typez)) || "Donghua",
      sub: decodeEntities(stripTags(sb)) || "Sub Indo",
      poster: absUrl(img),
    });
  }
  return items;
}

function buildPagedUrl(base: string, page: number): string {
  const p = parseInt(String(page), 10);
  if (!p || p <= 1) return base.endsWith("/") ? base : base + "/";
  const b = base.endsWith("/") ? base : base + "/";
  return b + "page/" + p + "/";
}

/* ========================================================
 * Public Service API
 * ======================================================== */

export async function getAnichinHome(page: number = 1): Promise<AnichinHomeData> {
  const p = parseInt(String(page), 10) || 1;
  const url = p > 1 ? BASE + "/page/" + p + "/" : BASE + "/";
  try {
    const { text, status } = await fetchText(url);
    if (status !== 403 && !text.includes("403 Forbidden") && text.includes("listupd")) {
      const data = parseHome(text, url);
      if (data && data.items && data.items.length > 0) {
        data.page = p;
        return data;
      }
    }
  } catch (err) {
    console.error("fetchText error in getAnichinHome:", err);
  }

  // Resilient fallback to live DonghuaFilm records when AniChin blocks Vercel IPs
  try {
    const dhRes = await getDonghuaLatest(p, 20);
    if (dhRes && dhRes.results && dhRes.results.length > 0) {
      const mapped: AnichinItem[] = dhRes.results.map((d: any) => ({
        title: d.title,
        href: `/donghuafilm/watch?id=${d.id}`,
        url: d.url,
        slug: d.slug,
        episode: d.latest_episode ? `Ep ${d.latest_episode}` : "Ongoing",
        type: "Donghua",
        sub: "Sub Indo",
        poster: d.poster || d.cover || "https://static.anipop.xyz/poster/anime/gensou-sangokushi.jpg?h=400",
      }));
      return {
        source: "https://donghuafilm.site",
        type: "home",
        page: p,
        count: mapped.length,
        rilisan_terbaru: mapped,
        terpopuler_hari_ini: mapped.slice(0, 10),
        jadwal: { by_day: {}, days: [] },
        items: mapped,
      };
    }
  } catch {}

  return {
    source: url,
    type: "home",
    page: p,
    count: 0,
    rilisan_terbaru: [],
    terpopuler_hari_ini: [],
    jadwal: { by_day: {}, days: [] },
    items: [],
  };
}

export async function getAnichinPopular(page: number = 1): Promise<AnichinItem[]> {
  const p = parseInt(String(page), 10) || 1;
  const url = BASE + "/anime/?order=popular" + (p > 1 ? "&page=" + p : "");
  try {
    const { text, status } = await fetchText(url);
    if (status !== 403 && !text.includes("403 Forbidden") && text.includes("listupd")) {
      const data = parseListUpd(text, url);
      if (data && data.items && data.items.length > 0) return data.items;
    }
  } catch {}

  // Resilient fallback
  try {
    const dhRes = await getDonghuaLatest(p, 24);
    if (dhRes && dhRes.results && dhRes.results.length > 0) {
      return dhRes.results.map((d: any) => ({
        title: d.title,
        href: `/donghuafilm/watch?id=${d.id}`,
        url: d.url,
        slug: d.slug,
        episode: d.latest_episode ? `Ep ${d.latest_episode}` : "Ongoing",
        type: "Donghua",
        sub: "Sub Indo",
        poster: d.poster || d.cover || "https://static.anipop.xyz/poster/anime/gensou-sangokushi.jpg?h=400",
      }));
    }
  } catch {}
  return [];
}

export async function searchAnichin(query: string, page: number = 1): Promise<AnichinItem[]> {
  const q = (query || "").trim();
  if (!q) return [];
  const p = parseInt(String(page), 10) || 1;
  let url = BASE + "/?s=" + encodeURIComponent(q);
  if (p > 1) url += "&page=" + p;
  try {
    const { text, status } = await fetchText(url);
    if (status !== 403 && !text.includes("403 Forbidden")) {
      const items = parseSearch(text, url);
      if (items && items.length > 0) return items;
    }
  } catch {}

  // Resilient fallback
  try {
    const dhRes = await searchDonghua(q, p, 20);
    if (dhRes && dhRes.results && dhRes.results.length > 0) {
      return dhRes.results.map((d: any) => ({
        title: d.title,
        href: `/donghuafilm/watch?id=${d.id}`,
        url: d.url,
        slug: d.slug,
        episode: d.latest_episode ? `Ep ${d.latest_episode}` : "Ongoing",
        type: "Donghua",
        sub: "Sub Indo",
        poster: d.poster || d.cover || "https://static.anipop.xyz/poster/anime/gensou-sangokushi.jpg?h=400",
      }));
    }
  } catch {}
  return [];
}

export async function getAnichinDetail(raw: string): Promise<AnichinDetail | null> {
  let url = (raw || "").trim();
  if (!url) return null;
  if (!url.startsWith("http")) {
    const slug = normalizeSlug(url);
    if (slug.startsWith("anime/")) url = BASE + "/" + slug + "/";
    else url = BASE + "/" + slug + "/";
  }
  try {
    const { text, status } = await fetchText(url);
    if (status === 403 || text.includes("403 Forbidden")) return null;
    if (
      !text.includes("eplister") &&
      !text.includes("entry-title") &&
      text.includes("Page not found")
    ) {
      const alt = url.includes("/anime/")
        ? url.replace("/anime/", "/")
        : url.replace(BASE + "/", BASE + "/anime/");
      const { text: t2, status: s2 } = await fetchText(alt);
      if (s2 !== 403 && (t2.includes("eplister") || t2.includes("entry-title"))) {
        return parseAnime(t2, alt);
      }
    }
    return parseAnime(text, url);
  } catch (err) {
    console.error("getAnichinDetail error:", err);
    return null;
  }
}

export async function getAnichinEpisodes(raw: string): Promise<{
  source: string;
  type: string;
  anime_title: string;
  count: number;
  episodes: any[];
  current_episode?: any;
}> {
  let url = (raw || "").trim();
  if (!url) return { source: "", type: "episodes", anime_title: "", count: 0, episodes: [] };
  if (!url.startsWith("http")) {
    const slug = normalizeSlug(url);
    if (slug.includes("-episode-")) url = BASE + "/" + slug + (slug.endsWith("/") ? "" : "/");
    else url = slugToUrl(slug.startsWith("anime/") ? slug : slug);
  }
  const { text, status } = await fetchText(url);
  if (status === 403 || text.includes("403 Forbidden")) {
    return { source: url, type: "episodes", anime_title: "", count: 0, episodes: [] };
  }
  const isEpisode =
    text.includes('id="embed_holder"') || text.includes("player-embed") || url.includes("-episode-");
  if (isEpisode) {
    const ep = parseEpisode(text, url);
    let animeUrl = ep.navigation.all_episodes || ep.anime?.anime_url || "";
    if (!animeUrl) {
      const bc = text.match(
        /<a itemprop="item" href="(\/[^"]+)"><span itemprop="name">[^<]+<\/span><\/a>[\s\S]*?<a itemprop="item" href="(\/[^"]+)"><span itemprop="name">[^<]+<\/span><\/a>/
      );
      if (bc && bc[2] && bc[2] !== url) animeUrl = absUrl(bc[2]);
    }
    let animeHtml = "";
    let animeFinal = animeUrl;
    if (animeUrl) {
      try {
        const r = await fetchText(animeUrl);
        if (
          r.status !== 403 &&
          !r.text.includes("403 Forbidden") &&
          (r.text.includes("eplister") || r.text.includes("entry-title"))
        ) {
          animeHtml = r.text;
          animeFinal = animeUrl;
        }
      } catch {}
    }
    if (!animeHtml) {
      const m = url.match(/^(https?:\/\/[^\/]+\/)(.+?)-episode-\d+.*$/i);
      if (m) {
        const guess = m[2].replace(/\/$/, "");
        const tryUrls = [BASE + "/" + guess + "/", BASE + "/anime/" + guess + "/"];
        for (const tryUrl of tryUrls) {
          if (tryUrl === url || tryUrl === animeUrl) continue;
          try {
            const r2 = await fetchText(tryUrl);
            if (
              r2.status !== 403 &&
              !r2.text.includes("403 Forbidden") &&
              r2.text.includes("eplister")
            ) {
              animeHtml = r2.text;
              animeFinal = tryUrl;
              break;
            }
          } catch {}
        }
      }
    }
    if (animeHtml) {
      const anime = parseAnime(animeHtml, animeFinal);
      return {
        source: url,
        type: "episodes",
        anime_title: anime.title,
        count: anime.episodes.length,
        episodes: anime.episodes,
        current_episode: {
          title: ep.title,
          url: ep.source,
          stream_url: ep.stream_url,
          embed_url: ep.embed_url,
          download: ep.download,
        },
      };
    }
    return {
      source: url,
      type: "episodes",
      anime_title: ep.anime?.title || decodeEntities(stripTags(ep.title)) || "",
      count: 0,
      episodes: [],
      current_episode: ep,
    };
  }
  const anime = parseAnime(text, url);
  return {
    source: url,
    type: "episodes",
    anime_title: anime.title,
    count: anime.episodes.length,
    episodes: anime.episodes,
  };
}

export async function getAnichinStream(raw: string): Promise<AnichinStream | null> {
  let url = (raw || "").trim();
  if (!url) return null;
  if (!url.startsWith("http")) {
    let slug = normalizeSlug(url);
    if (!slug.includes("episode")) slug = slug + "-episode-1-subtitle-indonesia";
    url = BASE + "/" + slug + (slug.endsWith("/") ? "" : "/");
  }
  try {
    const { text, status } = await fetchText(url);
    if (status === 403 || text.includes("403 Forbidden")) return null;
    return parseEpisode(text, url);
  } catch (err) {
    console.error("getAnichinStream error:", err);
    return null;
  }
}

export async function getAnichinJadwal(dayRaw?: string): Promise<AnichinJadwal> {
  try {
    const { text, status } = await fetchText(BASE + "/");
    if (status === 403 || text.includes("403 Forbidden")) {
      return { by_day: {}, days: [], items: [] };
    }
    const jadwal = parseJadwal(text);
    const raw = (dayRaw || "").trim().toUpperCase();
    const mapDay: Record<string, string> = {
      SENIN: "Senin",
      SELASA: "Selasa",
      RABU: "Rabu",
      KAMIS: "Kamis",
      JUMAT: "Jum'at",
      JUMAT2: "Jumat",
      SABTU: "Sabtu",
      MINGGU: "Minggu",
      ACAK: "Acak",
    };
    const target = mapDay[raw] || "";
    if (target) {
      const keys = Object.keys(jadwal.by_day);
      const found = keys.find(
        (k) =>
          k.toLowerCase() === target.toLowerCase() ||
          k === target ||
          (target === "Jumat" && k === "Jum'at")
      );
      const key = found || target;
      const items = jadwal.by_day[key] || jadwal.by_day[target] || [];
      return {
        source: BASE + "/",
        type: "jadwal",
        day: key || target,
        count: items.length,
        items,
        by_day: jadwal.by_day,
        days: jadwal.days,
      };
    }
    const all: { title: string; href: string; url: string; day?: string }[] = [];
    for (const d of jadwal.days) {
      for (const it of jadwal.by_day[d] || []) {
        all.push({ ...it, day: d });
      }
    }
    return {
      source: BASE + "/",
      type: "jadwal",
      count: all.length,
      by_day: jadwal.by_day,
      days: jadwal.days,
      items: all,
    };
  } catch (err) {
    console.error("getAnichinJadwal error:", err);
    return { by_day: {}, days: [], items: [] };
  }
}

export async function getAnichinGenres(): Promise<AnichinGenreItem[]> {
  try {
    const { text, status } = await fetchText(BASE + "/anime/");
    if (status === 403 || text.includes("403 Forbidden")) return [];
    const items: AnichinGenreItem[] = [];
    const re = /<input[^>]*id="genre-([^"]+)"[^>]*value="([^"]+)"[^>]*>\s*<label[^>]*>([^<]+)<\/label>/g;
    let m: RegExpExecArray | null;
    const seen: Record<string, boolean> = {};
    while ((m = re.exec(text))) {
      const slug = m[2].trim();
      const label = decodeEntities(stripTags(m[3]));
      if (seen[slug]) continue;
      seen[slug] = true;
      items.push({
        name: label,
        slug,
        href: "/genres/" + slug + "/",
        url: BASE + "/genres/" + slug + "/",
      });
    }
    items.sort((a, b) => a.name.localeCompare(b.name));
    return items;
  } catch (err) {
    console.error("getAnichinGenres error:", err);
    return [];
  }
}

export async function getAnichinByGenre(
  name: string,
  page: number = 1
): Promise<{ genre: string; items: AnichinItem[]; page: number; next?: string }> {
  const slug = (name || "").trim().toLowerCase().replace(/\s+/g, "-");
  if (!slug) return { genre: "", items: [], page: 1 };
  const base = BASE + "/genres/" + slug + "/";
  const p = parseInt(String(page), 10) || 1;
  const url = buildPagedUrl(base, p);
  const { text, status } = await fetchText(url);
  if (status === 403 || text.includes("403 Forbidden")) {
    return { genre: slug, items: [], page: p };
  }
  const data = parseListUpd(text, url);
  return {
    genre: slug,
    items: data.items,
    page: p,
    next: data.next,
  };
}

export async function getAnichinSeasons(): Promise<AnichinSeasonItem[]> {
  try {
    const { text, status } = await fetchText(BASE + "/anime/");
    if (status === 403 || text.includes("403 Forbidden")) return [];
    const items: AnichinSeasonItem[] = [];
    const re = /<input[^>]*id="season-([^"]+)"[^>]*value="([^"]+)"[^>]*>\s*<label[^>]*>([^<]+)<\/label>/g;
    let m: RegExpExecArray | null;
    const seen: Record<string, boolean> = {};
    while ((m = re.exec(text))) {
      const slug = m[2].trim();
      const label = decodeEntities(stripTags(m[3]));
      if (seen[slug]) continue;
      seen[slug] = true;
      items.push({
        name: label,
        slug,
        href: "/season/" + slug + "/",
        url: BASE + "/season/" + slug + "/",
        filter_url: BASE + "/anime/?season%5B%5D=" + encodeURIComponent(slug),
      });
    }
    items.sort((a, b) => a.name.localeCompare(b.name));
    return items;
  } catch (err) {
    console.error("getAnichinSeasons error:", err);
    return [];
  }
}

export async function getAnichinBySeason(
  name: string,
  page: number = 1
): Promise<{ season: string; items: AnichinItem[]; page: number; next?: string }> {
  const slug = (name || "").trim().toLowerCase().replace(/\s+/g, "-");
  if (!slug) return { season: "", items: [], page: 1 };
  const p = parseInt(String(page), 10) || 1;
  const url = BASE + "/anime/?season%5B%5D=" + encodeURIComponent(slug) + (p > 1 ? "&page=" + p : "");
  const { text, status } = await fetchText(url);
  if (status === 403 || text.includes("403 Forbidden")) {
    return { season: slug, items: [], page: p };
  }
  const data = parseListUpd(text, url);
  return {
    season: slug,
    items: data.items,
    page: p,
    next: data.next,
  };
}
