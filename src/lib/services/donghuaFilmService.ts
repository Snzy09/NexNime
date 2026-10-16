process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import axios from "axios";

export const BASE_URL = "https://donghuafilm.site";
export const API_BASE = "https://donghuafilm.site/hcgi/platform/api";
export const CREATOR = "IzzXd";
export const SALURAN = "https://whatsapp.com/channel/0029VbCv97v9Bb5tC5cZFl0K";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Referer: BASE_URL,
    Accept: "application/json",
  },
});

export interface DonghuaFilmItem {
  id: string;
  title: string;
  slug: string;
  type?: string;
  status?: string;
  rating?: number | string;
  genres?: string[] | string;
  release_day?: string;
  latest_episode?: number | string;
  cover?: string;
  poster?: string;
  synopsis?: string;
  url: string;
}

export interface DonghuaFilmEpisode {
  id: string;
  number: number;
  title: string;
  duration?: string;
  air_date?: string;
  source_type?: string;
  stream_url: string | null;
  download_url: string | null;
  embed_src: string | null;
  video_qualities?: any;
}

export interface DonghuaFilmDetail {
  id: string;
  title: string;
  slug: string;
  type?: string;
  status_anime?: string;
  rating?: number | string;
  genres?: string[] | string;
  release_day?: string;
  latest_episode?: number | string;
  cover?: string;
  poster?: string;
  synopsis?: string;
  url: string;
  total_episodes: number;
  episodes: DonghuaFilmEpisode[];
}

export interface DonghuaFilmDownload {
  id: string;
  title: string;
  slug: string;
  total_episodes: number;
  episodes: {
    episode: number;
    title: string;
    stream_url: string | null;
    download_url: string | null;
    embed_src: string | null;
  }[];
}

function extractIframeSrc(html?: string | null): string | null {
  if (!html) return null;
  const match = html.match(/src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export async function getDonghuaLatest(page = 1, perPage = 20) {
  try {
    const res = await client.get("/collections/animes/records", {
      params: {
        page,
        perPage,
        sort: "-updated",
      },
    });

    const items: DonghuaFilmItem[] = (res.data.items || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      type: item.type,
      status: item.status,
      rating: item.rating,
      genres: item.genres,
      release_day: item.release_day,
      latest_episode: item.latest_episode,
      cover: item.cover,
      poster: item.poster,
      synopsis: item.synopsis,
      url: `${BASE_URL}/anime/${item.slug}`,
    }));

    return {
      Creator: CREATOR,
      Saluran: SALURAN,
      status: true,
      page: res.data.page,
      perPage: res.data.perPage,
      totalItems: res.data.totalItems,
      totalPages: res.data.totalPages,
      results: items,
    };
  } catch (err: any) {
    return {
      Creator: CREATOR,
      Saluran: SALURAN,
      status: false,
      error: err.message,
      results: [],
    };
  }
}

export async function searchDonghua(keyword: string, page = 1, perPage = 20) {
  try {
    const safeK = keyword.replace(/['"\\]/g, "");
    const filter = `(title~'${safeK}' || slug~'${safeK}')`;
    const res = await client.get("/collections/animes/records", {
      params: {
        page,
        perPage,
        filter,
        sort: "-updated",
      },
    });

    const items: DonghuaFilmItem[] = (res.data.items || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      type: item.type,
      status: item.status,
      rating: item.rating,
      genres: item.genres,
      release_day: item.release_day,
      latest_episode: item.latest_episode,
      cover: item.cover,
      poster: item.poster,
      synopsis: item.synopsis,
      url: `${BASE_URL}/anime/${item.slug}`,
    }));

    return {
      Creator: CREATOR,
      Saluran: SALURAN,
      status: true,
      query: keyword,
      page: res.data.page,
      perPage: res.data.perPage,
      totalItems: res.data.totalItems,
      totalPages: res.data.totalPages,
      results: items,
    };
  } catch (err: any) {
    return {
      Creator: CREATOR,
      Saluran: SALURAN,
      status: false,
      error: err.message,
      results: [],
    };
  }
}

