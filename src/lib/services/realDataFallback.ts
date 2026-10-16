/**
 * Real Data Cache & Fallbacks directly curated from the 5 scrapers and LuoyiVBond UI screenshots
 */

import { AnimeItem, ScheduleDay } from "./animeService";
import { MangaItem } from "./mangaService";
import { DrakorItem } from "./drakorService";
import { DracinItem } from "./dracinService";

export const REAL_ANIME_POPULAR: AnimeItem[] = [
  {
    title: "Jujutsu Kaisen Season 2",
    slug: "jujutsu-kaisen-season-2",
    url: "https://ww2.animeindo.pro/anime/jujutsu-kaisen-2nd-season-y99sq6r/",
    poster: "https://static.anipop.xyz/poster/anime/jujutsu-kaisen-2nd-season.jpg?h=400",
    rating: "9.65",
    status: "Tamat",
    type: "TV",
    episode: "Ep 24",
    year: "2023",
    genres: ["Action", "Fantasy", "Supernatural", "Shounen"],
    info: "Shibuya Incident Arc yang legendaris menghadirkan pertarungan sengit antara penyihir Jujutsu dan kutukan khusus."
  },
  {
    title: "Solo Leveling Anime",
    slug: "solo-leveling-anime",
    url: "https://ww2.animeindo.pro/anime/ore-dake-level-up-na-ken-99dskr/",
    poster: "https://static.anipop.xyz/poster/anime/ore-dake-level-up-na-ken.jpg?h=400",
    rating: "9.55",
    status: "Ongoing",
    type: "TV",
    episode: "Ep 12",
    year: "2025.01 ON AIR",
    genres: ["Action", "Adventure", "Fantasy"],
    info: "Sung Jin-woo, hunter terlemah umat manusia menemukan quest misterius yang mengubah takdirnya menjadi hunter terkuat di dunia."
  },
  {
    title: "Bleach: Thousand-Year Blood War",
    slug: "bleach-thousand-year-blood-war",
    url: "https://ww2.animeindo.pro/anime/bleach-sennen-kessen-hen-79ksqr/",
    poster: "https://static.anipop.xyz/poster/anime/bleach-sennen-kessen-hen.jpg?h=400",
    rating: "9.50",
    status: "Tamat",
    type: "TV",
    episode: "Ep 13",
    year: "2022.10 ON AIR",
    genres: ["Action", "Adventure", "Supernatural"],
    info: "Perang darah 1000 tahun antara Shinigami Soul Society dan Quincy Vandenreich mencapai puncaknya."
  },
  {
    title: "Akame ga Kill!",
    slug: "akame-ga-kill",
    url: "https://ww2.animeindo.pro/anime/akame-ga-kill-4mmsqr/",
    poster: "https://static.anipop.xyz/poster/anime/akame-ga-kill.jpg?h=400",
    rating: "9.49",
    status: "Tamat",
    type: "BD",
    episode: "Ep 24",
    year: "2014",
    genres: ["Action", "Fantasy", "Dark Fantasy", "Drama"],
    info: "Night Raid berjuang menggulingkan kekaisaran korup dengan senjata teigu legendaris mereka."
  },
  {
    title: "Gensou Sangokushi: Tengen Reishinki",
    slug: "gensou-sangokushi-tengen-reishinki",
    url: "https://ww2.animeindo.pro/anime/gensou-sangokushi-tengen-reishinki-11ksqr/",
    poster: "https://static.anipop.xyz/poster/anime/gensou-sangokushi.jpg?h=400",
    rating: "9.49",
    status: "Tamat",
    type: "TV",
    episode: "Ep 24",
    year: "2022",
    genres: ["Action", "Fantasy", "Historical", "Donghua"],
    info: "Kisah fantasi epik tiga kerajaan dalam membasmi monster dan iblis yang mengancam daratan."
  },
  {
    title: "Mushoku Tensei II: Isekai Ittara Honki Dasu",
    slug: "mushoku-tensei-2",
    url: "https://ww2.animeindo.pro/anime/mushoku-tensei-2/",
    poster: "https://static.anipop.xyz/poster/anime/mushoku-tensei.jpg?h=400",
    rating: "8.40",
    status: "Ongoing",
    type: "TV",
    episode: "Ep 14",
    year: "2024",
    genres: ["Isekai", "Magic", "Adventure", "Drama"],
    info: "Rudeus Greyrat melanjutkan pencarian ibunya dan menempuh pendidikan di Akademi Sihir Ranoa."
  },
  {
    title: "Shinsekai yori",
    slug: "shinsekai-yori",
    url: "https://ww2.animeindo.pro/anime/shinsekai-yori/",
    poster: "https://static.anipop.xyz/poster/anime/shinsekai-yori.jpg?h=400",
    rating: "8.48",
    status: "Tamat",
    type: "BD",
    episode: "Ep 25",
    year: "2012",
    genres: ["Sci-Fi", "Mystery", "Supernatural", "Psychological"],
    info: "Dunia seribu tahun ke depan di mana manusia memiliki kekuatan psikokinesis namun dihantui rahasia kelam."
  },
  {
    title: "Tengen Toppa Gurren Lagann",
    slug: "tengen-toppa-gurren-lagann",
    url: "https://ww2.animeindo.pro/anime/gurren-lagann/",
    poster: "https://static.anipop.xyz/poster/anime/gurren-lagann.jpg?h=400",
    rating: "8.72",
    status: "Tamat",
    type: "BD",
    episode: "Ep 27",
    year: "2007",
    genres: ["Action", "Mecha", "Sci-Fi", "Comedy"],
    info: "Simon dan Kamina menembus langit dengan mecha Gurren Lagann demi kebebasan umat manusia."
  },
  {
    title: "Haikyuu!! Karasuno Koukou VS Shiratorizawa",
    slug: "haikyuu-s3",
    url: "https://ww2.animeindo.pro/anime/haikyuu-s3/",
    poster: "https://static.anipop.xyz/poster/anime/haikyuu.jpg?h=400",
    rating: "9.00",
    status: "Tamat",
    type: "BD",
    episode: "Ep 10",
    year: "2016",
    genres: ["Sports", "School", "Shounen"],
    info: "Pertarungan penentuan tim voli Karasuno melawan sang raja bertahan Shiratorizawa menuju turnamen nasional."
  },
  {
    title: "Satsuriku no Tenshi",
    slug: "satsuriku-no-tenshi",
    url: "https://ww2.animeindo.pro/anime/angels-of-death/",
    poster: "https://static.anipop.xyz/poster/anime/satsuriku.jpg?h=400",
    rating: "6.90",
    status: "Tamat",
    type: "TV",
    episode: "Ep 16",
    year: "2018",
    genres: ["Horror", "Psychological", "Thriller"],
    info: "Rachel dan Zack berusaha meloloskan diri dari gedung terkutuk yang dipenuhi pembunuh berdarah dingin."
  }
];

