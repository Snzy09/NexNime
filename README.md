# 🎬 NexNime — All-in-One Entertainment Hub

<div align="center">

![NexNime Logo](https://raw.githubusercontent.com/Snzy09/NexNime/main/public/icons/icon-192x192.png)

### Modern Digital Platform for Anime, Donghua, K-Drama, Dracin, Manga & Novels

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-E11D48?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![Theme](https://img.shields.io/badge/Theme-Crimson_Rose_%23E11D48-rose?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](#)

</div>

---

## 📖 Tentang NexNime

**NexNime** adalah platform hiburan digital all-in-one modern bertenaga **Next.js 14 App Router** dan **Tailwind CSS**. Menggabungkan pemutar streaming video resolusi tinggi (Anime, Donghua 4K, Drama Korea, dan Drama Pendek Vertikal China) serta pembaca komik (Manga/Manhwa) dan novel digital terjemahan Indonesia dalam satu antarmuka yang elegan, cepat, dan mobile-first.

---

## 🌟 Matriks Kategori & Penyedia Konten

| Kategori | Sumber / Provider Utama | Fitur Khusus & Pengalaman Tonton | Kualitas & Format |
| :--- | :--- | :--- | :--- |
| **🎌 Anime Jepang** | *Samehadaku, AnimeIndo, AnimeSail* | Multi-server failover, tombol Skip Intro (+85s), pemilih resolusi (360p - 1080p), navigasi episode cepat. | 360p &bull; 480p &bull; 720p &bull; 1080p FHD |
| **🐉 Donghua (Chinese Anime)** | *DonghuaFilm, AnimeXin* | Rilis mingguan kultivasi populer (*BTTH, Renegade Immortal, Swallowed Star*), direct HLS player. | 720p HD &bull; 1080p FHD &bull; 4K Ultra |
| **📱 Dracin (Drama Pendek China)** | *AsiaBox, ReelShort, NetShort, FreeReels* | Pemutar vertikal modern dengan **gesture swipe up/down** khusus smartphone untuk lanjut episode instan. | 720p &bull; 1080p Vertikal 9:16 |
| **🎎 Drakor (Drama Korea)** | *DrakorID, OppaDrama* | Metadata sinopsis lengkap, status ongoing/completed, rilis episode cepat dengan subtitle Indonesia. | 540p &bull; 720p &bull; 1080p |
| **📖 Manga & Manhwa** | *MangaDex API Engine* | **Dual-Mode Reader**: Mode Vertikal/Webtoon (scroll continuous) atau Paged (flip/swipe per halaman). | High-Resolution Scans |
| **📜 Light & Web Novel** | *Web Novel Engine* | Mode baca ramah mata dengan pembesar teks responsif, navigasi bab otomatis, dan tema gelap. | Full-Text Terjemahan Indo |
| **🍿 Film & Bioskop** | *VidBox / Cinema Stream* | Box office barat, film Asia terbaru, isolasi embed aman tanpa iklan pop-up mengganggu. | 720p &bull; 1080p Web-DL |

---

## ⚡ Fitur Unggulan & Pemutar Video

| Fitur | Deskripsi | Status |
| :--- | :--- | :---: |
| **📺 Floating Mini Player & PiP** | Tonton tayangan di sudut layar saat menjelajahi halaman lain atau gunakan Picture-in-Picture native saat minimize browser. | ![Tersedia](https://img.shields.io/badge/Tersedia-10b981?style=flat-square) |
| **⏩ Skip Opening / Intro (+85s)** | Tombol jalan pintas di video toolbar untuk melompati lagu opening anime/drama berdurasi 85–90 detik dalam 1 kali klik. | ![Tersedia](https://img.shields.io/badge/Tersedia-10b981?style=flat-square) |
| **⏱️ Pengatur Waktu Tidur (Sleep Timer)** | Atur timer otomatis (15, 30, 45, 60 menit, atau saat episode berakhir) untuk menghemat baterai & kuota saat menonton malam hari. | ![Tersedia](https://img.shields.io/badge/Tersedia-10b981?style=flat-square) |
| **📖 Dual Mode Manga (Webtoon vs Paged)** | Pembaca manga fleksibel: Mode vertikal untuk Webtoon/Manhwa dan Mode flip/slide untuk komik Jepang tradisional. | ![Tersedia](https://img.shields.io/badge/Tersedia-10b981?style=flat-square) |
| **⭐ Daftar Simpanan (Watchlist & Favorit)** | Simpan tayangan atau komik favorit lintas kategori ke halaman `/bookmark` dengan filter kategori cepat. | ![Tersedia](https://img.shields.io/badge/Tersedia-10b981?style=flat-square) |
| **📱 Native PWA (Progressive Web App)** | Dapat diinstall di Android, iOS, dan Desktop (Add to Home Screen) dengan offline shell fallback otomatis. | ![Tersedia](https://img.shields.io/badge/Tersedia-10b981?style=flat-square) |
| **🔄 Lanjut Menonton (Watch History)** | Menyimpan progres detik/menit terakhir dan menampilkan carousel interaktif yang bisa digeser di beranda. | ![Tersedia](https://img.shields.io/badge/Tersedia-10b981?style=flat-square) |
| **📅 Jadwal Terpadu (`/jadwal`)** | Jadwal rilis harian komprehensif dari Senin hingga Minggu untuk Anime, Donghua, Dracin, Drakor, dan Manga. | ![Tersedia](https://img.shields.io/badge/Tersedia-10b981?style=flat-square) |
| **🔍 Universal Search (`Ctrl + K`)** | Modal pencarian cepat global dengan debounce, riwayat pencarian, dan sistem fallback poster otomatis. | ![Tersedia](https://img.shields.io/badge/Tersedia-10b981?style=flat-square) |

---

## 🛠️ Arsitektur & Tech Stack

| Layer | Teknologi | Fungsi & Peranan dalam Aplikasi |
| :--- | :--- | :--- |
| **Core Framework** | [Next.js 14 (App Router)](https://nextjs.org/) | Hybrid Server & Client Components, Dynamic Route Handlers, Image & Font Optimization. |
| **Bahasa Pemrograman** | [TypeScript 5](https://www.typescriptlang.org/) | End-to-end type safety untuk data scraping, state player, dan properti komponen. |
| **Styling & Theme** | [Tailwind CSS 3.4](https://tailwindcss.com/) | Dark Obsidian background (`#09090D`) dipadukan dengan aksen **Crimson Rose Red (`#E11D48`)**. |
| **Komponen Ikon** | [Lucide React](https://lucide.dev/) | Kumpulan ikon SVG modern, ringan, dan tree-shakeable. |
| **Media & HLS Engine** | [Hls.js](https://github.com/video-dev/hls.js/) | Pemutaran streaming video adaptif format `.m3u8` dengan buffer control cerdas. |
| **Data Extraction** | [Cheerio](https://cheerio.js.org/) & [Axios](https://axios-http.com/) | Scraper serverless cepat untuk mengekstrak metadata dari beragam sumber publik. |
| **Offline & PWA** | Web App Manifest & Service Worker | Cache-first routing untuk aset statis, instalasi native, dan halaman `offline.html`. |
| **State & Storage** | Custom React Hooks + LocalStorage | Manajemen state terdesentralisasi: Watchlist, Watch History, Sleep Timer, dan Volume memory. |

---

## 🚀 Rencana Fitur Mendatang (Roadmap)

Berikut adalah fitur-fitur baru yang sedang dipersiapkan untuk pembaruan berikutnya:

| Fitur yang Direncanakan | Konsep & Rincian Implementasi | Status / Target |
| :--- | :--- | :---: |
| **🔐 Sistem Autentikasi Pengguna (Login & Auth)** | <ul><li>Login aman via **Google OAuth**, Discord, dan Email/Password.</li><li>Sinkronisasi Watchlist & Riwayat Tontonan lintas perangkat (HP & Laptop).</li><li>Profil kustom dengan avatar anime/karakter favorit.</li></ul> | 🚧 *Sedang Dirancang* |
| **🏆 Sistem Level & Gamifikasi (Levelling System)** | <ul><li>Pengguna memperoleh **EXP** setiap menyelesaikan 1 episode tayangan atau 1 bab komik.</li><li>Tingkatan Level: *Novice &rarr; Otaku &rarr; Cultivator &rarr; Grandmaster &rarr; Immortal*.</li><li>Sistem Badge & Achievement (misal: "Marathon Master", "Night Owl").</li><li>Leaderboard mingguan pengguna teraktif.</li></ul> | 🚧 *Sedang Dirancang* |
| **💬 Komentar & Diskusi Episode** | <ul><li>Forum diskusi interaktif di setiap halaman episode dan bab komik.</li><li>Fitur **Spoiler Tag** otomatis untuk melindungi pengguna lain dari bocoran cerita.</li><li>Sistem Upvote/Like komentar terbaik.</li></ul> | 📋 *Direncanakan* |
| **📥 Mode Unduh Offline (Download Manager)** | <ul><li>Opsi unduh batch episode anime/dracin ke penyimpanan lokal perangkat.</li><li>Penyimpanan cache komik untuk dibaca tanpa koneksi saat bepergian.</li></ul> | 📋 *Direncanakan* |
| **🔔 Notifikasi Rilis Episode (Push Notifications)** | <ul><li>Integrasi Web Push PWA untuk mengirimkan notifikasi saat judul di Bookmark merilis episode baru.</li><li>Pengaturan frekuensi notifikasi sesuai preferensi pengguna.</li></ul> | 📋 *Direncanakan* |

---

## 📂 Struktur Direktori

```text
nexnime/
├── public/                     # Aset statis, ikon PWA (192px/512px), sw.js, & offline.html
├── src/
│   ├── app/
│   │   ├── (home)/             # Halaman Beranda & Hero Banner Slider
│   │   ├── anime/              # Hub Anime & Player ([slug])
│   │   ├── animesail/          # AnimeSail Provider Hub & Watch Player
│   │   ├── animexin/           # AnimeXin Donghua Hub & Watch Player
│   │   ├── bookmark/           # Halaman Watchlist & Daftar Favorit Saya
│   │   ├── donghuafilm/        # DonghuaFilm Provider Hub & Watch Player
│   │   ├── dracin/             # Hub Dracin & Reel Swipe Player (Mobile-first)
│   │   ├── drakor/             # Drama Korea Hub & Episode Player
│   │   ├── film/               # Film Streaming Hub & Watch Player
│   │   ├── jadwal/             # Halaman Jadwal Rilis Komprehensif
│   │   ├── login/              # Halaman Masuk Akun Pengguna
│   │   ├── manga/              # Hub Manga & Pembaca Bab (Webtoon vs Paged)
│   │   ├── novel/              # Web Novel Hub & Reader Ramah Mata
│   │   ├── register/           # Halaman Pendaftaran Akun Pengguna
│   │   ├── samehadaku/         # Samehadaku Provider Hub & Watch Player
│   │   ├── search/             # Halaman Universal Search
│   │   ├── api/                # Next.js Route Handlers / Scraper Endpoints
│   │   ├── globals.css         # Styling tema global & dark scrollbar
│   │   ├── icon.png            # Favicon app merah resmi
│   │   ├── layout.tsx          # Root Layout & PWA Provider
│   │   └── manifest.ts         # PWA Web App Manifest
│   ├── components/             # Komponen UI Reusable (Navbar, Footer, Player Controls, Modal)
│   └── lib/
│       ├── hooks/              # Custom Hooks (Mini Player, Sleep Timer, Shortcuts, Bookmark)
│       └── services/           # Scraper engine & modul integrasi per penyedia konten
├── tailwind.config.ts          # Konfigurasi Tailwind & palet Crimson Rose Red
└── package.json
```

---

## 💻 Memulai Pengembangan Lokal (Development)

### Prasyarat
- [Node.js](https://nodejs.org/) versi `18.17.0` atau yang lebih baru
- Manajemen paket: `npm`, `pnpm`, atau `yarn`

### Langkah Instalasi

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/Snzy09/NexNime.git
   cd NexNime
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

4. Buka aplikasi di peramban Anda melalui [http://localhost:3000](http://localhost:3000).

---

## 📦 Verifikasi & Production Build

Untuk memverifikasi tipe TypeScript dan menghasilkan build produksi:

```bash
# Uji coba build produksi
npm run build

# Menjalankan server produksi
npm run start
```

---

## 📄 Lisensi & Pernyataan Hukum (Disclaimer)

Proyek **NexNime** dibuat untuk tujuan edukasi, riset arsitektur modern web scraping, dan eksplorasi antarmuka media digital. Seluruh hak cipta konten (video, gambar poster, sinopsis cerita, dan teks komik/novel) tetap menjadi milik masing-masing pemegang lisensi dan penyedia sumber asli.
