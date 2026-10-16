/**
 * MangaDex Scraper Types and Constants
 * Creator: IzzXd
 * Base: https://mangadex.org
 * Saluran: https://whatsapp.com/channel/0029VbCv97v9Bb5tC5cZFl0K
 */

export const CREATOR = "IzzXd";
export const SALURAN = "https://whatsapp.com/channel/0029VbCv97v9Bb5tC5cZFl0K";
export const BASE_URL = "https://mangadex.org";
export const API_BASE = "https://api.mangadex.org";

export interface MangaItem {
  id: string;
  title: string;
  status: string;
  year?: number;
  contentRating: string;
  tags: string[];
  coverUrl: string | null;
  url: string;
  synopsis?: string;
  author?: string;
  artist?: string;
  type?: "Manga" | "Manhwa" | "Manhua";
}

export interface MangaChapter {
  id: string;
  chapter: string;
  volume: string | null;
  title: string | null;
  pages: number;
  language: string;
  group: string | null;
  publishAt: string;
  url: string;
}

export interface MangaDetail {
  manga: MangaItem;
  totalChapters: number;
  chapters: MangaChapter[];
}

export interface ChapterPages {
  id: string;
  chapter: string;
  volume?: string | null;
  title: string | null;
  language: string;
  totalPages: number;
  mangaId: string | null;
  mangaTitle: string | null;
  images: {
    hq: { page: number; url: string }[];
    dataSaver: { page: number; url: string }[];
  };
}

export interface ChapterDownload {
  Creator: string;
  Saluran: string;
  chapter: {
    id: string;
    chapter: string;
    volume: string | null;
    title: string | null;
    language: string;
    totalPages: number;
    mangaId: string | null;
    mangaTitle: string | null;
    images: {
      hq: { page: number; url: string }[];
      dataSaver: { page: number; url: string }[];
    };
  };
}
