// VidBox Service - Live Scraper for VidBox Film & Movies (https://vidbox.cx)
// Creator: IzzXd, Integrated for Luoyiv Streaming Hub

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://vidbox.cx';
const CREATOR = 'IzzXd';
const SALURAN = 'https://whatsapp.com/channel/0029VbCv97v9Bb5tC5cZFl0K';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': BASE_URL
  }
});

export interface VidboxItem {
  ref?: string | null;
  title: string;
  type: string;
  year?: string | null;
  rating?: string | null;
  poster: string;
  url: string;
  slug: string;
}

export interface VidboxDetail {
  status: boolean;
  type: 'Movie' | 'TVSeries';
  title: string;
  url: string;
  slug: string;
  poster: string | null;
  backdrop: string | null;
  synopsis: string | null;
  genres: string[];
  rating: string | null;
  release_date: string | null;
  duration?: string | null;
  director?: string | null;
  actors?: string[];
  servers?: { name: string; url: string }[];
  seasons?: {
    season: number;
    total_episodes: number;
    episodes: {
      episode: number;
      title: string;
      api_path: string;
    }[];
  }[];
}

function extractSlug(urlOrPath: string): string {
  const clean = urlOrPath.replace(BASE_URL, '').replace(/^\/+|\/+$/g, '');
  return clean;
}

// 1. Search VidBox
export async function searchVidbox(query: string, type = 'all'): Promise<VidboxItem[]> {
  try {
    const res = await client.get('/search', {
      params: { q: query, type }
    });
    const $ = cheerio.load(res.data);
    const results: VidboxItem[] = [];

    $('.vb-grid article.vb-tile').each((_, el) => {
      const link = $(el).find('a.vb-tile__link').attr('href') || '';
      const fullUrl = link.startsWith('http') ? link : BASE_URL + link;
      const title = $(el).find('.vb-tile__name').text().trim() || $(el).find('a.vb-tile__link').attr('title') || '';
      const year = $(el).find('.vb-tile__yr').text().trim() || null;
      const mediaType = $(el).find('.vb-tile__chip--type').text().trim() || (link.includes('/film/') ? 'Movie' : 'TV');
      const rating = $(el).find('.vb-tile__chip--rate').text().trim().replace(/\s+/g, ' ') || '8.0';
      let poster = $(el).find('img.vb-tile__img').attr('src') || '';
      if (poster && !poster.startsWith('http')) {
        poster = BASE_URL + poster;
      }
      const ref = $(el).attr('data-vbk-ref') || null;

      if (title && link) {
        results.push({
          ref,
          title,
          type: mediaType,
          year,
          rating,
          poster,
          url: fullUrl,
          slug: extractSlug(link)
        });
      }
    });

    return results;
  } catch (err: any) {
    console.error('VidBox search error:', err.message);
    return [];
  }
}

// 2. Get Popular / Latest Catalog from /all-movies or /series
export async function getVidboxCatalog(category: 'movies' | 'series' | 'all' = 'movies'): Promise<VidboxItem[]> {
  try {
    const endpoint = category === 'series' ? '/series' : '/all-movies';
    const res = await client.get(endpoint);
    const $ = cheerio.load(res.data);
    const results: VidboxItem[] = [];

    $('.vb-grid article.vb-tile, article.vb-tile').each((_, el) => {
      const link = $(el).find('a.vb-tile__link').attr('href') || '';
      const fullUrl = link.startsWith('http') ? link : BASE_URL + link;
      const title = $(el).find('.vb-tile__name').text().trim() || $(el).find('a.vb-tile__link').attr('title') || '';
      const year = $(el).find('.vb-tile__yr').text().trim() || '2024';
      const mediaType = $(el).find('.vb-tile__chip--type').text().trim() || (link.includes('/film/') ? 'Movie' : 'TV');
      const rating = $(el).find('.vb-tile__chip--rate').text().trim().replace(/\s+/g, ' ') || '8.5';
      let poster = $(el).find('img.vb-tile__img').attr('src') || '';
      if (poster && !poster.startsWith('http')) {
        poster = BASE_URL + poster;
      }
      const ref = $(el).attr('data-vbk-ref') || null;

      if (title && link && results.length < 36) {
        results.push({
          ref,
          title,
          type: mediaType,
          year,
          rating,
          poster,
          url: fullUrl,
          slug: extractSlug(link)
        });
      }
    });

    return results;
  } catch (err: any) {
    console.error('VidBox catalog error:', err.message);
    return [];
  }
}