export const REAL_SCHEDULE: ScheduleDay[] = [
  {
    "day": "minggu",
    "label": "Hari Minggu",
    "items": [
      {
        "title": "Seihantai Na Kimi To Boku 2Nd Season",
        "slug": "seihantai-na-kimi-to-boku-2nd-season-3nn6n5k",
        "url": "https://ww2.animeindo.pro/anime/seihantai-na-kimi-to-boku-2nd-season-3nn6n5k/",
        "episode": "Ep Terbaru",
        "score": "8.35",
        "poster": "https://static.anipop.xyz/poster/anime/seihantai-na-kimi-to-boku-2nd-season.jpg?h=300"
      },
      {
        "title": "Kimi No Koto Ga Daidaidaidaidaisuki Na 100 Nin No Kanojo 3Rd Season",
        "slug": "kimi-no-koto-ga-daidaidaidaidaisuki-na-100-nin-no-kanojo-3rd-season-fcfs8vd",
        "url": "https://ww2.animeindo.pro/anime/kimi-no-koto-ga-daidaidaidaidaisuki-na-100-nin-no-kanojo-3rd-season-fcfs8vd/",
        "episode": "Ep Terbaru",
        "score": "8.25",
        "poster": "https://static.anipop.xyz/poster/anime/kimi-no-koto-ga-daidaidaidaidaisuki-na-100-nin-no-kanojo-3rd-season.jpg?h=300"
      },
      {
        "title": "Nijusseiki Denki Mokuroku Eureka Evrika",
        "slug": "nijusseiki-denki-mokuroku-eureka-evrika-jugixbi",
        "url": "https://ww2.animeindo.pro/anime/nijusseiki-denki-mokuroku-eureka-evrika-jugixbi/",
        "episode": "Ep Terbaru",
        "score": "7.71",
        "poster": "https://static.anipop.xyz/poster/anime/nijusseiki-denki-mokuroku-eureka-evrika.jpg?h=300"
      },
      {
        "title": "Saijo No Osewa Takane No Hanadarake Na Meimonkou De Gakuin Ichi No Ojousama Seikatsu Nouryoku Kaimu Wo Kagenagara Osewa Suru Koto Ni Narimashita",
        "slug": "saijo-no-osewa-takane-no-hanadarake-na-meimonkou-de-gakuin-ichi-no-ojousama-seikatsu-nouryoku-kaimu-wo-kagenagara-osewa-suru-koto-ni-narimashita-ned4deb",
        "url": "https://ww2.animeindo.pro/anime/saijo-no-osewa-takane-no-hanadarake-na-meimonkou-de-gakuin-ichi-no-ojousama-seikatsu-nouryoku-kaimu-wo-kagenagara-osewa-suru-koto-ni-narimashita-ned4deb/",
        "episode": "Ep Terbaru",
        "score": "7.28",
        "poster": "https://static.anipop.xyz/poster/anime/saijo-no-osewa-takane-no-hanadarake-na-meimonkou-de-gakuin-ichi-no-ojousama-seikatsu-nouryoku-kaimu-wo-kagenagara-osewa-suru-koto-ni-narimashita.jpg?h=300"
      },
      {
        "title": "Digimon Beatbreak",
        "slug": "digimon-beatbreak-9ubkd4f",
        "url": "https://ww2.animeindo.pro/anime/digimon-beatbreak-9ubkd4f/",
        "episode": "Ep Terbaru",
        "score": "7.13",
        "poster": "https://static.anipop.xyz/poster/anime/digimon-beatbreak.jpg?h=300"
      },
      {
        "title": "Mahou Shoujo Lyrical Nanoha Exceeds Gun Blaze Vengeance",
        "slug": "mahou-shoujo-lyrical-nanoha-exceeds-gun-blaze-vengeance-75u3iaq",
        "url": "https://ww2.animeindo.pro/anime/mahou-shoujo-lyrical-nanoha-exceeds-gun-blaze-vengeance-75u3iaq/",
        "episode": "Ep Terbaru",
        "score": "7.06",
        "poster": "https://static.anipop.xyz/poster/anime/mahou-shoujo-lyrical-nanoha-exceeds-gun-blaze-vengeance.jpg?h=300"
      },
      {
        "title": "Oni No Hanayome",
        "slug": "oni-no-hanayome-8tqz8bi",
        "url": "https://ww2.animeindo.pro/anime/oni-no-hanayome-8tqz8bi/",
        "episode": "Ep Terbaru",
        "score": "7.05",
        "poster": "https://static.anipop.xyz/poster/anime/oni-no-hanayome.jpg?h=300"
      },
      {
        "title": "Kabushikigaisha Magi Lumiere 2Nd Season",
        "slug": "kabushikigaisha-magi-lumiere-2nd-season-vcii564",
        "url": "https://ww2.animeindo.pro/anime/kabushikigaisha-magi-lumiere-2nd-season-vcii564/",
        "episode": "Ep Terbaru",
        "score": "7.03",
        "poster": "https://static.anipop.xyz/poster/anime/kabushikigaisha-magi-lumiere-2nd-season.jpg?h=300"
      },
      {
        "title": "Tetsunabe No Jan",
        "slug": "tetsunabe-no-jan-2bn72ne",
        "url": "https://ww2.animeindo.pro/anime/tetsunabe-no-jan-2bn72ne/",
        "episode": "Ep Terbaru",
        "score": "7",
        "poster": "https://static.anipop.xyz/poster/anime/tetsunabe-no-jan.jpg?h=300"
      },
      {
        "title": "Kimi Wo Aisuru Ki Wa Nai To Itta Jiki Koushaku Sama Ga Nazeka Dekiai Shitekimasu",
        "slug": "kimi-wo-aisuru-ki-wa-nai-to-itta-jiki-koushaku-sama-ga-nazeka-dekiai-shitekimasu-zia34pb",
        "url": "https://ww2.animeindo.pro/anime/kimi-wo-aisuru-ki-wa-nai-to-itta-jiki-koushaku-sama-ga-nazeka-dekiai-shitekimasu-zia34pb/",
        "episode": "Ep Terbaru",
        "score": "6.59",
        "poster": "https://static.anipop.xyz/poster/anime/kimi-wo-aisuru-ki-wa-nai-to-itta-jiki-koushaku-sama-ga-nazeka-dekiai-shitekimasu.jpg?h=300"
      },
      {
        "title": "Kuroneko To Majo No Kyoushitsu",
        "slug": "kuroneko-to-majo-no-kyoushitsu-bn6j9mr",
        "url": "https://ww2.animeindo.pro/anime/kuroneko-to-majo-no-kyoushitsu-bn6j9mr/",
        "episode": "Ep Terbaru",
        "score": "6.49",
        "poster": "https://static.anipop.xyz/poster/anime/kuroneko-to-majo-no-kyoushitsu.jpg?h=300"
      },
      {
        "title": "Sekai Saikyou No Kouei Meikyuukoku No Shinjin Tansakusha",
        "slug": "sekai-saikyou-no-kouei-meikyuukoku-no-shinjin-tansakusha-d9w6n3b",
        "url": "https://ww2.animeindo.pro/anime/sekai-saikyou-no-kouei-meikyuukoku-no-shinjin-tansakusha-d9w6n3b/",
        "episode": "Ep Terbaru",
        "score": "6.11",
        "poster": "https://static.anipop.xyz/poster/anime/sekai-saikyou-no-kouei-meikyuukoku-no-shinjin-tansakusha.jpg?h=300"
      }
    ]
  },
  {
    "day": "senin",
    "label": "Hari Senin",
    "items": [
      {
        "title": "Mushoku Tensei Iii Isekai Ittara Honki Dasu",
        "slug": "mushoku-tensei-iii-isekai-ittara-honki-dasu-hp4c8ab",
        "url": "https://ww2.animeindo.pro/anime/mushoku-tensei-iii-isekai-ittara-honki-dasu-hp4c8ab/",
        "episode": "Ep Terbaru",
        "score": "8.99",
        "poster": "https://static.anipop.xyz/poster/anime/mushoku-tensei-iii-isekai-ittara-honki-dasu.jpg?h=300"
      },
      {
        "title": "One Piece",
        "slug": "one-piece-k2uubpv",
        "url": "https://ww2.animeindo.pro/anime/one-piece-k2uubpv/",
        "episode": "Ep Terbaru",
        "score": "8.73",
        "poster": "https://static.anipop.xyz/poster/anime/one-piece.jpg?h=300"
      },
      {
        "title": "Toumei Na Yoru Ni Kakeru Kimi To Me Ni Mienai Koi Wo Shita",
        "slug": "toumei-na-yoru-ni-kakeru-kimi-to-me-ni-mienai-koi-wo-shita-3ug4fcc",
        "url": "https://ww2.animeindo.pro/anime/toumei-na-yoru-ni-kakeru-kimi-to-me-ni-mienai-koi-wo-shita-3ug4fcc/",
        "episode": "Ep Terbaru",
        "score": "7.82",
        "poster": "https://static.anipop.xyz/poster/anime/toumei-na-yoru-ni-kakeru-kimi-to-me-ni-mienai-koi-wo-shita.jpg?h=300"
      },
      {
        "title": "Sayonara Lara",
        "slug": "sayonara-lara-jrs9hib",
        "url": "https://ww2.animeindo.pro/anime/sayonara-lara-jrs9hib/",
        "episode": "Ep Terbaru",
        "score": "7.71",
        "poster": "https://static.anipop.xyz/poster/anime/sayonara-lara.jpg?h=300"
      },
      {
        "title": "Gaikotsu Kishi Sama Tadaima Isekai E Odekakechuu Ii",
        "slug": "gaikotsu-kishi-sama-tadaima-isekai-e-odekakechuu-ii-ue9pec8",
        "url": "https://ww2.animeindo.pro/anime/gaikotsu-kishi-sama-tadaima-isekai-e-odekakechuu-ii-ue9pec8/",
        "episode": "Ep Terbaru",
        "score": "7.11",
        "poster": "https://static.anipop.xyz/poster/anime/gaikotsu-kishi-sama-tadaima-isekai-e-odekakechuu-ii.jpg?h=300"
      },
      {
        "title": "Tenkou Saki No Seiso Karen Na Bishoujo Ga Mukashi Danshi To Omotte Issho Ni Asonda Osananajimi Datta Ken",
        "slug": "tenkou-saki-no-seiso-karen-na-bishoujo-ga-mukashi-danshi-to-omotte-issho-ni-asonda-osananajimi-datta-ken-8fgadpg",
        "url": "https://ww2.animeindo.pro/anime/tenkou-saki-no-seiso-karen-na-bishoujo-ga-mukashi-danshi-to-omotte-issho-ni-asonda-osananajimi-datta-ken-8fgadpg/",
        "episode": "Ep Terbaru",
        "score": "7.1",
        "poster": "https://static.anipop.xyz/poster/anime/tenkou-saki-no-seiso-karen-na-bishoujo-ga-mukashi-danshi-to-omotte-issho-ni-asonda-osananajimi-datta-ken.jpg?h=300"
      },
      {
        "title": "Buchigire Reijou Wa Houfuku Wo Chikaimashita Madousho No Chikara De Sokoku Wo Tatakitsubushimasu",
        "slug": "buchigire-reijou-wa-houfuku-wo-chikaimashita-madousho-no-chikara-de-sokoku-wo-tatakitsubushimasu-hruhkq3",
        "url": "https://ww2.animeindo.pro/anime/buchigire-reijou-wa-houfuku-wo-chikaimashita-madousho-no-chikara-de-sokoku-wo-tatakitsubushimasu-hruhkq3/",
        "episode": "Ep Terbaru",
        "score": "7.07",
        "poster": "https://static.anipop.xyz/poster/anime/buchigire-reijou-wa-houfuku-wo-chikaimashita-madousho-no-chikara-de-sokoku-wo-tatakitsubushimasu.jpg?h=300"
      },
      {
        "title": "Koko Wa Ore Ni Makasete Saki Ni Ike To Itte Kara 10 Nen Ga Tattara Densetsu Ni Natteita",
        "slug": "koko-wa-ore-ni-makasete-saki-ni-ike-to-itte-kara-10-nen-ga-tattara-densetsu-ni-natteita-qi45dc3",
        "url": "https://ww2.animeindo.pro/anime/koko-wa-ore-ni-makasete-saki-ni-ike-to-itte-kara-10-nen-ga-tattara-densetsu-ni-natteita-qi45dc3/",
        "episode": "Ep Terbaru",
        "score": "6.86",
        "poster": "https://static.anipop.xyz/poster/anime/koko-wa-ore-ni-makasete-saki-ni-ike-to-itte-kara-10-nen-ga-tattara-densetsu-ni-natteita.jpg?h=300"
      },
      {
        "title": "Azur Lane Bisoku Zenshin Ni",
        "slug": "azur-lane-bisoku-zenshin-ni-vxk5vtp",
        "url": "https://ww2.animeindo.pro/anime/azur-lane-bisoku-zenshin-ni-vxk5vtp/",
        "episode": "Ep Terbaru",
        "score": "6.72",
        "poster": "https://static.anipop.xyz/poster/anime/azur-lane-bisoku-zenshin-ni.jpg?h=300"
      },
      {
        "title": "Suterare Seijo No Isekai Gohan Tabi Kakure Skill De Camping Car Wo Shoukan Shimashita",
        "slug": "suterare-seijo-no-isekai-gohan-tabi-kakure-skill-de-camping-car-wo-shoukan-shimashita-nshqr4y",
        "url": "https://ww2.animeindo.pro/anime/suterare-seijo-no-isekai-gohan-tabi-kakure-skill-de-camping-car-wo-shoukan-shimashita-nshqr4y/",
        "episode": "Ep Terbaru",
        "score": "6.71",
        "poster": "https://static.anipop.xyz/poster/anime/suterare-seijo-no-isekai-gohan-tabi-kakure-skill-de-camping-car-wo-shoukan-shimashita.jpg?h=300"
      },
      {
        "title": "Saikyou Degarashi Ouji No Anyaku Teii Arasoi",
        "slug": "saikyou-degarashi-ouji-no-anyaku-teii-arasoi-iwmiuv2",
        "url": "https://ww2.animeindo.pro/anime/saikyou-degarashi-ouji-no-anyaku-teii-arasoi-iwmiuv2/",
        "episode": "Ep Terbaru",
        "score": "6.57",
        "poster": "https://static.anipop.xyz/poster/anime/saikyou-degarashi-ouji-no-anyaku-teii-arasoi.jpg?h=300"
      }
    ]
  },
  {
    "day": "selasa",
    "label": "Hari Selasa",
    "items": [
      {
        "title": "Grand Blue Season 3",
        "slug": "grand-blue-season-3-ra78yez",
        "url": "https://ww2.animeindo.pro/anime/grand-blue-season-3-ra78yez/",
        "episode": "Ep Terbaru",
        "score": "8.4",
        "poster": "https://static.anipop.xyz/poster/anime/grand-blue-season-3.jpg?h=300"
      },
      {
        "title": "Koukaku Kidoutai Tv",
        "slug": "koukaku-kidoutai-tv-bj2krpb",
        "url": "https://ww2.animeindo.pro/anime/koukaku-kidoutai-tv-bj2krpb/",
        "episode": "Ep Terbaru",
        "score": "7.99",
        "poster": "https://static.anipop.xyz/poster/anime/koukaku-kidoutai-tv.jpg?h=300"
      },
      {
        "title": "Kimi Ga Shinu Made Koi Wo Shitai",
        "slug": "kimi-ga-shinu-made-koi-wo-shitai-454bwav",
        "url": "https://ww2.animeindo.pro/anime/kimi-ga-shinu-made-koi-wo-shitai-454bwav/",
        "episode": "Ep Terbaru",
        "score": "7.82",
        "poster": "https://static.anipop.xyz/poster/anime/kimi-ga-shinu-made-koi-wo-shitai.jpg?h=300"
      },
      {
        "title": "Tai Ari Deshita Ojousama Wa Kakutou Game Nante Shinai",
        "slug": "tai-ari-deshita-ojousama-wa-kakutou-game-nante-shinai-s29grsr",
        "url": "https://ww2.animeindo.pro/anime/tai-ari-deshita-ojousama-wa-kakutou-game-nante-shinai-s29grsr/",
        "episode": "Ep Terbaru",
        "score": "7.4",
        "poster": "https://static.anipop.xyz/poster/anime/tai-ari-deshita-ojousama-wa-kakutou-game-nante-shinai.jpg?h=300"
      },
      {
        "title": "Mujikaku Seijo Wa Kyou Mo Muishiki Ni Chikara Wo Tare Nagasu",
        "slug": "mujikaku-seijo-wa-kyou-mo-muishiki-ni-chikara-wo-tare-nagasu-awaa4mm",
        "url": "https://ww2.animeindo.pro/anime/mujikaku-seijo-wa-kyou-mo-muishiki-ni-chikara-wo-tare-nagasu-awaa4mm/",
        "episode": "Ep Terbaru",
        "score": "6.53",
        "poster": "https://static.anipop.xyz/poster/anime/mujikaku-seijo-wa-kyou-mo-muishiki-ni-chikara-wo-tare-nagasu.jpg?h=300"
      },
      {
        "title": "Liar Game",
        "slug": "liar-game-nys6zh4",
        "url": "https://ww2.animeindo.pro/anime/liar-game-nys6zh4/",
        "episode": "Ep Terbaru",
        "score": "6.35",
        "poster": "https://static.anipop.xyz/poster/anime/liar-game.jpg?h=300"
      },
      {
        "title": "Migawari Reijou Wo Sukutta No Wa Reikoku Mujihi Na Koori No Ouji No Ai Deshita",
        "slug": "migawari-reijou-wo-sukutta-no-wa-reikoku-mujihi-na-koori-no-ouji-no-ai-deshita-2izyn5r",
        "url": "https://ww2.animeindo.pro/anime/migawari-reijou-wo-sukutta-no-wa-reikoku-mujihi-na-koori-no-ouji-no-ai-deshita-2izyn5r/",
        "episode": "Ep Terbaru",
        "score": "5.67",
        "poster": "https://static.anipop.xyz/poster/anime/migawari-reijou-wo-sukutta-no-wa-reikoku-mujihi-na-koori-no-ouji-no-ai-deshita.jpg?h=300"
      }
    ]
  },
  {
    "day": "rabu",
    "label": "Hari Rabu",
    "items": [
      {
        "title": "Rezero Kara Hajimeru Isekai Seikatsu 4Th Season",
        "slug": "rezero-kara-hajimeru-isekai-seikatsu-4th-season-6ghe6ah",
        "url": "https://ww2.animeindo.pro/anime/rezero-kara-hajimeru-isekai-seikatsu-4th-season-6ghe6ah/",
        "episode": "Ep Terbaru",
        "score": "9.18",
        "poster": "https://static.anipop.xyz/poster/anime/rezero-kara-hajimeru-isekai-seikatsu-4th-season.jpg?h=300"
      },
      {
        "title": "Gintama",
        "slug": "gintama-qghwc4f",
        "url": "https://ww2.animeindo.pro/anime/gintama-qghwc4f/",
        "episode": "Ep Terbaru",
        "score": "8.93",
        "poster": "https://static.anipop.xyz/poster/anime/gintama.jpg?h=300"
      },
      {
        "title": "Super No Ura De Yani Suu Futari",
        "slug": "super-no-ura-de-yani-suu-futari-czyxv6s",
        "url": "https://ww2.animeindo.pro/anime/super-no-ura-de-yani-suu-futari-czyxv6s/",
        "episode": "Ep Terbaru",
        "score": "8.49",
        "poster": "https://static.anipop.xyz/poster/anime/super-no-ura-de-yani-suu-futari.jpg?h=300"
      },
      {
        "title": "Clevatess Ii Majuu No Ou To Itsuwari No Yuusha Denshou",
        "slug": "clevatess-ii-majuu-no-ou-to-itsuwari-no-yuusha-denshou-c5chcaj",
        "url": "https://ww2.animeindo.pro/anime/clevatess-ii-majuu-no-ou-to-itsuwari-no-yuusha-denshou-c5chcaj/",
        "episode": "Ep Terbaru",
        "score": "7.38",
        "poster": "https://static.anipop.xyz/poster/anime/clevatess-ii-majuu-no-ou-to-itsuwari-no-yuusha-denshou.jpg?h=300"
      },
      {
        "title": "Gegege No Kitarou 2018",
        "slug": "gegege-no-kitarou-2018-yf6ku5v",
        "url": "https://ww2.animeindo.pro/anime/gegege-no-kitarou-2018-yf6ku5v/",
        "episode": "Ep Terbaru",
        "score": "7.27",
        "poster": "https://static.anipop.xyz/poster/anime/gegege-no-kitarou-2018.jpg?h=300"
      },
      {
        "title": "Youjo Senki Ii",
        "slug": "youjo-senki-ii-b4dwea6",
        "url": "https://ww2.animeindo.pro/anime/youjo-senki-ii-b4dwea6/",
        "episode": "Ep Terbaru",
        "score": "7.16",
        "poster": "https://static.anipop.xyz/poster/anime/youjo-senki-ii.jpg?h=300"
      },
      {
        "title": "Tefuda Ga Oome No Victoria",
        "slug": "tefuda-ga-oome-no-victoria-nztyr6y",
        "url": "https://ww2.animeindo.pro/anime/tefuda-ga-oome-no-victoria-nztyr6y/",
        "episode": "Ep Terbaru",
        "score": "7.13",
        "poster": "https://static.anipop.xyz/poster/anime/tefuda-ga-oome-no-victoria.jpg?h=300"
      },
      {
        "title": "Heroine Seijo Iie All Works Maid Desu Hokori",
        "slug": "heroine-seijo-iie-all-works-maid-desu-hokori-79zvf7m",
        "url": "https://ww2.animeindo.pro/anime/heroine-seijo-iie-all-works-maid-desu-hokori-79zvf7m/",
        "episode": "Ep Terbaru",
        "score": "7.03",
        "poster": "https://static.anipop.xyz/poster/anime/heroine-seijo-iie-all-works-maid-desu-hokori.jpg?h=300"
      },
      {
        "title": "Sora Wa Akai Kawa No Hotori",
        "slug": "sora-wa-akai-kawa-no-hotori-8kxj9q3",
        "url": "https://ww2.animeindo.pro/anime/sora-wa-akai-kawa-no-hotori-8kxj9q3/",
        "episode": "Ep Terbaru",
        "score": "6.55",
        "poster": "https://static.anipop.xyz/poster/anime/sora-wa-akai-kawa-no-hotori.jpg?h=300"
      },
      {
        "title": "Boruto Naruto Next Generations",
        "slug": "boruto-naruto-next-generations-rkusgq6",
        "url": "https://ww2.animeindo.pro/anime/boruto-naruto-next-generations-rkusgq6/",
        "episode": "Ep Terbaru",
        "score": "5.97",
        "poster": "https://static.anipop.xyz/poster/anime/boruto-naruto-next-generations.jpg?h=300"
      },
      {
        "title": "Katainaka No Ossan Kensei Ni Naru Ii",
        "slug": "katainaka-no-ossan-kensei-ni-naru-ii-agr5a7g",
        "url": "https://ww2.animeindo.pro/anime/katainaka-no-ossan-kensei-ni-naru-ii-agr5a7g/",
        "episode": "Ep Terbaru",
        "score": "8.40",
        "poster": "https://static.anipop.xyz/poster/anime/katainaka-no-ossan-kensei-ni-naru-ii.jpg?h=300"
      },
      {
        "title": "Otome Game Sekai Wa Mob Ni Kibishii Sekai Desu 2",
        "slug": "otome-game-sekai-wa-mob-ni-kibishii-sekai-desu-2-h375uus",
        "url": "https://ww2.animeindo.pro/anime/otome-game-sekai-wa-mob-ni-kibishii-sekai-desu-2-h375uus/",
        "episode": "Ep Terbaru",
        "score": "8.40",
        "poster": "https://static.anipop.xyz/poster/anime/otome-game-sekai-wa-mob-ni-kibishii-sekai-desu-2.jpg?h=300"
      }
    ]
  },
  {
    "day": "kamis",
    "label": "Hari Kamis",
    "items": [
      {
        "title": "Steel Ball Run Jojo No Kimyou Na Bouken",
        "slug": "steel-ball-run-jojo-no-kimyou-na-bouken-tt8avqd",
        "url": "https://ww2.animeindo.pro/anime/steel-ball-run-jojo-no-kimyou-na-bouken-tt8avqd/",
        "episode": "Ep Terbaru",
        "score": "9.1",
        "poster": "https://static.anipop.xyz/poster/anime/steel-ball-run-jojo-no-kimyou-na-bouken.jpg?h=300"
      },
      {
        "title": "World Is Dancing",
        "slug": "world-is-dancing-44jrzxs",
        "url": "https://ww2.animeindo.pro/anime/world-is-dancing-44jrzxs/",
        "episode": "Ep Terbaru",
        "score": "7.49",
        "poster": "https://static.anipop.xyz/poster/anime/world-is-dancing.jpg?h=300"
      },
      {
        "title": "Bungou Stray Dogs Wan 2",
        "slug": "bungou-stray-dogs-wan-2-ues3p8f",
        "url": "https://ww2.animeindo.pro/anime/bungou-stray-dogs-wan-2-ues3p8f/",
        "episode": "Ep Terbaru",
        "score": "7.12",
        "poster": "https://static.anipop.xyz/poster/anime/bungou-stray-dogs-wan-2.jpg?h=300"
      },
      {
        "title": "Hanazakari No Kimitachi E 2Nd Season",
        "slug": "hanazakari-no-kimitachi-e-2nd-season-26vgg5a",
        "url": "https://ww2.animeindo.pro/anime/hanazakari-no-kimitachi-e-2nd-season-26vgg5a/",
        "episode": "Ep Terbaru",
        "score": "7.08",
        "poster": "https://static.anipop.xyz/poster/anime/hanazakari-no-kimitachi-e-2nd-season.jpg?h=300"
      },
      {
        "title": "Rakudai Kenja No Gakuin Musou Nidome No Tensei S Rank Cheat Majutsushi Boukenroku",
        "slug": "rakudai-kenja-no-gakuin-musou-nidome-no-tensei-s-rank-cheat-majutsushi-boukenroku-ms2v3qz",
        "url": "https://ww2.animeindo.pro/anime/rakudai-kenja-no-gakuin-musou-nidome-no-tensei-s-rank-cheat-majutsushi-boukenroku-ms2v3qz/",
        "episode": "Ep Terbaru",
        "score": "6.73",
        "poster": "https://static.anipop.xyz/poster/anime/rakudai-kenja-no-gakuin-musou-nidome-no-tensei-s-rank-cheat-majutsushi-boukenroku.jpg?h=300"
      },
      {
        "title": "Lv999 No Murabito",
        "slug": "lv999-no-murabito-fy43p3g",
        "url": "https://ww2.animeindo.pro/anime/lv999-no-murabito-fy43p3g/",
        "episode": "Ep Terbaru",
        "score": "6.71",
        "poster": "https://static.anipop.xyz/poster/anime/lv999-no-murabito.jpg?h=300"
      },
      {
        "title": "Reiwa No Dara San",
        "slug": "reiwa-no-dara-san-mpnu6qd",
        "url": "https://ww2.animeindo.pro/anime/reiwa-no-dara-san-mpnu6qd/",
        "episode": "Ep Terbaru",
        "score": "6.64",
        "poster": "https://static.anipop.xyz/poster/anime/reiwa-no-dara-san.jpg?h=300"
      },
      {
        "title": "Dogulwang",
        "slug": "dogulwang-az77exu",
        "url": "https://ww2.animeindo.pro/anime/dogulwang-az77exu/",
        "episode": "Ep Terbaru",
        "score": "8.40",
        "poster": "https://static.anipop.xyz/poster/anime/dogulwang.jpg?h=300"
      }
    ]
  },
  {
    "day": "jumat",
    "label": "Hari Jumat",
    "items": [
      {
        "title": "Diamond No Ace Act Ii",
        "slug": "diamond-no-ace-act-ii-dpzrc56",
        "url": "https://ww2.animeindo.pro/anime/diamond-no-ace-act-ii-dpzrc56/",
        "episode": "Ep Terbaru",
        "score": "8.28",
        "poster": "https://static.anipop.xyz/poster/anime/diamond-no-ace-act-ii.jpg?h=300"
      },
      {
        "title": "Jojo No Kimyou Na Bouken Part 3 Stardust Crusaders",
        "slug": "jojo-no-kimyou-na-bouken-part-3-stardust-crusaders-vejqta4",
        "url": "https://ww2.animeindo.pro/anime/jojo-no-kimyou-na-bouken-part-3-stardust-crusaders-vejqta4/",
        "episode": "Ep Terbaru",
        "score": "8.11",
        "poster": "https://static.anipop.xyz/poster/anime/jojo-no-kimyou-na-bouken-part-3-stardust-crusaders.jpg?h=300"
      },
      {
        "title": "Tensei Shitara Slime Datta Ken 4Th Season",
        "slug": "tensei-shitara-slime-datta-ken-4th-season-ydy22pa",
        "url": "https://ww2.animeindo.pro/anime/tensei-shitara-slime-datta-ken-4th-season-ydy22pa/",
        "episode": "Ep Terbaru",
        "score": "8.1",
        "poster": "https://static.anipop.xyz/poster/anime/tensei-shitara-slime-datta-ken-4th-season.jpg?h=300"
      },
      {
        "title": "Otome Kaijuu Carameliser",
        "slug": "otome-kaijuu-carameliser-u3v739r",
        "url": "https://ww2.animeindo.pro/anime/otome-kaijuu-carameliser-u3v739r/",
        "episode": "Ep Terbaru",
        "score": "7.68",
        "poster": "https://static.anipop.xyz/poster/anime/otome-kaijuu-carameliser.jpg?h=300"
      },
      {
        "title": "Kore Kaite Shine",
        "slug": "kore-kaite-shine-cy7tg6z",
        "url": "https://ww2.animeindo.pro/anime/kore-kaite-shine-cy7tg6z/",
        "episode": "Ep Terbaru",
        "score": "7.44",
        "poster": "https://static.anipop.xyz/poster/anime/kore-kaite-shine.jpg?h=300"
      },
      {
        "title": "Tsuihou Sareta Tensei Juukishi Wa Game Chishiki De Musou Suru",
        "slug": "tsuihou-sareta-tensei-juukishi-wa-game-chishiki-de-musou-suru-7v9uate",
        "url": "https://ww2.animeindo.pro/anime/tsuihou-sareta-tensei-juukishi-wa-game-chishiki-de-musou-suru-7v9uate/",
        "episode": "Ep Terbaru",
        "score": "7.12",
        "poster": "https://static.anipop.xyz/poster/anime/tsuihou-sareta-tensei-juukishi-wa-game-chishiki-de-musou-suru.jpg?h=300"
      },
      {
        "title": "Ryoumin 0 Nin Start No Henkyou Ryoushu Sama",
        "slug": "ryoumin-0-nin-start-no-henkyou-ryoushu-sama-fve26u2",
        "url": "https://ww2.animeindo.pro/anime/ryoumin-0-nin-start-no-henkyou-ryoushu-sama-fve26u2/",
        "episode": "Ep Terbaru",
        "score": "7.07",
        "poster": "https://static.anipop.xyz/poster/anime/ryoumin-0-nin-start-no-henkyou-ryoushu-sama.jpg?h=300"
      },
      {
        "title": "Yani Neko",
        "slug": "yani-neko-yvrpzmh",
        "url": "https://ww2.animeindo.pro/anime/yani-neko-yvrpzmh/",
        "episode": "Ep Terbaru",
        "score": "7.02",
        "poster": "https://static.anipop.xyz/poster/anime/yani-neko.jpg?h=300"
      },
      {
        "title": "Kami No Shizuku",
        "slug": "kami-no-shizuku-6pgevk9",
        "url": "https://ww2.animeindo.pro/anime/kami-no-shizuku-6pgevk9/",
        "episode": "Ep Terbaru",
        "score": "5.89",
        "poster": "https://static.anipop.xyz/poster/anime/kami-no-shizuku.jpg?h=300"
      }
    ]
  },
  {
    "day": "sabtu",
    "label": "Hari Sabtu",
    "items": [
      {
        "title": "Tenmaku No Jaadugar",
        "slug": "tenmaku-no-jaadugar-s965r3h",
        "url": "https://ww2.animeindo.pro/anime/tenmaku-no-jaadugar-s965r3h/",
        "episode": "Ep Terbaru",
        "score": "8.33",
        "poster": "https://static.anipop.xyz/poster/anime/tenmaku-no-jaadugar.jpg?h=300"
      },
      {
        "title": "Detective Conan",
        "slug": "detective-conan-zpznkn6",
        "url": "https://ww2.animeindo.pro/anime/detective-conan-zpznkn6/",
        "episode": "Ep Terbaru",
        "score": "8.18",
        "poster": "https://static.anipop.xyz/poster/anime/detective-conan.jpg?h=300"
      },
      {
        "title": "Mairimashita Iruma Kun 4Th Season",
        "slug": "mairimashita-iruma-kun-4th-season-a298phi",
        "url": "https://ww2.animeindo.pro/anime/mairimashita-iruma-kun-4th-season-a298phi/",
        "episode": "Ep Terbaru",
        "score": "8.12",
        "poster": "https://static.anipop.xyz/poster/anime/mairimashita-iruma-kun-4th-season.jpg?h=300"
      },
      {
        "title": "Yomi No Tsugai",
        "slug": "yomi-no-tsugai-uhc3mhd",
        "url": "https://ww2.animeindo.pro/anime/yomi-no-tsugai-uhc3mhd/",
        "episode": "Ep Terbaru",
        "score": "7.89",
        "poster": "https://static.anipop.xyz/poster/anime/yomi-no-tsugai.jpg?h=300"
      },
      {
        "title": "Honzuki No Gekokujou Shisho Ni Naru Tame Ni Wa Shudan Wo Erandeiraremasen Ryoushu No Youjo",
        "slug": "honzuki-no-gekokujou-shisho-ni-naru-tame-ni-wa-shudan-wo-erandeiraremasen-ryoushu-no-youjo-p8uja7n",
        "url": "https://ww2.animeindo.pro/anime/honzuki-no-gekokujou-shisho-ni-naru-tame-ni-wa-shudan-wo-erandeiraremasen-ryoushu-no-youjo-p8uja7n/",
        "episode": "Ep Terbaru",
        "score": "7.83",
        "poster": "https://static.anipop.xyz/poster/anime/honzuki-no-gekokujou-shisho-ni-naru-tame-ni-wa-shudan-wo-erandeiraremasen-ryoushu-no-youjo.jpg?h=300"
      },
      {
        "title": "Black Torch",
        "slug": "black-torch-ndp63kg",
        "url": "https://ww2.animeindo.pro/anime/black-torch-ndp63kg/",
        "episode": "Ep Terbaru",
        "score": "7.38",
        "poster": "https://static.anipop.xyz/poster/anime/black-torch.jpg?h=300"
      },
      {
        "title": "Hell Mode Yarikomizuki No Gamer Wa Hai Settei No Isekai De Musou Suru 2Nd Season",
        "slug": "hell-mode-yarikomizuki-no-gamer-wa-hai-settei-no-isekai-de-musou-suru-2nd-season-k2xvfzc",
        "url": "https://ww2.animeindo.pro/anime/hell-mode-yarikomizuki-no-gamer-wa-hai-settei-no-isekai-de-musou-suru-2nd-season-k2xvfzc/",
        "episode": "Ep Terbaru",
        "score": "7.26",
        "poster": "https://static.anipop.xyz/poster/anime/hell-mode-yarikomizuki-no-gamer-wa-hai-settei-no-isekai-de-musou-suru-2nd-season.jpg?h=300"
      },
      {
        "title": "Uchi No Otouto Domo Ga Sumimasen",
        "slug": "uchi-no-otouto-domo-ga-sumimasen-a9x8rbe",
        "url": "https://ww2.animeindo.pro/anime/uchi-no-otouto-domo-ga-sumimasen-a9x8rbe/",
        "episode": "Ep Terbaru",
        "score": "7.01",
        "poster": "https://static.anipop.xyz/poster/anime/uchi-no-otouto-domo-ga-sumimasen.jpg?h=300"
      },
      {
        "title": "Mao",
        "slug": "mao-ba5j29j",
        "url": "https://ww2.animeindo.pro/anime/mao-ba5j29j/",
        "episode": "Ep Terbaru",
        "score": "6.99",
        "poster": "https://static.anipop.xyz/poster/anime/mao.jpg?h=300"
      },
      {
        "title": "Ushiro No Shoumen Kamui San",
        "slug": "ushiro-no-shoumen-kamui-san-g8zj5y4",
        "url": "https://ww2.animeindo.pro/anime/ushiro-no-shoumen-kamui-san-g8zj5y4/",
        "episode": "Ep Terbaru",
        "score": "6",
        "poster": "https://static.anipop.xyz/poster/anime/ushiro-no-shoumen-kamui-san.jpg?h=300"
      }
    ]
  }
];

