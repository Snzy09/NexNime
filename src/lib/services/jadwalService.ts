/**
 * Unified Multi-Category Schedule Service
 * Categories: Anime, Donghua, Dracin, Drakor, Manga
 */

import { getAnimeSchedule } from "./animeService";
import { REAL_SCHEDULE } from "./realDataFallback";
import { getAnichinJadwal } from "./anichinService";

export type ScheduleCategory = "anime" | "donghua" | "dracin" | "drakor" | "manga";

export interface UnifiedScheduleItem {
  id: string;
  title: string;
  slug: string;
  href: string; // Link to internal player / detail page
  poster: string;
  category: ScheduleCategory;
  categoryLabel: string;
  episode: string;
  score: string;
  day: "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu" | "minggu";
  dayLabel: string;
  time?: string;
  genres?: string[];
  status?: string;
}

export interface DaySchedule {
  day: "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu" | "minggu";
  label: string;
  shortLabel: string;
  isToday: boolean;
  totalCount: number;
  counts: Record<ScheduleCategory, number>;
  items: UnifiedScheduleItem[];
}

export const DAYS_ORDER: ("senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu" | "minggu")[] = [
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
  "minggu",
];

export const DAY_LABELS: Record<string, string> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
  minggu: "Minggu",
};

/**
 * Real Donghua poster dictionary mapped to authentic Anichin media uploads
 */
export const DONGHUA_REAL_POSTERS: Record<string, string> = {
  "renegade-immortal": "https://anichin.moe/wp-content/uploads/2023/09/RENEGADE-IMMORTAL-SUBTITLE-INDONESIA-3.webp",
  "xian-ni": "https://anichin.moe/wp-content/uploads/2023/09/RENEGADE-IMMORTAL-SUBTITLE-INDONESIA-3.webp",
  "apotheosis": "https://anichin.moe/wp-content/uploads/2022/11/Apotheosis-Episode-105-Subtitle-Indonesia.webp",
  "bai-lian-cheng-shen": "https://anichin.moe/wp-content/uploads/2022/11/Apotheosis-Episode-105-Subtitle-Indonesia.webp",
  "a-will-eternal": "https://anichin.moe/wp-content/uploads/2025/03/Yi-Nian-Yong-Heng-Season-3-Subtitle-Indonesia.webp",
  "yi-nian-yong-heng": "https://anichin.moe/wp-content/uploads/2025/03/Yi-Nian-Yong-Heng-Season-3-Subtitle-Indonesia.webp",
  "swallowed-star": "https://anichin.moe/wp-content/uploads/2020/11/Swallowed-Star-Subtitle-Indonesia.webp",
  "tunshi-xingkong": "https://anichin.moe/wp-content/uploads/2020/11/Swallowed-Star-Subtitle-Indonesia.webp",
  "perfect-world": "https://anichin.moe/wp-content/uploads/2021/01/Perfect-World-Subtitle-Indonesia-4.webp",
  "wanmei-shijie": "https://anichin.moe/wp-content/uploads/2021/01/Perfect-World-Subtitle-Indonesia-4.webp",
  "soul-land": "https://anichin.moe/wp-content/uploads/2023/06/Soul-Land-2-The-Unrivaled-Tang-Sect-1.webp",
  "battle-through-the-heavens": "https://anichin.moe/wp-content/uploads/2026/07/BTTH-SUBTITLE-INDONESIA.webp",
  "btth": "https://anichin.moe/wp-content/uploads/2026/07/BTTH-SUBTITLE-INDONESIA.webp",
  "shrouding-the-heavens": "https://anichin.moe/wp-content/uploads/2023/05/Shrouding-the-Heavens-Subtitle-Indonesia-3-768x1077.webp",
  "zhe-tian": "https://anichin.moe/wp-content/uploads/2023/05/Shrouding-the-Heavens-Subtitle-Indonesia-3-768x1077.webp",
  "against-the-gods": "https://anichin.moe/wp-content/uploads/2026/04/Against-the-Gods-Nian-Fan-Subtitle-Indonesia.webp",
  "jade-dynasty": "https://anichin.moe/wp-content/uploads/2022/08/Jade-Dynasty-Season-4-Subtitle-Indonesia-768x1077.webp",
  "zhu-xian": "https://anichin.moe/wp-content/uploads/2022/08/Jade-Dynasty-Season-4-Subtitle-Indonesia-768x1077.webp",
  "martial-universe": "https://anichin.moe/wp-content/uploads/2025/11/WU-DONG-QIAN-KUN-SEASON-6-SUBTTLE-INDONESIA.webp",
  "wu-dong-qian-kun": "https://anichin.moe/wp-content/uploads/2025/11/WU-DONG-QIAN-KUN-SEASON-6-SUBTTLE-INDONESIA.webp",
  "the-great-ruler": "https://anichin.moe/wp-content/uploads/2023/06/The-Great-Ruler-3D-Subtitle-Indonesia.webp",
  "martial-master": "https://anichin.moe/wp-content/uploads/2026/07/MARTIAL-MASTER-SUBTITLE-INDONESIA.webp",
  "wu-shen-zhu-zai": "https://anichin.moe/wp-content/uploads/2026/07/MARTIAL-MASTER-SUBTITLE-INDONESIA.webp",
  "tales-of-demons-and-gods": "https://anichin.moe/wp-content/uploads/2026/07/Tales-of-Demons-and-Gods-Season-10-Subtitle-Indonesia.webp",
  "yao-shen-ji": "https://anichin.moe/wp-content/uploads/2026/07/Tales-of-Demons-and-Gods-Season-10-Subtitle-Indonesia.webp",
  "supreme-god-emperor": "https://anichin.moe/wp-content/uploads/2026/07/Supreme-God-Emperor-Subtitle-Indonesia.webp",
  "100-000-years-of-refining-qi": "https://anichin.moe/wp-content/uploads/2023/02/100.000-Years-of-Refining-Qi-1.jpg",
  "tomb-of-fallen-gods": "https://anichin.moe/wp-content/uploads/2025/08/Tomb-of-Fallen-Gods-Season-3-Subtitle-Indonesia.webp",
  "tales-of-herding-god": "https://anichin.moe/wp-content/uploads/2024/10/converted-107.webp",
  "lord-of-the-ancient-god-grave": "https://anichin.moe/wp-content/uploads/2026/07/WAN-JIE-DU-ZUN-SUBTITLE-INDONESIA.webp",
  "lord-of-ancient-god-grave": "https://anichin.moe/wp-content/uploads/2026/07/WAN-JIE-DU-ZUN-SUBTITLE-INDONESIA.webp",
  "wan-jie-du-zun": "https://anichin.moe/wp-content/uploads/2026/07/WAN-JIE-DU-ZUN-SUBTITLE-INDONESIA.webp",
  "wan-jie-xian-zong": "https://anichin.moe/wp-content/uploads/2021/07/Against.webp",
  "immortality": "https://anichin.moe/wp-content/uploads/2025/12/IMMORTALITY-SEASON-5-SUBTITLE-INDONESIA.webp",
  "coiling-dragon": "https://anichin.moe/wp-content/uploads/2026/04/converted-9.webp",
  "purple-river": "https://anichin.moe/wp-content/uploads/2025/07/Purple-River-Season-2-Subtitle-Indonesia.webp",
  "in-search-of-gods": "https://anichin.moe/wp-content/uploads/2026/03/photo_2026-03-25_08-28-26.webp",
  "gu-an": "https://anichin.moe/wp-content/uploads/2024/10/converted-107.webp",
  "peak-of-true-martial-arts": "https://anichin.moe/wp-content/uploads/2026/07/WAN-JIE-DU-ZUN-SUBTITLE-INDONESIA.webp",
  "beyond-times-gaze": "https://anichin.moe/wp-content/uploads/2025/12/IMMORTALITY-SEASON-5-SUBTITLE-INDONESIA.webp",
};

