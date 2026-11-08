/**
 * DramaBox Scraper Service
 * Source: https://gist.github.com/ayashiiiyo/8c5e75749843e55887bcf629c86119b0
 * Main provider for Drama category (Reels, Dracin, Short Drama 9:16)
 * Direct Next.js data route scraper with automatic buildId rotation
 */

const ORIGINS = ["https://www.dramaboxapp.com", "https://dramaboxapp.com"];
const CACHE_MS = 60_000;
let buildCache = { id: "", at: 0, origin: ORIGINS[0] };

export interface DramaBoxBook {
  bookId: string;
  title: string;
  titleEn: string;
  cover: string;
  intro: string;
  tags: string[];
  genres: string[];
  chapterCount: number;
  viewCount: number;
  viewCountDisplay?: string;
  followCount: number;
  rating: number | null;
  author: string;
  performers: any[];
  language: string;
  status?: string;
}

export interface DramaBoxEpisode {
  chapterId: string;
  index: number;
  indexStr: string;
  name: string;
  free: boolean;
  duration: number;
  price: number;
  cover: string;
  mp4: string | null;
  m3u8: string | null;
  url: string | null;
}

export interface DramaBoxDetail {
  lang: string;
  book: DramaBoxBook;
  totalEpisodes: number;
  freeEpisodes: number;
  episodes: DramaBoxEpisode[];
}

export interface DramaBoxGenre {
  id: number;
  name: string;
  slug: string;
}

function isBlock(status: number, body: string): boolean {
  return (
    status === 403 &&
    typeof body === "string" &&
    (body.includes("cloudfront") || body.includes("Request blocked") || body.includes("Access Denied"))
  );
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function fetchHttp(url: string): Promise<{ status: number; body: string }> {
  const res = await fetch(url, {
    headers: {
      "user-agent": UA,
      accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9,id;q=0.8",
    },
    signal: AbortSignal.timeout(20000),
    next: { revalidate: 60 },
  });
  const body = await res.text();
  return { status: res.status, body };
}

export async function getBuildId(): Promise<string> {
  const now = Date.now();
  if (buildCache.id && now - buildCache.at < CACHE_MS) {
    return buildCache.id;
  }

  let blocked = 0;
  for (const origin of ORIGINS) {
    try {
      const r = await fetchHttp(origin + "/");
      if (isBlock(r.status, r.body)) {
        blocked++;
        continue;
      }
      const m = r.body.match(/"buildId":"([^"]+)"/);
      if (m && m[1]) {
        buildCache = { id: m[1], at: now, origin };
        return m[1];
      }
    } catch {
      continue;
    }
  }

  if (blocked > 0) {
    throw new Error("CloudFront denied DramaBox access");
  }

  // Fallback to last known working buildId if extraction fails
  if (buildCache.id) return buildCache.id;
  return "dramaboxapp_prod_2026102801";
}

function normalizeLang(lang?: string): string {
  const v = String(lang || "en").trim().toLowerCase();
  // DramaBox web SSR is primarily indexed under 'en'
  if (v === "id" || v === "in" || v === "id-id") return "en";
  return /^[a-z]{2}(-[a-z]{2})?$/.test(v) ? v : "en";
}