export const REAL_DRAKOR_TRENDING: DrakorItem[] = [
  {
    title: "Welcome Back, First Love. (2026)",
    slug: "welcome-back-first-love-2026",
    url: "https://drakorid.co/nonton/welcome-back-first-love-2026/",
    poster: "https://convert.d-cdn.me/convert/aHR0cHM6Ly9hc3NldHMuZC1jZG4ubWUvaW1nLzIwMjYvMTAvMzQ0LWR5ZGJkcTRmLmpwZw--/180x200/1.jpg",
    rating: "9.7",
    episode: "Ep 16"
  },
  {
    title: "Against the Current (2026)",
    slug: "against-the-current-2026",
    url: "https://drakorid.co/nonton/against-the-current-2026/",
    poster: "https://convert.d-cdn.me/convert/aHR0cHM6Ly9hc3NldHMuZC1jZG4ubWUvaW1nLzIwMjYvMDkvODk0LWIzZGIydzRmLmpwZw--/180x200/1.jpg",
    rating: "9.5",
    episode: "Ep 12"
  },
  {
    title: "A Shop for Killers S2 (2026)",
    slug: "a-shop-for-killers-s2-2026",
    url: "https://drakorid.co/nonton/a-shop-for-killers-s2-2026/",
    poster: "https://convert.d-cdn.me/convert/aHR0cHM6Ly9hc3NldHMuZC1jZG4ubWUvaW1nLzIwMjYvMDcvNDY4LWFzaG9wZm9ya2lsbGVyc3MyLXAxLmpwZw--/180x200/1.jpg",
    rating: "9.6",
    episode: "Ep 8"
  },
  {
    title: "Made in Korea S2 (2026)",
    slug: "made-in-korea-s2-2026",
    url: "https://drakorid.co/nonton/made-in-korea-s2-2026/",
    poster: "https://convert.d-cdn.me/convert/aHR0cHM6Ly9hc3NldHMuZC1jZG4ubWUvaW1nLzIwMjYvMDkvNTY2LWRranlieTRmLmpwZw--/180x200/1.jpg",
    rating: "9.4",
    episode: "Ep 10"
  },
  {
    title: "Doctor X S5 (2017)",
    slug: "doctor-x-s5-2017",
    url: "https://drakorid.co/nonton/doctor-x-s5-2017/",
    poster: "https://convert.d-cdn.me/convert/aHR0cHM6Ly9hc3NldHMuZC1jZG4ubWUvaW1nLzIwMjYvMTAvOTg4LW52ZGp2Zi5qcGc-/180x200/1.jpg",
    rating: "9.3",
    episode: "Ep 10"
  },
  {
    title: "Flex X Cop (2024)",
    slug: "flex-x-cop-2024",
    url: "https://drakorid.co/nonton/flex-x-cop-2024/",
    poster: "https://convert.d-cdn.me/convert/aHR0cHM6Ly9pbWczLmRyYWtvci5jYy91cGxvYWRzLzIwMjQvMDEvODI4LWZsZXgteC1jb3AuanBn/180x200/1.jpg",
    rating: "9.2",
    episode: "Ep 16"
  }
];

