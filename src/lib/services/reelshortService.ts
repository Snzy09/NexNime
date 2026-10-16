// ReelShort Service - Live Scraper & Stream Extractor for ReelShort (https://www.reelshort.com)
// Creator: IzzXd, Integrated for Luoyiv Streaming Hub

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';
import * as zlib from 'zlib';

const BASE = 'https://www.reelshort.com';
const AES_KEY = Buffer.from('VvRSNGFynLBW7aCP', 'utf8');
const AES_IV = Buffer.from('gLn8sxqpzyNjehDP', 'utf8');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9'
};

export interface ReelShortStream {
  quality: string;
  dpi: number;
  codec: string;
  bitrate: string | null;
  stream_url: string;
}

export interface ReelShortItem {
  book_id: string;
  title: string;
  cover: string;
  description: string;
  share_text?: string | null;
  total_episodes?: number | null;
  read_count?: number | null;
  collect_count?: number | null;
  tags?: string[];
  movie_url: string;
}

export interface ReelShortDetail {
  status: boolean;
  book_id: string;
  title: string;
  sub_title?: string | null;
  cover: string;
  description: string;
  language: string;
  tags: string[];
  total_episodes: number;
  read_count?: number | null;
  collect_count?: number | null;
  sample_streams?: ReelShortStream[];
  episodes?: {
    episode: number;
    chapter_id: string;
    thumbnail: string;
    likes: number;
  }[];
  url: string;
}

export function decryptPlayInfo(playInfo: string): ReelShortStream[] {
  if (!playInfo || typeof playInfo !== 'string') return [];
  try {
    const decipher = crypto.createDecipheriv('aes-128-cbc', AES_KEY, AES_IV);
    let decrypted = decipher.update(playInfo, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    let jsonStr = decrypted;
    if (decrypted.startsWith('eJz') || decrypted.startsWith('eJw')) {
      const buf = Buffer.from(decrypted, 'base64');
      jsonStr = zlib.inflateSync(buf).toString('utf8');
    }

    const items = JSON.parse(jsonStr);
    if (!Array.isArray(items)) return [];

    const streams: ReelShortStream[] = items.map((item: any) => ({
      quality: `${item.Dpi}p (${item.Encode || "H264"})`,
      dpi: item.Dpi || 720,
      codec: item.Encode || "H264",
      bitrate: item.Bitrate ? `${item.Bitrate} kbps` : null,
      stream_url: item.PlayURL
    }));

    // Prioritize H264 for universal web playback, then sort by Dpi descending
    return streams.sort((a, b) => {
      const aIsH264 = a.codec.toUpperCase().includes("264");
      const bIsH264 = b.codec.toUpperCase().includes("264");
      if (aIsH264 && !bIsH264) return -1;
      if (!aIsH264 && bIsH264) return 1;
      return (b.dpi || 0) - (a.dpi || 0);
    });
  } catch (err: any) {
    console.error('ReelShort decrypt error:', err.message);
    return [];
  }
}

// 1. Search ReelShort
export async function searchReelShort(query: string, page = 1): Promise<{ total: number; results: ReelShortItem[] }> {
  try {
    const url = `${BASE}/search?keywords=${encodeURIComponent(query)}&page=${page}`;
    const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(res.data);
    const nextDataRaw = $('#__NEXT_DATA__').html();

    if (!nextDataRaw) {
      return { total: 0, results: [] };
    }

    const data = JSON.parse(nextDataRaw);
    const pageProps = data.props?.pageProps || {};
    const rawBooks = pageProps.books || [];

    const results: ReelShortItem[] = rawBooks.map((book: any) => ({
      book_id: book.book_id || book._id,
      title: book.book_title,
      cover: book.book_pic,
      description: book.special_desc,
      share_text: book.share_text || null,
      total_episodes: book.chapter_count || null,
      read_count: book.read_count || null,
      collect_count: book.collect_count || null,
      tags: book.tag || book.theme || [],
      movie_url: `${BASE}/movie/${book.book_id || book._id}`
    }));

    return {
      total: pageProps.total || results.length,
      results
    };
  } catch (err: any) {
    console.error('ReelShort search error:', err.message);
    return { total: 0, results: [] };
  }
}

// 2. Get Popular / Trending Short Dramas
export async function getPopularReelShort(category = 'Billionaire'): Promise<ReelShortItem[]> {
  const query = category || 'Billionaire';
  const data = await searchReelShort(query, 1);
  return data.results;
}

// 3. Get Detail & Extracted Video Streams
export async function getReelShortDetail(bookIdOrUrl: string): Promise<ReelShortDetail | null> {
  try {
    let bookId = bookIdOrUrl.trim();
    if (bookId.includes('/movie/')) {
      const slugPart = bookId.split('/movie/')[1].split(/[?#]/)[0];
      const parts = slugPart.split('-');
      bookId = parts[parts.length - 1];
    }

    const url = `${BASE}/movie/${bookId}`;
    const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(res.data);
    const nextDataRaw = $('#__NEXT_DATA__').html();

    if (!nextDataRaw) {
      return null;
    }

    const data = JSON.parse(nextDataRaw);
    const drama = data.props?.pageProps?.data || {};

    const streams = decryptPlayInfo(drama.start_play?.play_info);
    const episodes = (drama.online_base || []).map((ep: any) => ({
      episode: ep.serial_number,
      chapter_id: ep.chapter_id,
      thumbnail: ep.video_pic,
      likes: ep.like_count || 0
    }));

    const tags = (drama.tag_list || []).map((t: any) => t.tag_name).filter(Boolean);

    return {
      status: true,
      book_id: drama.book_id || bookId,
      title: drama.book_title,
      sub_title: drama.book_sub_title || null,
      cover: drama.book_pic,
      description: drama.special_desc,
      language: drama.lang || 'en',
      tags,
      total_episodes: drama.total || episodes.length,
      read_count: drama.read_count || null,
      collect_count: drama.collect_count || null,
      sample_streams: streams.length > 0 ? streams : undefined,
      episodes: episodes.length > 0 ? episodes : undefined,
      url
    };
  } catch (err: any) {
    console.error('ReelShort detail error:', err.message);
    return null;
  }
}
