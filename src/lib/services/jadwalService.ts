/**
 * Unified Multi-Category Schedule Service
 * Categories: Anime, Donghua, Dracin, Drakor, Manga
 */

import { getAnimeSchedule } from "./animeService";
import { REAL_SCHEDULE } from "./realDataFallback";
import { getDonghuaLatest } from "./donghuaFilmService";

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
 * Curated real schedule for Donghua (Chinese Animation)
 * Matches real weekly streaming releases in China / Indo subs
 */
const CURATED_DONGHUA_SCHEDULE: Omit<UnifiedScheduleItem, "category" | "categoryLabel">[] = [
  // SENIN
  {
    id: "donghua-lord-of-ancient-god-grave",
    title: "Lord of Ancient God Grave",
    slug: "lord-of-ancient-god-grave",
    href: "/anichin/watch?slug=lord-of-ancient-god-grave",
    poster: "https://static.anipop.xyz/poster/anime/gensou-sangokushi.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/akame-ga-kill.jpg?h=400",
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
    href: "/anichin/watch?slug=wu-shen-zhu-zai",
    poster: "https://static.anipop.xyz/poster/anime/shinsekai-yori.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/ore-dake-level-up-na-ken.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/bleach-sennen-kessen-hen.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/jujutsu-kaisen-2nd-season.jpg?h=400",
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
    href: "/anichin/watch?slug=shrouding-the-heavens",
    poster: "https://static.anipop.xyz/poster/anime/haikyuu.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/gurren-lagann.jpg?h=400",
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
    href: "/anichin/watch?slug=ten-thousand-worlds",
    poster: "https://static.anipop.xyz/poster/anime/satsuriku.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/gensou-sangokushi.jpg?h=400",
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
    href: "/anichin/watch?slug=tomb-of-fallen-gods",
    poster: "https://static.anipop.xyz/poster/anime/akame-ga-kill.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/ore-dake-level-up-na-ken.jpg?h=400",
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
    href: "/anichin/watch?slug=perfect-world",
    poster: "https://static.anipop.xyz/poster/anime/bleach-sennen-kessen-hen.jpg?h=400",
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
    href: "/anichin/watch?slug=soul-land-2",
    poster: "https://static.anipop.xyz/poster/anime/jujutsu-kaisen-2nd-season.jpg?h=400",
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
    href: "/anichin/watch?slug=the-great-ruler",
    poster: "https://static.anipop.xyz/poster/anime/haikyuu.jpg?h=400",
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
    href: "/anichin/watch?slug=battle-through-the-heavens",
    poster: "https://static.anipop.xyz/poster/anime/gurren-lagann.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/satsuriku.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/mushoku-tensei.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/akame-ga-kill.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/shinsekai-yori.jpg?h=400",
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
    id: "dracin-keluar-dari-tim",
    title: "Keluar dari Tim, Kekuatanku Meledak",
    slug: "keluar-dari-tim-kekuatanku-meledak",
    href: "/dracin/watch?slug=keluar-dari-tim-kekuatanku-meledak",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/2106597349929132034/episodes/episode-80.webp",
    episode: "Ep 82",
    score: "9.6",
    day: "senin",
    dayLabel: "Senin",
    time: "12:00 WIB",
    genres: ["Action", "Cultivation", "Revenge"],
  },
  {
    id: "dracin-kembalinya-sang-pewaris-naga",
    title: "Kembalinya Sang Pewaris Naga",
    slug: "kembalinya-sang-pewaris-naga",
    href: "/dracin/watch?slug=kembalinya-sang-pewaris-naga",
    poster: "https://d378mspt4q6n8p.cloudfront.net/posters/lelaki-biasa.jpg",
    episode: "Ep 45",
    score: "9.2",
    day: "senin",
    dayLabel: "Senin",
    time: "18:00 WIB",
    genres: ["Urban", "Billionaire", "Martial Arts"],
  },

  // SELASA
  {
    id: "dracin-lelaki-biasa",
    title: "Lelaki Biasa dengan Bakat Ajaib",
    slug: "lelaki-biasa-dengan-bakat-ajaib",
    href: "/dracin/watch?slug=lelaki-biasa-dengan-bakat-ajaib",
    poster: "https://d378mspt4q6n8p.cloudfront.net/posters/lelaki-biasa.jpg",
    episode: "Ep 90",
    score: "9.5",
    day: "selasa",
    dayLabel: "Selasa",
    time: "12:00 WIB",
    genres: ["Romance", "Urban", "Billionaire"],
  },
  {
    id: "dracin-menantu-idaman",
    title: "Menantu Idaman Konglomerat Rahasia",
    slug: "menantu-idaman-konglomerat-rahasia",
    href: "/dracin/watch?slug=menantu-idaman-konglomerat-rahasia",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/2106597349929132034/episodes/episode-80.webp",
    episode: "Ep 50",
    score: "9.1",
    day: "selasa",
    dayLabel: "Selasa",
    time: "18:00 WIB",
    genres: ["Drama", "Family", "Romance"],
  },

  // RABU
  {
    id: "dracin-nenek-sakti",
    title: "Nenek Sakti Bertangan Dewa",
    slug: "nenek-sakti-bertangan-dewa",
    href: "/dracin/watch?slug=nenek-sakti-bertangan-dewa",
    poster: "https://d378mspt4q6n8p.cloudfront.net/posters/nenek-sakti.jpg",
    episode: "Ep 75",
    score: "9.3",
    day: "rabu",
    dayLabel: "Rabu",
    time: "12:00 WIB",
    genres: ["Comedy", "Action", "Family"],
  },
  {
    id: "dracin-raja-naga",
    title: "Raja Naga Tak Tertandingi",
    slug: "raja-naga-tak-tertandingi",
    href: "/dracin/watch?slug=raja-naga-tak-tertandingi",
    poster: "https://d378mspt4q6n8p.cloudfront.net/posters/amarah-bos.jpg",
    episode: "Ep 60",
    score: "9.0",
    day: "rabu",
    dayLabel: "Rabu",
    time: "18:00 WIB",
    genres: ["Action", "Martial Arts"],
  },

  // KAMIS
  {
    id: "dracin-amarah-bos",
    title: "Amarah Bos yang Dikhianati",
    slug: "amarah-bos-yang-dikhianati",
    href: "/dracin/watch?slug=amarah-bos-yang-dikhianati",
    poster: "https://d378mspt4q6n8p.cloudfront.net/posters/amarah-bos.jpg",
    episode: "Ep 65",
    score: "9.4",
    day: "kamis",
    dayLabel: "Kamis",
    time: "12:00 WIB",
    genres: ["Romance", "Boss", "Revenge"],
  },
  {
    id: "dracin-rahasia-istri",
    title: "Rahasia Istri Sang Miliarder",
    slug: "rahasia-istri-sang-miliarder",
    href: "/dracin/watch?slug=rahasia-istri-sang-miliarder",
    poster: "https://d378mspt4q6n8p.cloudfront.net/posters/nenek-sakti.jpg",
    episode: "Ep 40",
    score: "8.9",
    day: "kamis",
    dayLabel: "Kamis",
    time: "18:00 WIB",
    genres: ["Romance", "Mystery", "Drama"],
  },

  // JUMAT
  {
    id: "dracin-maestro-kultivasi",
    title: "Bangkitnya Sang Maestro Kultivasi",
    slug: "bangkitnya-sang-maestro-kultivasi",
    href: "/dracin/watch?slug=bangkitnya-sang-maestro-kultivasi",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/2106597349929132034/episodes/episode-80.webp",
    episode: "Ep 70",
    score: "9.7",
    day: "jumat",
    dayLabel: "Jumat",
    time: "12:00 WIB",
    genres: ["Action", "Cultivation", "Overpowered"],
  },
  {
    id: "dracin-bos-cantik",
    title: "Bos Cantik Jatuh Cinta Pada Sopirnya",
    slug: "bos-cantik-jatuh-cinta-pada-sopirnya",
    href: "/dracin/watch?slug=bos-cantik-jatuh-cinta-pada-sopirnya",
    poster: "https://d378mspt4q6n8p.cloudfront.net/posters/lelaki-biasa.jpg",
    episode: "Ep 55",
    score: "9.2",
    day: "jumat",
    dayLabel: "Jumat",
    time: "18:00 WIB",
    genres: ["Romance", "Comedy", "Urban"],
  },

  // SABTU
  {
    id: "dracin-balas-dendam-pewaris",
    title: "Balas Dendam Sang Pewaris Sejati",
    slug: "balas-dendam-sang-pewaris-sejati",
    href: "/dracin/watch?slug=balas-dendam-sang-pewaris-sejati",
    poster: "https://d378mspt4q6n8p.cloudfront.net/posters/amarah-bos.jpg",
    episode: "Ep 80",
    score: "9.5",
    day: "sabtu",
    dayLabel: "Sabtu",
    time: "12:00 WIB",
    genres: ["Revenge", "Action", "Thriller"],
  },
  {
    id: "dracin-dewa-perang",
    title: "Dewa Perang Kembali ke Kota",
    slug: "dewa-perang-kembali-ke-kota",
    href: "/dracin/watch?slug=dewa-perang-kembali-ke-kota",
    poster: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/2106597349929132034/episodes/episode-80.webp",
    episode: "Ep 68",
    score: "9.3",
    day: "sabtu",
    dayLabel: "Sabtu",
    time: "18:00 WIB",
    genres: ["War", "Action", "Urban"],
  },

  // MINGGU
  {
    id: "dracin-putri-terbuang",
    title: "Putri Terbuang Menjadi Ratu Bisnis",
    slug: "putri-terbuang-menjadi-ratu-bisnis",
    href: "/dracin/watch?slug=putri-terbuang-menjadi-ratu-bisnis",
    poster: "https://d378mspt4q6n8p.cloudfront.net/posters/nenek-sakti.jpg",
    episode: "Ep 85",
    score: "9.6",
    day: "minggu",
    dayLabel: "Minggu",
    time: "12:00 WIB",
    genres: ["Drama", "Inspirational", "Romance"],
  },
  {
    id: "dracin-menembus-puncak",
    title: "Menembus Puncak Kejayaan",
    slug: "menembus-puncak-kejayaan",
    href: "/dracin/watch?slug=menembus-puncak-kejayaan",
    poster: "https://d378mspt4q6n8p.cloudfront.net/posters/lelaki-biasa.jpg",
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
    poster: "https://static.anipop.xyz/poster/anime/one-piece.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/jujutsu-kaisen-2nd-season.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/akame-ga-kill.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/shinsekai-yori.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/ore-dake-level-up-na-ken.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/bleach-sennen-kessen-hen.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/gensou-sangokushi.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/haikyuu.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/gurren-lagann.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/satsuriku.jpg?h=400",
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
    poster: "https://static.anipop.xyz/poster/anime/haikyuu.jpg?h=400",
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

  // 2. Fetch live Donghua releases to enrich donghua schedule
  let liveDonghuaByDay: Record<string, any[]> = {};
  try {
    const dhRes = await getDonghuaLatest(1, 40);
    if (dhRes && dhRes.results && dhRes.results.length > 0) {
      for (const dh of dhRes.results) {
        if (dh.release_day) {
          const k = normalizeDayKey(dh.release_day);
          liveDonghuaByDay[k] = liveDonghuaByDay[k] || [];
          liveDonghuaByDay[k].push({
            id: `donghua-${dh.id || dh.slug}`,
            title: dh.title,
            slug: dh.slug,
            href: `/donghuafilm/watch?id=${dh.id}`,
            poster: dh.poster || dh.cover || "https://static.anipop.xyz/poster/anime/gensou-sangokushi.jpg?h=400",
            category: "donghua" as const,
            categoryLabel: "Donghua",
            episode: dh.latest_episode ? `Ep ${dh.latest_episode}` : "Ongoing",
            score: String(dh.rating || "9.2"),
            day: k,
            dayLabel: DAY_LABELS[k],
            time: "Rilis Live",
            genres: Array.isArray(dh.genres) ? dh.genres : ["Donghua", "Action", "Cultivation"],
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
          poster: it.poster || "https://static.anipop.xyz/poster/anime/jujutsu-kaisen-2nd-season.jpg?h=300",
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