export const REAL_DRACIN_SHORTS: DracinItem[] = [
  {
    slug: "keluar-dari-tim-kekuatanku-meledak",
    title: "Keluar dari Tim, Kekuatanku Meledak",
    url: "https://asiaboxdrama.com/id/movie/keluar-dari-tim-kekuatanku-meledak",
    image: "https://eu2.contabostorage.com/4f114786b23142088dd7adc82f4e687b:asiaboxdrama/2106597349929132034/episodes/episode-80.webp",
    episodes: 82,
    views: 452000,
    genres: ["Drama Pendek", "Aksi", "Kultivasi", "Balas Dendam"],
    description: "Setelah dikhianati dan diusir dari kelompok kultivasi elit, seorang pemuda membangkitkan kekuatan dewa purba yang tertidur di dalam dirinya."
  },
  {
    slug: "lelaki-biasa-dengan-bakat-ajaib",
    title: "Lelaki Biasa dengan Bakat Ajaib",
    url: "https://asiaboxdrama.com/id/movie/lelaki-biasa-dengan-bakat-ajaib",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80",
    episodes: 90,
    views: 312000,
    genres: ["Drama Pendek", "Romantis", "Urban", "Miliarder"],
    description: "Dianggap sebagai menantu tidak berguna, pemuda sederhana ini ternyata adalah satu-satunya pewaris kerajaan bisnis terbesar di Asia."
  },
  {
    slug: "nenek-sakti-bertangan-dewa",
    title: "Nenek Sakti Bertangan Dewa",
    url: "https://asiaboxdrama.com/id/movie/nenek-sakti-bertangan-dewa",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80",
    episodes: 75,
    views: 198000,
    genres: ["Drama Pendek", "Komedi", "Keluarga", "Misteri"],
    description: "Nenek desa yang bersahaja ternyata mantan komandan pasukan rahasia yang turun gunung untuk melindungi cucu kesayangannya."
  },
  {
    slug: "amarah-bos-yang-dikhianati",
    title: "Amarah Bos yang Dikhianati",
    url: "https://asiaboxdrama.com/id/movie/amarah-bos-yang-dikhianati",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
    episodes: 65,
    views: 284000,
    genres: ["Drama Pendek", "Romansa", "Boss", "Dendam"],
    description: "Presiden direktur dingin kembali ke kota setelah tiga tahun menghilang, berniat membalas penghinaan mereka yang merebut perusahaannya."
  }
];