export function getDonghuaPoster(titleOrSlug: string): string {
  const clean = (titleOrSlug || "")
    .toLowerCase()
    .replace(/^\[svip\]\s*/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  for (const [key, poster] of Object.entries(DONGHUA_REAL_POSTERS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return poster;
    }
  }
  return "https://anichin.moe/wp-content/uploads/2023/09/RENEGADE-IMMORTAL-SUBTITLE-INDONESIA-3.webp";
}

/**
 * Curated real schedule for Donghua (Chinese Animation)
 * Matches real weekly streaming releases in China / Indo subs
 */
const CURATED_DONGHUA_SCHEDULE: Omit<UnifiedScheduleItem, "category" | "categoryLabel">[] = [
  // SENIN
  {
    id: "donghua-lord-of-ancient-god-grave",
    title: "Lord of Ancient God Grave",
    slug: "lord-of-ancient-god-grave",
    href: "/anichin/watch?slug=lord-of-the-ancient-god-grave",
    poster: "https://anichin.moe/wp-content/uploads/2026/07/WAN-JIE-DU-ZUN-SUBTITLE-INDONESIA.webp",
    episode: "Ep 480",
    score: "9.2",
    day: "senin",
    dayLabel: "Senin",
    time: "10:00 WIB",
    genres: ["Cultivation", "Action", "Fantasy"],
  },
  {
    id: "donghua-wan-jie-xian-zong",
    title: "Wan Jie Xian Zong (Wonderland)",
    slug: "wan-jie-xian-zong",
    href: "/anichin/watch?slug=wan-jie-xian-zong",
    poster: "https://anichin.moe/wp-content/uploads/2021/07/Against.webp",
    episode: "Ep 360",
    score: "8.9",
    day: "senin",
    dayLabel: "Senin",
    time: "11:00 WIB",
    genres: ["Cultivation", "Harem", "Martial Arts"],
  },
  {
    id: "donghua-wu-shen-zhu-zai",
    title: "Martial Master (Wu Shen Zhu Zai)",
    slug: "wu-shen-zhu-zai",
    href: "/anichin/watch?slug=martial-master",
    poster: "https://anichin.moe/wp-content/uploads/2026/07/MARTIAL-MASTER-SUBTITLE-INDONESIA.webp",
    episode: "Ep 490",
    score: "9.4",
    day: "senin",
    dayLabel: "Senin",
    time: "10:30 WIB",
    genres: ["Action", "Martial Arts", "Reincarnation"],
  },

  // SELASA
  {
    id: "donghua-swallowed-star",
    title: "Swallowed Star (Tunshi Xingkong)",
    slug: "swallowed-star",
    href: "/anichin/watch?slug=swallowed-star",
    poster: "https://anichin.moe/wp-content/uploads/2020/11/Swallowed-Star-Subtitle-Indonesia.webp",
    episode: "Ep 239",
    score: "9.6",
    day: "selasa",
    dayLabel: "Selasa",
    time: "09:00 WIB",
    genres: ["Sci-Fi", "Cultivation", "Action"],
  },
  {
    id: "donghua-gu-an",
    title: "Gu An (One Slash to the Heavens)",
    slug: "gu-an",
    href: "/anichin/watch?slug=gu-an",
    poster: "https://anichin.moe/wp-content/uploads/2024/10/converted-107.webp",
    episode: "Ep 8",
    score: "9.1",
    day: "selasa",
    dayLabel: "Selasa",
    time: "10:00 WIB",
    genres: ["Action", "Fantasy", "Historical"],
  },
  {
    id: "donghua-peak-of-true-martial-arts",
    title: "Peak of True Martial Arts (Zhen Wu Dianfeng)",
    slug: "peak-of-true-martial-arts",
    href: "/anichin/watch?slug=peak-of-true-martial-arts",
    poster: "https://anichin.moe/wp-content/uploads/2026/07/WAN-JIE-DU-ZUN-SUBTITLE-INDONESIA.webp",
    episode: "Ep 160",
    score: "8.8",
    day: "selasa",
    dayLabel: "Selasa",
    time: "11:00 WIB",
    genres: ["Cultivation", "Action"],
  },

  // RABU
  {
    id: "donghua-shrouding-the-heavens",
    title: "Shrouding the Heavens (Zhe Tian)",
    slug: "shrouding-the-heavens",
    href: "/anichin/watch?slug=shrounding-the-heavens",
    poster: "https://anichin.moe/wp-content/uploads/2023/05/Shrouding-the-Heavens-Subtitle-Indonesia-3-768x1077.webp",
    episode: "Ep 179",
    score: "9.5",
    day: "rabu",
    dayLabel: "Rabu",
    time: "09:00 WIB",
    genres: ["Action", "Fantasy", "Cultivation"],
  },
  {
    id: "donghua-against-the-gods",
    title: "Against the Gods (Ni Tian Xie Shen)",
    slug: "against-the-gods",
    href: "/anichin/watch?slug=against-the-gods",
    poster: "https://anichin.moe/wp-content/uploads/2026/04/Against-the-Gods-Nian-Fan-Subtitle-Indonesia.webp",
    episode: "Ep 65",
    score: "9.3",
    day: "rabu",
    dayLabel: "Rabu",
    time: "10:30 WIB",
    genres: ["Action", "Martial Arts", "Romance"],
  },
  {
    id: "donghua-ten-thousand-worlds",
    title: "Ten Thousand Worlds (Wan Jie Du Zun)",
    slug: "ten-thousand-worlds",
    href: "/anichin/watch?slug=lord-of-the-ancient-god-grave",
    poster: "https://anichin.moe/wp-content/uploads/2026/07/WAN-JIE-DU-ZUN-SUBTITLE-INDONESIA.webp",
    episode: "Ep 280",
    score: "8.7",
    day: "rabu",
    dayLabel: "Rabu",
    time: "11:00 WIB",
    genres: ["Cultivation", "Adventure"],
  },

  // KAMIS
  {
    id: "donghua-jade-dynasty",
    title: "Jade Dynasty Season 4 (Zhu Xian)",
    slug: "jade-dynasty",
    href: "/anichin/watch?slug=jade-dynasty",
    poster: "https://anichin.moe/wp-content/uploads/2022/08/Jade-Dynasty-Season-4-Subtitle-Indonesia-768x1077.webp",
    episode: "Ep 5",
    score: "9.5",
    day: "kamis",
    dayLabel: "Kamis",
    time: "09:00 WIB",
    genres: ["Cultivation", "Drama", "Romance"],
  },
  {
    id: "donghua-tomb-of-fallen-gods",
    title: "Tomb of Fallen Gods (Shen Mu)",
    slug: "tomb-of-fallen-gods",
    href: "/anichin/watch?slug=tomb-of-fallen-gods-season-3",
    poster: "https://anichin.moe/wp-content/uploads/2025/08/Tomb-of-Fallen-Gods-Season-3-Subtitle-Indonesia.webp",
    episode: "Ep 42",
    score: "9.0",
    day: "kamis",
    dayLabel: "Kamis",
    time: "10:00 WIB",
    genres: ["Action", "Mystery", "Cultivation"],
  },
  {
    id: "donghua-martial-universe",
    title: "Martial Universe Season 5 (Wu Dong Qian Kun)",
    slug: "martial-universe",
    href: "/anichin/watch?slug=martial-universe",
    poster: "https://anichin.moe/wp-content/uploads/2025/11/WU-DONG-QIAN-KUN-SEASON-6-SUBTTLE-INDONESIA.webp",
    episode: "Ep 18",
    score: "9.4",
    day: "kamis",
    dayLabel: "Kamis",
    time: "11:00 WIB",
    genres: ["Action", "Martial Arts", "Adventure"],
  },

  // JUMAT
  {
    id: "donghua-perfect-world",
    title: "Perfect World (Wanmei Shijie)",
    slug: "perfect-world",
    href: "/anichin/watch?slug=perfect-world-wanmei-shijie",
    poster: "https://anichin.moe/wp-content/uploads/2021/01/Perfect-World-Subtitle-Indonesia-4.webp",
    episode: "Ep 285",
    score: "9.7",
    day: "jumat",
    dayLabel: "Jumat",
    time: "09:00 WIB",
    genres: ["Action", "Cultivation", "Fantasy"],
  },
  {
    id: "donghua-soul-land-2",
    title: "Soul Land 2: The Peerless Tang Clan",
    slug: "soul-land-2",
    href: "/anichin/watch?slug=soul-land-2-the-unrivaled-tang-sect",
    poster: "https://anichin.moe/wp-content/uploads/2023/06/Soul-Land-2-The-Unrivaled-Tang-Sect-1.webp",
    episode: "Ep 169",
    score: "9.6",
    day: "jumat",
    dayLabel: "Jumat",
    time: "09:30 WIB",
    genres: ["Action", "School", "Romance"],
  },
  {
    id: "donghua-the-great-ruler",
    title: "The Great Ruler (Da Zhu Zai)",
    slug: "the-great-ruler",
    href: "/anichin/watch?slug=the-great-ruler-3d",
    poster: "https://anichin.moe/wp-content/uploads/2023/06/The-Great-Ruler-3D-Subtitle-Indonesia.webp",
    episode: "Ep 89",
    score: "9.3",
    day: "jumat",
    dayLabel: "Jumat",
    time: "10:30 WIB",
    genres: ["Cultivation", "Action", "Romance"],
  },

  // SABTU
  {
    id: "donghua-btth",
    title: "Battle Through the Heavens (BTTH S5)",
    slug: "battle-through-the-heavens",
    href: "/anichin/watch?slug=oyen-pertempuran-akhir-sekte-misty-cloud",
    poster: "https://anichin.moe/wp-content/uploads/2026/07/BTTH-SUBTITLE-INDONESIA.webp",
    episode: "Ep 209",
    score: "9.8",
    day: "sabtu",
    dayLabel: "Sabtu",
    time: "09:00 WIB",
    genres: ["Cultivation", "Action", "Adventure"],
  },
  {
    id: "donghua-tales-of-demons-and-gods",
    title: "Tales of Demons and Gods (Yao Shen Ji)",
    slug: "tales-of-demons-and-gods",
    href: "/anichin/watch?slug=tales-of-demons-and-gods",
    poster: "https://anichin.moe/wp-content/uploads/2026/07/Tales-of-Demons-and-Gods-Season-10-Subtitle-Indonesia.webp",
    episode: "Ep 310",
    score: "8.9",
    day: "sabtu",
    dayLabel: "Sabtu",
    time: "10:00 WIB",
    genres: ["Action", "Fantasy", "Reincarnation"],
  },

  // MINGGU
  {
    id: "donghua-renegade-immortal",
    title: "Renegade Immortal (Xian Ni)",
    slug: "renegade-immortal",
    href: "/anichin/watch?slug=renegade-immortal",
    poster: "https://anichin.moe/wp-content/uploads/2023/09/RENEGADE-IMMORTAL-SUBTITLE-INDONESIA-3.webp",
    episode: "Ep 159",
    score: "9.8",
    day: "minggu",
    dayLabel: "Minggu",
    time: "09:00 WIB",
    genres: ["Dark Fantasy", "Cultivation", "Action"],
  },
  {
    id: "donghua-apotheosis",
    title: "Apotheosis (Bai Lian Cheng Shen)",
    slug: "apotheosis",
    href: "/anichin/watch?slug=apotheosis",
    poster: "https://anichin.moe/wp-content/uploads/2022/11/Apotheosis-Episode-105-Subtitle-Indonesia.webp",
    episode: "Ep 125",
    score: "9.2",
    day: "minggu",
    dayLabel: "Minggu",
    time: "10:00 WIB",
    genres: ["Cultivation", "Action", "Martial Arts"],
  },
  {
    id: "donghua-a-will-eternal",
    title: "A Will Eternal Season 3 (Yi Nian Yong Heng)",
    slug: "a-will-eternal",
    href: "/anichin/watch?slug=a-will-eternal",
    poster: "https://anichin.moe/wp-content/uploads/2025/03/Yi-Nian-Yong-Heng-Season-3-Subtitle-Indonesia.webp",
    episode: "Ep 30",
    score: "9.4",
    day: "minggu",
    dayLabel: "Minggu",
    time: "10:30 WIB",
    genres: ["Comedy", "Cultivation", "Action"],
  },
];

/**
 * Curated real schedule for Dracin (Short Chinese Mini-Drama)
 */
const CURATED_DRACIN_SCHEDULE: Omit<UnifiedScheduleItem, "category" | "categoryLabel">[] = [
  // SENIN
  {
    id: "dracin-level-one-loser",
    title: "Level One Loser, Maxxx Level Lover",
    slug: "level-one-loser-maxxx-level-lover",
    href: "/dracin/watch?slug=level-one-loser-maxxx-level-lover",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/42000027421/poster.jpg",
    episode: "Ep 80",
    score: "9.6",
    day: "senin",
    dayLabel: "Senin",
    time: "12:00 WIB",
    genres: ["Action", "Cultivation", "Revenge"],
  },
  {
    id: "dracin-telur-naga",
    title: "Telur Naga Tertinggi di Tangannya",
    slug: "telur-naga-tertinggi-di-tangannya",
    href: "/dracin/watch?slug=telur-naga-tertinggi-di-tangannya",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/2109837674644131841/poster.jpg",
    episode: "Ep 75",
    score: "9.2",
    day: "senin",
    dayLabel: "Senin",
    time: "18:00 WIB",
    genres: ["Urban", "Billionaire", "Martial Arts"],
  },

  // SELASA
  {
    id: "dracin-misi-satu-jam",
    title: "Misi Satu Jam Gadis Kelinci",
    slug: "misi-satu-jam-gadis-kelinci",
    href: "/dracin/watch?slug=misi-satu-jam-gadis-kelinci",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/2109582593273249794/poster.jpg",
    episode: "Ep 90",
    score: "9.5",
    day: "selasa",
    dayLabel: "Selasa",
    time: "12:00 WIB",
    genres: ["Romance", "Urban", "Comedy"],
  },
  {
    id: "dracin-berkat-sukubus",
    title: "Berkat dari Sukubus",
    slug: "berkat-dari-sukubus",
    href: "/dracin/watch?slug=berkat-dari-sukubus",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/2110214361115176961/poster.jpg",
    episode: "Ep 65",
    score: "9.1",
    day: "selasa",
    dayLabel: "Selasa",
    time: "18:00 WIB",
    genres: ["Fantasy", "Romance", "Urban"],
  },

  // RABU
  {
    id: "dracin-pelayan-sakti",
    title: "Pelayan Sakti dan Empat Pelamarnya",
    slug: "pelayan-sakti-dan-empat-pelamarnya",
    href: "/dracin/watch?slug=pelayan-sakti-dan-empat-pelamarnya",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/2109561362549452801/poster.jpg",
    episode: "Ep 85",
    score: "9.3",
    day: "rabu",
    dayLabel: "Rabu",
    time: "12:00 WIB",
    genres: ["Comedy", "Action", "Family"],
  },
  {
    id: "dracin-monsterku-berevolusi",
    title: "Monsterku Berevolusi Tanpa Batas",
    slug: "monsterku-berevolusi-tanpa-batas",
    href: "/dracin/watch?slug=monsterku-berevolusi-tanpa-batas",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/2109832045611331586/poster.jpg",
    episode: "Ep 70",
    score: "9.0",
    day: "rabu",
    dayLabel: "Rabu",
    time: "18:00 WIB",
    genres: ["Action", "Martial Arts", "Cultivation"],
  },

  // KAMIS
  {
    id: "dracin-kemarahan-penyihir",
    title: "Kemarahan Penyihir Cilik",
    slug: "kemarahan-penyihir-cilik",
    href: "/dracin/watch?slug=kemarahan-penyihir-cilik",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/2109211609248710657/poster.jpg",
    episode: "Ep 65",
    score: "9.4",
    day: "kamis",
    dayLabel: "Kamis",
    time: "12:00 WIB",
    genres: ["Romance", "Boss", "Revenge"],
  },
  {
    id: "dracin-anak-buangan",
    title: "Anak Buangan Bangkit Jadi Raja Sihir",
    slug: "anak-buangan-bangkit-jadi-raja-sihir",
    href: "/dracin/watch?slug=anak-buangan-bangkit-jadi-raja-sihir",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/2109099193781338113/poster.jpg",
    episode: "Ep 60",
    score: "9.1",
    day: "kamis",
    dayLabel: "Kamis",
    time: "18:00 WIB",
    genres: ["Action", "Mystery", "Urban"],
  },

  // JUMAT
  {
    id: "dracin-dewa-perang-mafia",
    title: "Dewa Perang Hancurkan Mafia",
    slug: "dewa-perang-hancurkan-mafia",
    href: "/dracin/watch?slug=dewa-perang-hancurkan-mafia",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/2110278458095624193/poster.jpg",
    episode: "Ep 70",
    score: "9.7",
    day: "jumat",
    dayLabel: "Jumat",
    time: "12:00 WIB",
    genres: ["Action", "Cultivation", "Overpowered"],
  },
  {
    id: "dracin-dunia-hewan",
    title: "Dunia Hewan Dengarkan Dia",
    slug: "dunia-hewan-dengarkan-dia",
    href: "/dracin/watch?slug=dunia-hewan-dengarkan-dia",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/2109839004343353346/poster.jpg",
    episode: "Ep 55",
    score: "9.2",
    day: "jumat",
    dayLabel: "Jumat",
    time: "18:00 WIB",
    genres: ["Romance", "Comedy", "Urban"],
  },

  // SABTU
  {
    id: "dracin-kontrak-cinta",
    title: "Kontrak Cinta Pangeran Kampus",
    slug: "kontrak-cinta-pangeran-kampus",
    href: "/dracin/watch?slug=kontrak-cinta-pangeran-kampus",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/7691979850030240788/poster.jpg",
    episode: "Ep 80",
    score: "9.5",
    day: "sabtu",
    dayLabel: "Sabtu",
    time: "12:00 WIB",
    genres: ["Revenge", "Action", "Romance"],
  },
  {
    id: "dracin-dewa-perang-kumuh",
    title: "Dewa Perang Dari Daerah Kumuh",
    slug: "dewa-perang-dari-daerah-kumuh",
    href: "/dracin/watch?slug=dewa-perang-dari-daerah-kumuh",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/2069349819851718658/poster.jpg",
    episode: "Ep 68",
    score: "9.3",
    day: "sabtu",
    dayLabel: "Sabtu",
    time: "18:00 WIB",
    genres: ["War", "Action", "Urban"],
  },

  // MINGGU
  {
    id: "dracin-master-sakti",
    title: "Master Sakti Pelindung CEO",
    slug: "master-sakti-pelindung-ceo",
    href: "/dracin/watch?slug=master-sakti-pelindung-ceo",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/films/posters/01M4YV2WRPFYCCP38P9Z4FZ3HQ.jpeg",
    episode: "Ep 85",
    score: "9.6",
    day: "minggu",
    dayLabel: "Minggu",
    time: "12:00 WIB",
    genres: ["Drama", "Inspirational", "Romance"],
  },
  {
    id: "dracin-suara-hatiku",
    title: "Suara Hatiku Didengar Dewi",
    slug: "suara-hatiku-didengar-dewi",
    href: "/dracin/watch?slug=suara-hatiku-didengar-dewi",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/films/posters/01M51EGNJ1J51AM8VPJA4AXN6X.jpeg",
    episode: "Ep 72",
    score: "9.1",
    day: "minggu",
    dayLabel: "Minggu",
    time: "18:00 WIB",
    genres: ["Urban", "Action"],
  },
];

/**
 * Curated real schedule for Drakor (Korean Drama on-air slots)
 */
const CURATED_DRAKOR_SCHEDULE: Omit<UnifiedScheduleItem, "category" | "categoryLabel">[] = [
  // SENIN
  {
    id: "drakor-welcome-back-first-love",
    title: "Welcome Back, First Love. (2026)",
    slug: "welcome-back-first-love-2026",
    href: "/drakor/watch?slug=welcome-back-first-love-2026",
    poster: "https://convert.d-cdn.me/convert/aHR0cHM6Ly9hc3NldHMuZC1jZG4ubWUvaW1nLzIwMjYvMTAvMzQ0LWR5ZGJkcTRmLmpwZw--/180x200/1.jpg",
    episode: "Ep 16",
    score: "9.7",
    day: "senin",
    dayLabel: "Senin",
    time: "21:00 KST / 19:00 WIB",
    genres: ["Romance", "Drama", "Youth"],
  },
  // SELASA
  {
    id: "drakor-against-the-current",
    title: "Against the Current (2026)",
    slug: "against-the-current-2026",
    href: "/drakor/watch?slug=against-the-current-2026",
    poster: "https://convert.d-cdn.me/convert/aHR0cHM6Ly9hc3NldHMuZC1jZG4ubWUvaW1nLzIwMjYvMDkvODk0LWIzZGIydzRmLmpwZw--/180x200/1.jpg",
    episode: "Ep 12",
    score: "9.5",
    day: "selasa",
    dayLabel: "Selasa",
    time: "21:30 KST / 19:30 WIB",
    genres: ["Legal", "Thriller", "Mystery"],
  },
  // RABU
  {
    id: "drakor-made-in-korea",
    title: "Made in Korea S2 (2026)",
    slug: "made-in-korea-s2-2026",
    href: "/drakor/watch?slug=made-in-korea-s2-2026",
    poster: "https://convert.d-cdn.me/convert/aHR0cHM6Ly9hc3NldHMuZC1jZG4ubWUvaW1nLzIwMjYvMDkvNTY2LWRranlieTRmLmpwZw--/180x200/1.jpg",
    episode: "Ep 10",
    score: "9.4",
    day: "rabu",
    dayLabel: "Rabu",
    time: "21:00 KST / 19:00 WIB",
    genres: ["Action", "Historical", "Crime"],
  },
  // KAMIS
  {
    id: "drakor-doctor-x",
    title: "Doctor X Season 5 (2026 Remaster)",
    slug: "doctor-x-s5-2017",
    href: "/drakor/watch?slug=doctor-x-s5-2017",
    poster: "https://convert.d-cdn.me/convert/aHR0cHM6Ly9hc3NldHMuZC1jZG4ubWUvaW1nLzIwMjYvMTAvOTg4LW52ZGp2Zi5qcGc-/180x200/1.jpg",
    episode: "Ep 10",
    score: "9.3",
    day: "kamis",
    dayLabel: "Kamis",
    time: "21:00 KST / 19:00 WIB",
    genres: ["Medical", "Drama"],
  },
  // JUMAT
  {
    id: "drakor-a-shop-for-killers",
    title: "A Shop for Killers S2 (2026)",
    slug: "a-shop-for-killers-s2-2026",
    href: "/drakor/watch?slug=a-shop-for-killers-s2-2026",
    poster: "https://convert.d-cdn.me/convert/aHR0cHM6Ly9hc3NldHMuZC1jZG4ubWUvaW1nLzIwMjYvMDcvNDY4LWFzaG9wZm9ya2lsbGVyc3MyLXAxLmpwZw--/180x200/1.jpg",
    episode: "Ep 8",
    score: "9.6",
    day: "jumat",
    dayLabel: "Jumat",
    time: "22:00 KST / 20:00 WIB",
    genres: ["Action", "Mystery", "Thriller"],
  },
  // SABTU
  {
    id: "drakor-flex-x-cop",
    title: "Flex X Cop Season 2",
    slug: "flex-x-cop-2024",
    href: "/drakor/watch?slug=flex-x-cop-2024",
    poster: "https://convert.d-cdn.me/convert/aHR0cHM6Ly9pbWczLmRyYWtvci5jYy91cGxvYWRzLzIwMjQvMDEvODI4LWZsZXgteC1jb3AuanBn/180x200/1.jpg",
    episode: "Ep 16",
    score: "9.2",
    day: "sabtu",
    dayLabel: "Sabtu",
    time: "22:00 KST / 20:00 WIB",
    genres: ["Comedy", "Action", "Romance"],
  },
  // MINGGU
  {
    id: "drakor-the-fiery-priest",
    title: "The Fiery Priest Season 2",
    slug: "the-fiery-priest-s2",
    href: "/drakor/watch?slug=the-fiery-priest-s2",
    poster: "https://convert.d-cdn.me/convert/aHR0cHM6Ly9hc3NldHMuZC1jZG4ubWUvaW1nLzIwMjYvMDkvODk0LWIzZGIydzRmLmpwZw--/180x200/1.jpg",
    episode: "Ep 12",
    score: "9.5",
    day: "minggu",
    dayLabel: "Minggu",
    time: "22:00 KST / 20:00 WIB",
    genres: ["Action", "Comedy", "Crime"],
  },
];

/**
 * Curated real schedule for Manga / Manhwa weekly updates
 */
const CURATED_MANGA_SCHEDULE: Omit<UnifiedScheduleItem, "category" | "categoryLabel">[] = [
  // SENIN
  {
    id: "manga-one-piece",
    title: "One Piece",
    slug: "one-piece",
    href: "/manga/read?id=one-piece",
    poster: "https://cdn.myanimelist.net/images/manga/2/253146.jpg",
    episode: "Ch 1135",
    score: "9.8",
    day: "senin",
    dayLabel: "Senin",
    time: "00:00 WIB",
    genres: ["Action", "Adventure", "Fantasy"],
  },
  {
    id: "manga-jujutsu-kaisen",
    title: "Jujutsu Kaisen Aftermath",
    slug: "jujutsu-kaisen",
    href: "/manga/read?id=jujutsu-kaisen",
    poster: "https://cdn.myanimelist.net/images/manga/3/210341.jpg",
    episode: "Ch 272",
    score: "9.5",
    day: "senin",
    dayLabel: "Senin",
    time: "00:00 WIB",
    genres: ["Action", "Supernatural", "Dark Fantasy"],
  },
  // SELASA
  {
    id: "manga-chainsaw-man",
    title: "Chainsaw Man Part 2",
    slug: "chainsaw-man",
    href: "/manga/read?id=chainsaw-man",
    poster: "https://cdn.myanimelist.net/images/manga/3/216464.jpg",
    episode: "Ch 185",
    score: "9.4",
    day: "selasa",
    dayLabel: "Selasa",
    time: "22:00 WIB",
    genres: ["Action", "Horror", "Comedy"],
  },
  // RABU
  {
    id: "manga-eleceed",
    title: "Eleceed (Awakened)",
    slug: "eleceed",
    href: "/manga/read?id=eleceed",
    poster: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx106929-flAUvHZDUz5v.jpg",
    episode: "Ch 320",
    score: "9.6",
    day: "rabu",
    dayLabel: "Rabu",
    time: "21:00 WIB",
    genres: ["Action", "Supernatural", "Comedy"],
  },
  // KAMIS
  {
    id: "manga-solo-leveling-ragnarok",
    title: "Solo Leveling: Ragnarok",
    slug: "solo-leveling-ragnarok",
    href: "/manga/read?id=solo-leveling-ragnarok",
    poster: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx179445-ho0nb7baJ1a5.jpg",
    episode: "Ch 42",
    score: "9.7",
    day: "kamis",
    dayLabel: "Kamis",
    time: "20:00 WIB",
    genres: ["Action", "Fantasy", "Monsters"],
  },
  {
    id: "manga-nano-machine",
    title: "Nano Machine",
    slug: "nano-machine",
    href: "/manga/read?id=nano-machine",
    poster: "https://cdn.myanimelist.net/images/manga/2/236166.jpg",
    episode: "Ch 238",
    score: "9.5",
    day: "kamis",
    dayLabel: "Kamis",
    time: "21:00 WIB",
    genres: ["Martial Arts", "Murim", "Sci-Fi"],
  },
  // JUMAT
  {
    id: "manga-magic-emperor",
    title: "Magic Emperor (Demonic Emperor)",
    slug: "magic-emperor",
    href: "/manga/read?id=magic-emperor",
    poster: "https://cdn.myanimelist.net/images/manga/1/224674.jpg",
    episode: "Ch 592",
    score: "9.6",
    day: "jumat",
    dayLabel: "Jumat",
    time: "18:00 WIB",
    genres: ["Cultivation", "Reincarnation", "Martial Arts"],
  },
  {
    id: "manga-mount-hua",
    title: "Return of the Mount Hua Sect",
    slug: "return-of-the-mount-hua-sect",
    href: "/manga/read?id=return-of-the-mount-hua-sect",
    poster: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx132144-i5B4VnG9sRgh.png",
    episode: "Ch 145",
    score: "9.8",
    day: "jumat",
    dayLabel: "Jumat",
    time: "20:00 WIB",
    genres: ["Action", "Comedy", "Martial Arts"],
  },
  // SABTU
  {
    id: "manga-wind-breaker",
    title: "Wind Breaker (Biking Manhwa)",
    slug: "wind-breaker",
    href: "/manga/read?id=wind-breaker",
    poster: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx135083-TQbNFWKGJJHW.jpg",
    episode: "Ch 510",
    score: "9.5",
    day: "sabtu",
    dayLabel: "Sabtu",
    time: "21:00 WIB",
    genres: ["Sports", "Drama", "School"],
  },
  // MINGGU
  {
    id: "manga-boruto",
    title: "Boruto: Two Blue Vortex",
    slug: "boruto-two-blue-vortex",
    href: "/manga/read?id=boruto-two-blue-vortex",
    poster: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx168468-FEo5x1ZZyWj4.png",
    episode: "Ch 16",
    score: "9.4",
    day: "minggu",
    dayLabel: "Minggu",
    time: "00:00 WIB",
    genres: ["Action", "Ninja", "Adventure"],
  },
  {
    id: "manga-blue-lock",
    title: "Blue Lock",
    slug: "blue-lock",
    href: "/manga/read?id=blue-lock",
    poster: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx106130-yPNeuSu75ey1.jpg",
    episode: "Ch 285",
    score: "9.6",
    day: "minggu",
    dayLabel: "Minggu",
    time: "12:00 WIB",
    genres: ["Sports", "Psychological", "Shounen"],
  },
];

/**
 * Normalizes day name to lowercase standard key
 */
export function normalizeDayKey(raw: string): "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu" | "minggu" {
  const d = (raw || "").trim().toLowerCase();
  if (d.includes("senin") || d.includes("mon")) return "senin";
  if (d.includes("selasa") || d.includes("tue")) return "selasa";
  if (d.includes("rabu") || d.includes("wed")) return "rabu";
  if (d.includes("kamis") || d.includes("thu")) return "kamis";
  if (d.includes("jumat") || d.includes("jum'at") || d.includes("fri")) return "jumat";
  if (d.includes("sabtu") || d.includes("sat")) return "sabtu";
  return "minggu";
}

/**
 * Fetch and merge real live multi-category schedule
 */
export async function getUnifiedSchedule(
  categoryFilter?: string,
  dayFilter?: string
): Promise<{
  today: "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu" | "minggu";
  days: DaySchedule[];
  totalShows: number;
  categoryTotals: Record<ScheduleCategory, number>;
}> {
  // Determine today in Indonesia (UTC+7)
  const now = new Date();
  const utcDay = now.getUTCDay();
  const utcHour = now.getUTCHours();
  // If UTC hour + 7 >= 24, shift to next day
  const indoDayIdx = (utcDay + (utcHour + 7 >= 24 ? 1 : 0)) % 7;
  const dayMap: ("minggu" | "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu")[] = [
    "minggu",
    "senin",
    "selasa",
    "rabu",
    "kamis",
    "jumat",
    "sabtu",
  ];
  const todayKey = dayMap[indoDayIdx];

  // 1. Fetch Anime Schedule (from AnimeIndo with fallback)
  let animeDays: { day: string; label: string; items: any[] }[] = [];
  try {
    animeDays = await getAnimeSchedule();
  } catch {
    animeDays = REAL_SCHEDULE;
  }
  if (!animeDays || animeDays.length === 0) {
    animeDays = REAL_SCHEDULE;
  }

  // 2. Fetch live Donghua releases from Anichin
  let liveDonghuaByDay: Record<string, any[]> = {};
  try {
    const anichinData = await getAnichinJadwal();
    if (anichinData && anichinData.by_day) {
      for (const [dayName, showList] of Object.entries(anichinData.by_day)) {
        const k = normalizeDayKey(dayName);
        liveDonghuaByDay[k] = liveDonghuaByDay[k] || [];
        for (const show of showList) {
          const cleanTitle = show.title.replace(/^\[SVIP\]\s*/i, "").trim();
          const slug = show.href.replace(/^\/(anime\/)?/, "").replace(/\/$/, "");
          const realPoster = getDonghuaPoster(cleanTitle || slug);
          liveDonghuaByDay[k].push({
            id: `donghua-${slug}`,
            title: cleanTitle,
            slug,
            href: `/anichin/watch?slug=${slug}`,
            poster: realPoster,
            category: "donghua" as const,
            categoryLabel: "Donghua",
            episode: "Episode Baru",
            score: "9.3",
            day: k,
            dayLabel: DAY_LABELS[k],
            time: "Rilis Mingguan",
            genres: ["Donghua", "Action", "Cultivation"],
          });
        }
      }
    }
  } catch {
    // Graceful fallback to curated donghua list
  }

  // Build the unified items per day
  const days: DaySchedule[] = DAYS_ORDER.map((dayKey) => {
    const isToday = dayKey === todayKey;
    const label = DAY_LABELS[dayKey];
    const items: UnifiedScheduleItem[] = [];

    // A. Anime Items from AnimeIndo
    const foundAnimeDay = animeDays.find((d) => normalizeDayKey(d.day) === dayKey);
    if (foundAnimeDay && foundAnimeDay.items) {
      for (const it of foundAnimeDay.items) {
        items.push({
          id: `anime-${it.slug}`,
          title: it.title,
          slug: it.slug,
          href: `/anime/${it.slug}`,
          poster: it.poster || "https://static.anipop.xyz/poster/anime/one-piece.jpg?h=300",
          category: "anime",
          categoryLabel: "Anime",
          episode: it.episode || "Ep Baru",
          score: it.score || "8.5",
          day: dayKey,
          dayLabel: label,
          time: "Siaran TV",
          genres: ["Action", "Anime", "Animation"],
        });
      }
    }

    // B. Donghua Items (Curated + Live)
    const curatedDh = CURATED_DONGHUA_SCHEDULE.filter((d) => d.day === dayKey).map((d) => ({
      ...d,
      category: "donghua" as const,
      categoryLabel: "Donghua",
    }));
    const liveDh = liveDonghuaByDay[dayKey] || [];
    // Merge without title duplicates
    const seenDhTitles = new Set<string>();
    for (const dh of [...curatedDh, ...liveDh]) {
      const lower = dh.title.toLowerCase();
      if (!seenDhTitles.has(lower)) {
        seenDhTitles.add(lower);
        items.push(dh);
      }
    }

    // C. Dracin Items
    const dracinList = CURATED_DRACIN_SCHEDULE.filter((d) => d.day === dayKey).map((d) => ({
      ...d,
      category: "dracin" as const,
      categoryLabel: "Dracin",
    }));
    items.push(...dracinList);

    // D. Drakor Items
    const drakorList = CURATED_DRAKOR_SCHEDULE.filter((d) => d.day === dayKey).map((d) => ({
      ...d,
      category: "drakor" as const,
      categoryLabel: "Drakor",
    }));
    items.push(...drakorList);

    // E. Manga Items
    const mangaList = CURATED_MANGA_SCHEDULE.filter((d) => d.day === dayKey).map((d) => ({
      ...d,
      category: "manga" as const,
      categoryLabel: "Manga",
    }));
    items.push(...mangaList);

    // Calculate counts
    const counts: Record<ScheduleCategory, number> = {
      anime: items.filter((i) => i.category === "anime").length,
      donghua: items.filter((i) => i.category === "donghua").length,
      dracin: items.filter((i) => i.category === "dracin").length,
      drakor: items.filter((i) => i.category === "drakor").length,
      manga: items.filter((i) => i.category === "manga").length,
    };

    // Filter items if categoryFilter is applied
    const filteredItems =
      categoryFilter && categoryFilter !== "all"
        ? items.filter((i) => i.category === categoryFilter.toLowerCase())
        : items;

    return {
      day: dayKey,
      label,
      shortLabel: label.slice(0, 3),
      isToday,
      totalCount: items.length,
      counts,
      items: filteredItems,
    };
  });

  // Calculate totals across the entire week
  let totalShows = 0;
  const categoryTotals: Record<ScheduleCategory, number> = {
    anime: 0,
    donghua: 0,
    dracin: 0,
    drakor: 0,
    manga: 0,
  };

  for (const d of days) {
    categoryTotals.anime += d.counts.anime;
    categoryTotals.donghua += d.counts.donghua;
    categoryTotals.dracin += d.counts.dracin;
    categoryTotals.drakor += d.counts.drakor;
    categoryTotals.manga += d.counts.manga;
    totalShows += d.totalCount;
  }

  // Filter day if dayFilter is provided
  const finalDays =
    dayFilter && dayFilter !== "all"
      ? days.filter((d) => d.day === dayFilter.toLowerCase())
      : days;

  return {
    today: todayKey,
    days: finalDays,
    totalShows,
    categoryTotals,
  };
}