export async function getDonghuaDetail(target: string) {
  try {
    let identifier = target.trim();
    if (identifier.includes("/anime/")) {
      identifier = identifier.split("/anime/")[1].split("/")[0].split("?")[0];
    } else if (identifier.startsWith("http")) {
      const u = new URL(identifier);
      const parts = u.pathname.split("/").filter(Boolean);
      identifier = parts[parts.length - 1];
    }

    let anime: any = null;
    const isId = /^[a-z0-9]{15}$/.test(identifier);

    if (isId) {
      try {
        const r = await client.get(`/collections/animes/records/${identifier}`);
        anime = r.data;
      } catch (e) {}
    }

    if (!anime) {
      const r = await client.get("/collections/animes/records", {
        params: {
          filter: `(slug='${identifier}')`,
          perPage: 1,
        },
      });
      if (r.data.items && r.data.items.length > 0) {
        anime = r.data.items[0];
      }
    }

    if (!anime) {
      const r = await client.get("/collections/animes/records", {
        params: {
          filter: `(title~'${identifier}')`,
          perPage: 1,
        },
      });
      if (r.data.items && r.data.items.length > 0) {
        anime = r.data.items[0];
      }
    }

    if (!anime) {
      return {
        Creator: CREATOR,
        Saluran: SALURAN,
        status: false,
        error: `Anime '${target}' not found`,
      };
    }

    const epRes = await client.get("/collections/episodes/records", {
      params: {
        filter: `(anime='${anime.id}')`,
        sort: "-number",
        perPage: 500,
      },
    });

    const episodes: DonghuaFilmEpisode[] = (epRes.data.items || []).map((ep: any) => ({
      id: ep.id,
      number: ep.number,
      title: ep.title || `Episode ${ep.number}`,
      duration: ep.duration,
      air_date: ep.air_date,
      source_type: ep.source_type,
      stream_url: ep.video_url || null,
      download_url: ep.download_url || null,
      embed_src: extractIframeSrc(ep.embed_html),
      video_qualities: ep.video_qualities || null,
    }));

    return {
      Creator: CREATOR,
      Saluran: SALURAN,
      status: true,
      id: anime.id,
      title: anime.title,
      slug: anime.slug,
      type: anime.type,
      status_anime: anime.status,
      rating: anime.rating,
      genres: anime.genres,
      release_day: anime.release_day,
      latest_episode: anime.latest_episode,
      cover: anime.cover,
      poster: anime.poster,
      synopsis: anime.synopsis,
      url: `${BASE_URL}/anime/${anime.slug}`,
      total_episodes: episodes.length,
      episodes,
    };
  } catch (err: any) {
    return {
      Creator: CREATOR,
      Saluran: SALURAN,
      status: false,
      error: err.message,
    };
  }
}

export async function getDonghuaEpisode(target: string, epNumber: string | number) {
  try {
    const d: any = await getDonghuaDetail(target);
    if (!d.status) return d;

    const targetNum = parseInt(String(epNumber), 10);
    const found = (d.episodes || []).find((e: any) => e.number === targetNum);

    if (!found) {
      return {
        Creator: CREATOR,
        Saluran: SALURAN,
        status: false,
        error: `Episode ${epNumber} not found for ${d.title}`,
      };
    }

    return {
      Creator: CREATOR,
      Saluran: SALURAN,
      status: true,
      anime: {
        id: d.id,
        title: d.title,
        slug: d.slug,
        poster: d.poster,
        cover: d.cover,
        type: d.type,
      },
      episode: found,
      episodes: d.episodes,
    };
  } catch (err: any) {
    return {
      Creator: CREATOR,
      Saluran: SALURAN,
      status: false,
      error: err.message,
    };
  }
}

export async function getDonghuaDownload(target: string) {
  try {
    const d: any = await getDonghuaDetail(target);
    if (!d.status) return d;

    return {
      Creator: CREATOR,
      Saluran: SALURAN,
      status: true,
      id: d.id,
      title: d.title,
      slug: d.slug,
      total_episodes: d.total_episodes,
      episodes: (d.episodes || []).map((ep: any) => ({
        episode: ep.number,
        title: ep.title,
        stream_url: ep.stream_url,
        download_url: ep.download_url,
        embed_src: ep.embed_src,
      })),
    };
  } catch (err: any) {
    return {
      Creator: CREATOR,
      Saluran: SALURAN,
      status: false,
      error: err.message,
    };
  }
}