export const REAL_MANGA_SPOTLIGHT: MangaItem[] = [
  {
    id: "dirty-strawberry-milk",
    title: "Dirty Strawberry Milk",
    status: "ongoing",
    year: 2024,
    contentRating: "erotica",
    tags: ["Adult", "Comedy", "Drama", "Josei", "Mature", "Romance"],
    coverUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80",
    url: "https://mangadex.org",
    synopsis: "Ikuti petualangan seru dan rilis chapter terbaru dalam bahasa Indonesia dengan grafis memukau.",
    type: "Manhwa",
    author: "Seo Jin"
  },
  {
    id: "solo-leveling",
    title: "Solo Leveling",
    status: "completed",
    year: 2018,
    contentRating: "safe",
    tags: ["Action", "Adventure", "Fantasy", "Monsters", "Supernatural"],
    coverUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80",
    url: "https://mangadex.org",
    synopsis: "10 tahun lalu, gerbang misterius yang menghubungkan dunia nyata dengan dunia monster terbuka. Hunter Sung Jin-woo memulai pendakian terhebatnya.",
    type: "Manhwa",
    author: "Chugong, DUBU (REDICE)"
  },
  {
    id: "magic-emperor",
    title: "Magic Emperor (Demonic Emperor)",
    status: "ongoing",
    year: 2019,
    contentRating: "safe",
    tags: ["Action", "Cultivation", "Fantasy", "Martial Arts", "Reincarnation"],
    coverUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80",
    url: "https://mangadex.org",
    synopsis: "Zhuo Yifan, Kaisar Iblis terkuat terlahir kembali ke tubuh seorang pelayan klan yang lemah. Dengan kecerdikan dan taktik iblisnya, ia menaklukkan dunia.",
    type: "Manhua",
    author: "Wuer Manhua"
  },
  {
    id: "nano-machine",
    title: "Nano Machine",
    status: "ongoing",
    year: 2020,
    contentRating: "safe",
    tags: ["Action", "Martial Arts", "Sci-Fi", "Murim", "Overpowered"],
    coverUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80",
    url: "https://mangadex.org",
    synopsis: "Cheon Yeo-woon yang dihina oleh klan Demonik disuntik mesin nano berteknologi tinggi dari masa depan oleh keturunannya.",
    type: "Manhwa",
    author: "HANJUNG WOLYA"
  },
  {
    id: "return-of-mount-hua-sect",
    title: "Return of the Mount Hua Sect",
    status: "ongoing",
    year: 2021,
    contentRating: "safe",
    tags: ["Action", "Comedy", "Martial Arts", "Reincarnation", "Historical"],
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
    url: "https://mangadex.org",
    synopsis: "Chung Myung, Pendekar Pedang Bunga Plum ke-13 yang membunuh Iblis Surgawi terlahir kembali 100 tahun kemudian dan menemukan sekte Gunung Hua telah runtuh.",
    type: "Manhwa",
    author: "Biga, LICO"
  }
];