// 3. Detail Film or Series
export async function getVidboxDetail(target: string): Promise<VidboxDetail | null> {
  try {
    let path = target;
    if (path.startsWith(BASE_URL)) {
      path = path.slice(BASE_URL.length);
    } else if (path.startsWith('http')) {
      const u = new URL(path);
      path = u.pathname;
    }
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    const res = await client.get(path);
    const $ = cheerio.load(res.data);

    let schema: any = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const j = JSON.parse($(el).html() || '{}');
        if (j['@type'] === 'Movie' || j['@type'] === 'TVSeries') {
          schema = j;
        }
      } catch (e) {}
    });

    const isMovie = path.includes('/film/');
    const title = $('h1.vb-mv__title').text().trim() || (schema && schema.name) || $('title').text().split('-')[0].trim();
    const synopsis = $('.vb-mv__overview').text().trim() || (schema && schema.description) || 'Sinopsis resmi dari katalog streaming VidBox.';
    let poster = $('.vb-mv__poster img').attr('src') || (schema && schema.image && schema.image.url) || null;
    if (poster && !poster.startsWith('http')) {
      poster = BASE_URL + poster;
    }
    let backdrop = $('.vb-mv__back img').attr('src') || null;
    if (backdrop && !backdrop.startsWith('http')) {
      backdrop = BASE_URL + backdrop;
    }

    const genres: string[] = [];
    $('.vb-mv__genres a').each((_, el) => {
      const g = $(el).text().trim();
      if (g) genres.push(g);
    });

    const info: VidboxDetail = {
      status: true,
      type: isMovie ? 'Movie' : 'TVSeries',
      title,
      url: BASE_URL + path,
      slug: extractSlug(path),
      poster,
      backdrop,
      synopsis,
      genres: genres.length > 0 ? genres : (schema && schema.genre) || ['Film'],
      rating: (schema && schema.aggregateRating && schema.aggregateRating.ratingValue) || $('.vb-mv__rate').text().trim() || '8.5',
      release_date: (schema && schema.datePublished) || $('.vb-mv__meta time').text().trim() || '2024',
      duration: (schema && schema.duration) || null,
      director: (schema && schema.director && schema.director.name) || null,
      actors: schema && Array.isArray(schema.actor) ? schema.actor.map((a: any) => a.name) : []
    };

    if (isMovie) {
      const servers: { name: string; url: string }[] = [];
      $('.vb-player__tabs .vb-srv').each((_, el) => {
        const name = $(el).attr('data-name') || $(el).text().trim();
        const url = $(el).attr('data-url');
        if (url) {
          servers.push({ name, url });
        }
      });

      // Default iframe fallback if present
      const iframeSrc = $('.vb-player iframe').attr('src') || '';
      if (iframeSrc && !servers.some(s => s.url === iframeSrc)) {
        servers.unshift({ name: 'Default HD', url: iframeSrc });
      }

      info.servers = servers;
    } else {
      const seasons: any[] = [];
      const seasonSections = $('.vb-eps__grid');
      seasonSections.each((_, sec) => {
        const seasonNum = parseInt($(sec).attr('data-season') || '1', 10);
        const episodes: any[] = [];
        $(sec).find('.vb-epc').each((_, epBtn) => {
          const epNum = parseInt($(epBtn).attr('data-episode') || '1', 10);
          const epTitle = $(epBtn).attr('title') || $(epBtn).find('.vb-epc__name').text().trim() || `Episode ${epNum}`;
          const epUrl = $(epBtn).attr('data-episode-url') || '';
          episodes.push({
            episode: epNum,
            title: epTitle,
            api_path: epUrl
          });
        });
        if (episodes.length > 0) {
          seasons.push({
            season: seasonNum,
            total_episodes: episodes.length,
            episodes
          });
        }
      });
      info.seasons = seasons;
    }

    return info;
  } catch (err: any) {
    console.error('VidBox detail error:', err.message);
    return null;
  }
}

// 4. TV Episode Stream Fetcher
export async function getVidboxEpisode(target: string, season: string | number, ep: string | number) {
  try {
    let slug = target;
    if (slug.includes('/show/')) {
      const parts = slug.split('/show/')[1].split('/')[0].split('-');
      slug = parts[0];
    } else if (slug.includes('/tv/')) {
      const parts = slug.split('/tv/')[1].split('/');
      slug = parts[0];
    }

    const epPath = `/tv/${slug}/episode/${season}/${ep}`;
    const res = await client.get(epPath, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
      }
    });

    return {
      status: true,
      data: res.data
    };
  } catch (err: any) {
    return {
      status: false,
      error: err.message
    };
  }
}
