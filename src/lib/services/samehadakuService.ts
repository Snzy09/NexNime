// Samehadaku Service - Live Scraper for Samehadaku (https://samehadaku.li)
// Creator: IzzXd, Integrated for Luoyiv Streaming Hub

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://samehadaku.li';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'User-Agent': USER_AGENT,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
  }
});

function decodeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function cleanText(str: string): string {
  return decodeHtml((str || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

export interface SamehadakuItem {
  id: string | number;
  title: string;
  slug: string;
  url: string;
  thumb: string;
  synopsis?: string;
  status?: string;
  type?: string;
  score?: string;
  episode?: string;
}

export interface SamehadakuDetail {
  title: string;
  slug: string;
  url: string;
  thumb: string;
  score: string;
  status: string;
  type: string;
  genres: string[];
  synopsis: string;
  totalEpisodes: number;
  episodes: {
    episode: string;
    title: string;
    url: string;
    slug: string;
    date: string;
  }[];
}

export interface SamehadakuEpisodeStream {
  title: string;
  url: string;
  servers: {
    server: string;
    url: string;
    embed?: string;
  }[];
  downloads?: {
    host: string;
    url: string;
  }[];
}

// 1. Get Popular / Recent anime from WP REST API or HTML
export async function getSamehadakuPopular(perPage = 18): Promise<SamehadakuItem[]> {
  try {
    const wpRes = await client.get(`/wp-json/wp/v2/anime?per_page=${perPage}&orderby=date&order=desc`);
    if (Array.isArray(wpRes.data) && wpRes.data.length > 0) {
      return wpRes.data.map((item: any) => {
        const thumb =
          item.yoast_head_json?.og_image?.[0]?.url ||
          item.yoast_head_json?.schema?.['@graph']?.find((g: any) => g['@type'] === 'ImageObject')?.contentUrl ||
          '';

        return {
          id: item.id,
          title: decodeHtml(item.title?.rendered || ''),
          slug: item.slug,
          url: item.link || `${BASE_URL}/anime/${item.slug}/`,
          thumb: thumb,
          synopsis: cleanText(item.content?.rendered || item.yoast_head_json?.description || ''),
          type: 'Samehadaku Anime',
          status: 'Ongoing'
        };
      });
    }
  } catch (err) {
    console.warn('WP REST API popular fetch fallback:', err);
  }

  // Fallback to HTML scraping from homepage
  try {
    const { data } = await client.get('/');
    const $ = cheerio.load(data);
    const results: SamehadakuItem[] = [];

    $('.post-show ul li, .listupd article.bs, .animposx, .relat ul li').each((i, el) => {
      const a = $(el).find('a').first();
      const href = a.attr('href') || '';
      const title = a.attr('title') || $(el).find('.tt h2, .title, .entry-title').text().trim();
      const thumb = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';
      const ep = $(el).find('.epx, .bt .epx').text().trim();
      const slugMatch = href.match(/(?:anime\/|\/)([^/]+)\/?$/);
      const slug = slugMatch ? slugMatch[1] : `anime-${i}`;

      if (href && title && results.length < perPage) {
        results.push({
          id: slug,
          title: decodeHtml(title),
          slug: slug,
          url: href,
          thumb: thumb,
          episode: ep,
          type: 'Samehadaku',
          status: 'Ongoing'
        });
      }
    });

    return results;
  } catch (err: any) {
    console.error('Samehadaku homepage scrape error:', err.message);
    return [];
  }
}

// 2. Search Samehadaku
export async function searchSamehadaku(query: string): Promise<SamehadakuItem[]> {
  if (!query) return [];

  try {
    const wpRes = await client.get(`/wp-json/wp/v2/anime?search=${encodeURIComponent(query)}&per_page=15`);
    if (Array.isArray(wpRes.data) && wpRes.data.length > 0) {
      return wpRes.data.map((item: any) => {
        const thumb =
          item.yoast_head_json?.og_image?.[0]?.url ||
          item.yoast_head_json?.schema?.['@graph']?.find((g: any) => g['@type'] === 'ImageObject')?.contentUrl ||
          '';

        return {
          id: item.id,
          title: decodeHtml(item.title?.rendered || ''),
          slug: item.slug,
          url: item.link || `${BASE_URL}/anime/${item.slug}/`,
          thumb: thumb,
          synopsis: cleanText(item.content?.rendered || item.yoast_head_json?.description || ''),
          type: 'Samehadaku',
          status: 'Available'
        };
      });
    }
  } catch (e: any) {
    console.warn('WP search fallback:', e.message);
  }

  try {
    const { data } = await client.get(`/?s=${encodeURIComponent(query)}`);
    const $ = cheerio.load(data);
    const results: SamehadakuItem[] = [];

    $('.listupd article.bs, .animposx').each((i, el) => {
      const a = $(el).find('a').first();
      const href = a.attr('href') || '';
      const title = a.attr('title') || $(el).find('.tt h2, .title').text().trim();
      const thumb = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';
      const status = $(el).find('.status, .bt .epx').text().trim();
      const type = $(el).find('.typez').text().trim();
      const slugMatch = href.match(/(?:anime\/|\/)([^/]+)\/?$/);
      const slug = slugMatch ? slugMatch[1] : `samehadaku-${i}`;

      if (href && title) {
        results.push({
          id: slug,
          title: decodeHtml(title),
          slug: slug,
          url: href,
          thumb: thumb,
          type: type || 'Samehadaku',
          status: status || 'Unknown'
        });
      }
    });

    return results;
  } catch (err: any) {
    console.error('Samehadaku search error:', err.message);
    return [];
  }
}

// 3. Detail Anime
export async function getSamehadakuDetail(slugOrUrl: string): Promise<SamehadakuDetail | null> {
  if (!slugOrUrl) return null;
  let targetUrl = slugOrUrl;
  let slug = slugOrUrl.replace(/^\/+|\/+$/g, '');

  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `${BASE_URL}/anime/${slug}/`;
  } else {
    const m = targetUrl.match(/(?:anime\/|\/)([^/]+)\/?$/);
    if (m) slug = m[1];
  }

  try {
    const { data } = await client.get(targetUrl);
    const $ = cheerio.load(data);

    const title = $('h1.entry-title, h1[itemprop="headline"]').text().trim();
    const thumb = $('.thumb img').attr('data-src') || $('.thumb img').attr('src') || '';
    const synopsis = cleanText($('.entry-content, .desc').text());
    const score = $('.rating strong, .numscore').first().text().trim();
    const status = $('.spe span:contains("Status")').text().replace(/Status:?/i, '').trim() || 'Ongoing';
    const type = $('.spe span:contains("Type")').text().replace(/Type:?/i, '').trim() || 'TV';

    const genres: string[] = [];
    $('.genre-info a, .infox .spe span a, .genxed a').each((i, el) => {
      const g = $(el).text().trim();
      if (g && !genres.includes(g)) genres.push(g);
    });

    const episodes: any[] = [];
    $('.eplister ul li a').each((i, el) => {
      const epUrl = $(el).attr('href') || '';
      const epNum = $(el).find('.epl-num').text().trim();
      const epTitle = $(el).find('.epl-title').text().trim();
      const epDate = $(el).find('.epl-date').text().trim();
      const epSlugMatch = epUrl.match(/\/([^/]+)\/?$/);
      const epSlug = epSlugMatch ? epSlugMatch[1] : '';

      if (epUrl) {
        episodes.push({
          episode: epNum || String(episodes.length + 1),
          title: decodeHtml(epTitle || title),
          url: epUrl,
          slug: epSlug,
          date: epDate || ''
        });
      }
    });

    return {
      title: decodeHtml(title),
      slug: slug,
      url: targetUrl,
      thumb: thumb,
      score: score || '8.5',
      status: status,
      type: type,
      genres: genres,
      synopsis: synopsis,
      totalEpisodes: episodes.length,
      episodes: episodes
    };
  } catch (err: any) {
    console.error('Samehadaku detail error:', err.message);
    return null;
  }
}

// 4. Episode Stream Extractor
export async function getSamehadakuEpisode(slugOrUrl: string): Promise<SamehadakuEpisodeStream | null> {
  if (!slugOrUrl) return null;
  let targetUrl = slugOrUrl;

  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    const slug = slugOrUrl.replace(/^\/+|\/+$/g, '');
    targetUrl = `${BASE_URL}/${slug}/`;
  }

  try {
    const { data } = await client.get(targetUrl);
    const $ = cheerio.load(data);

    const title = $('h1.entry-title, .title-section h1').text().trim();
    const servers: { server: string; url: string; embed?: string }[] = [];
    const downloads: { host: string; url: string }[] = [];

    $('.aspd-server-buttons button, button.aspd-server').each((i, el) => {
      const label = $(el).attr('data-label') || $(el).text().trim();
      const serverUrl = $(el).attr('data-url') || '';
      const embedBase64 = $(el).attr('data-embed') || '';
      let embed = '';
      if (embedBase64) {
        try {
          embed = Buffer.from(embedBase64, 'base64').toString('utf-8');
        } catch {
          embed = '';
        }
      }

      if (serverUrl || embed) {
        servers.push({
          server: label,
          url: serverUrl,
          embed: embed
        });
      }
    });

    const iframeSrc = $('.player-embed iframe').attr('data-litespeed-src') || $('.player-embed iframe').attr('src') || '';
    if (iframeSrc && iframeSrc !== 'about:blank' && !servers.some(s => s.url === iframeSrc)) {
      servers.unshift({
        server: 'Default Server',
        url: iframeSrc.trim()
      });
    }

    $('a[aria-label="Download"], a:contains("Download"), a[href*="mirrored.to"], a[href*="drive.google"], a[href*="mega.nz"], a[href*="gofile"]').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim() || 'Direct';
      if (href && !href.startsWith('#') && !downloads.some(d => d.url === href)) {
        downloads.push({
          host: text,
          url: href
        });
      }
    });

    return {
      title: decodeHtml(title),
      url: targetUrl,
      servers: servers,
      downloads: downloads
    };
  } catch (err: any) {
    console.error('Samehadaku episode error:', err.message);
    return null;
  }
}