async function fetchDramaBoxData(path: string, query?: Record<string, string | number>): Promise<any> {
  const qs = query
    ? "?" +
      new URLSearchParams(
        Object.entries(query)
          .filter(([, v]) => v !== undefined && v !== null && v !== "")
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : "";

  const clean = path.replace(/^\/+/, "");
  const b = await getBuildId();
  const origin = buildCache.origin || ORIGINS[0];
  const url = `${origin}/_next/data/${b}/${clean}.json${qs}`;

  let r = await fetchHttp(url);

  // If 404, buildId rotated. Refresh and retry once.
  if (r.status === 404) {
    buildCache.at = 0;
    const b2 = await getBuildId();
    const o2 = buildCache.origin || origin;
    const url2 = `${o2}/_next/data/${b2}/${clean}.json${qs}`;
    r = await fetchHttp(url2);
    if (r.status !== 200) {
      throw new Error(`DramaBox HTTP ${r.status} ${url2}`);
    }
  }

  if (isBlock(r.status, r.body)) {
    buildCache.at = 0;
    throw new Error("CloudFront denied DramaBox data request");
  }

  if (r.status !== 200) {
    throw new Error(`DramaBox HTTP ${r.status} ${url}`);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(r.body);
  } catch {
    throw new Error("Invalid JSON from DramaBox");
  }

  const pp = parsed?.pageProps || {};
  if (pp.__N_REDIRECT) {
    const redirectPath = String(pp.__N_REDIRECT).replace(/^\/+/, "").replace(/\.json$/, "");
    return fetchDramaBoxData(redirectPath);
  }
  return pp;
}

function parseBook(b: any): DramaBoxBook {
  return {
    bookId: String(b.bookId || b.originalBookId || ""),
    title: b.bookName || b.title || "",
    titleEn: b.bookNameEn || b.replacedBookName || "",
    cover: b.cover || b.coverWap || "",
    intro: b.introduction || b.intro || "",
    tags: Array.isArray(b.tags) ? b.tags : Array.isArray(b.labels) ? b.labels : [],
    genres: (b.typeTwoList || []).map((t: any) => t.name).filter(Boolean),
    chapterCount: Number(b.chapterCount || b.chapterNum || 0),
    viewCount: Number(b.viewCount || 0),
    viewCountDisplay: b.viewCountDisplay || (b.viewCount ? `${Math.round(b.viewCount / 1000)}K` : undefined),
    followCount: Number(b.followCount || 0),
    rating: b.ratings !== undefined && b.ratings !== null ? Number(b.ratings) : null,
    author: b.author || "DramaBox",
    performers: b.performerList || [],
    language: b.simpleLanguage || b.language || "en",
    status: b.lastUpdateTimeDisplay || b.status || "Completed",
  };
}

function parseEpisode(c: any, pos: number): DramaBoxEpisode {
  const free = c.unlock === true || c.chapterPrice === 0 || pos <= 5;
  const num = Number(c.indexStr || 0) || Number(c.index !== undefined ? c.index + 1 : pos);
  return {
    chapterId: String(c.id || ""),
    index: num,
    indexStr: c.indexStr || String(num).padStart(3, "0"),
    name: c.name || `Episode ${num}`,
    free,
    duration: Number(c.duration || 0),
    price: Number(c.chapterPrice || 0),
    cover: c.cover || "",
    mp4: c.mp4 || null,
    m3u8: c.m3u8Url || null,
    url: c.m3u8Url || c.mp4 || null,
  };
}

/**
 * DramaBox Home Page
 */
export async function getDramaBoxHome(lang = "en"): Promise<{
  featured: DramaBoxBook[];
  sections: { title: string; books: DramaBoxBook[] }[];
}> {
  const L = normalizeLang(lang);
  const pp = await fetchDramaBoxData(L);

  const big = (pp.bigList || []).filter((x: any) => x && typeof x === "object" && !Array.isArray(x));
  const small = Array.isArray(pp.smallData) ? pp.smallData : [];

  const sections = small
    .map((row: any) => ({
      title: row.name || "Drama Pilihan",
      books: (row.items || row.bookList || row.list || []).map(parseBook),
    }))
    .filter((s: any) => s.books.length > 0);

  return {
    featured: big.map(parseBook),
    sections,
  };
}

/**
 * DramaBox Browse / Category Page
 */
export async function getDramaBoxBrowse({
  lang = "en",
  genre = 0,
  page = 1,
}: {
  lang?: string;
  genre?: number;
  page?: number;
} = {}): Promise<{
  genre: number;
  genreName: string;
  page: number;
  totalPages: number;
  count: number;
  books: DramaBoxBook[];
  genres: DramaBoxGenre[];
}> {
  const L = normalizeLang(lang);
  const g = Number(genre) || 0;
  const p = Math.max(1, Number(page) || 1);
  const path = p === 1 ? `${L}/browse/${g}` : `${L}/browse/${g}/${p}`;

  const pp = await fetchDramaBoxData(path);
  const books = (pp.bookList || []).map(parseBook);

  const genres: DramaBoxGenre[] = (pp.types || [])
    .map((t: any) => ({
      id: Number(t.id),
      name: t.name,
      slug: t.replaceName || t.name.toLowerCase().replace(/\s+/g, "-"),
    }))
    .filter((t: DramaBoxGenre) => t.id >= 0);

  return {
    genre: Number(pp.typeTwoId || g),
    genreName: pp.typeTwoName || "All Drama",
    page: Number(pp.pageNo || p),
    totalPages: Number(pp.pages || 1),
    count: books.length,
    books,
    genres,
  };
}

/**
 * DramaBox Search
 */
export async function searchDramaBox(
  keyword: string,
  { lang = "en", page = 1 }: { lang?: string; page?: number } = {}
): Promise<{
  keyword: string;
  page: number;
  totalPages: number;
  total: number;
  books: DramaBoxBook[];
}> {
  const q = String(keyword || "").trim();
  if (!q) return { keyword: "", page: 1, totalPages: 0, total: 0, books: [] };

  const L = normalizeLang(lang);
  const p = Math.max(1, Number(page) || 1);
  const pp = await fetchDramaBoxData(`${L}/search`, { searchValue: q, page: p });
  const books = (pp.bookList || []).map(parseBook);

  return {
    keyword: pp.sValue || q,
    page: Number(pp.pageNo || p),
    totalPages: Number(pp.totalPage || 1),
    total: Number(pp.totalNum || books.length),
    books,
  };
}

/**
 * DramaBox Detail & Episodes
 */
export async function getDramaBoxDetail(
  bookId: string,
  lang = "en"
): Promise<DramaBoxDetail> {
  const id = String(bookId || "").trim();
  if (!id) throw new Error("DramaBox bookId required");

  const L = normalizeLang(lang);
  const pp = await fetchDramaBoxData(`${L}/film/${id}`);
  const info = pp.bookInfo || {};
  const chapters = (pp.chapterList || []).map((c: any, i: number) => parseEpisode(c, i + 1));

  return {
    lang: pp.locale || L,
    book: parseBook(info),
    totalEpisodes: chapters.length,
    freeEpisodes: chapters.filter((c: DramaBoxEpisode) => c.free).length,
    episodes: chapters,
  };
}

/**
 * DramaBox Stream for a specific episode
 */
export async function getDramaBoxStream({
  bookId,
  episode,
  lang = "en",
}: {
  bookId: string;
  episode: number | string;
  lang?: string;
}): Promise<{
  bookId: string;
  title: string;
  chapterId: string;
  index: number;
  name: string;
  free: boolean;
  duration: number;
  stream_url: string;
  mp4: string | null;
  m3u8: string | null;
  cover: string;
}> {
  const d = await getDramaBoxDetail(bookId, lang);
  const want = String(episode).trim();
  const asNum = Number(want);

  const ep =
    d.episodes.find((c) => c.chapterId === want) ||
    (Number.isFinite(asNum) ? d.episodes.find((c) => c.index === asNum) : undefined) ||
    d.episodes[0];

  if (!ep) {
    throw new Error("DramaBox episode not found");
  }

  // If already has direct signed stream URL
  let streamUrl = ep.m3u8 || ep.mp4 || "";

  // If locked or missing direct URL, query episode endpoint
  if (!streamUrl && ep.chapterId) {
    try {
      const L = normalizeLang(lang);
      const pp = await fetchDramaBoxData(`${L}/episode/${bookId}/${ep.chapterId}`);
      streamUrl = pp.freeSource || pp.currentUrl || pp.videoUrl || "";
      if (streamUrl) {
        ep.url = streamUrl;
        ep.mp4 = streamUrl;
      }
    } catch {
      // ignore
    }
  }

  return {
    bookId: d.book.bookId,
    title: d.book.title,
    chapterId: ep.chapterId,
    index: ep.index,
    name: ep.name,
    free: ep.free,
    duration: ep.duration,
    stream_url: streamUrl,
    mp4: ep.mp4 || streamUrl,
    m3u8: ep.m3u8 || (streamUrl.includes(".m3u8") ? streamUrl : null),
    cover: ep.cover || d.book.cover,
  };
}

/**
 * Normalized Dracin Item Transformer for NexNime compatibility
 */
export function toDracinItem(b: DramaBoxBook) {
  return {
    id: b.bookId,
    slug: b.bookId,
    title: b.title,
    image: b.cover,
    episodes: b.chapterCount || 40,
    views: b.viewCount || 15000,
    genres: b.genres.length > 0 ? b.genres : b.tags.length > 0 ? b.tags : ["Drama", "Reels"],
    description: b.intro,
    rating: b.rating,
    author: b.author,
    status: b.status,
    url: `/dracin/watch?provider=dramabox&id=${encodeURIComponent(b.bookId)}&title=${encodeURIComponent(b.title)}`,
    provider: "dramabox",
  };
}
