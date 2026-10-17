# NexNime — All-in-One Streaming, Comic & Novel Hub

NexNime adalah platform hiburan digital terpadu modern yang menggabungkan streaming video, pembaca komik, dan pembaca novel dalam satu antarmuka responsif dan cepat.

![NexNime Preview](https://github.com/Snzy09/NexNime/raw/main/public/preview.png)

---

## 🌟 Fitur Utama

### 1. 🎬 Multi-Category Streaming & Reading
- **Anime & Donghua**: Integrasi multi-provider (AnimeIndo, Samehadaku, AnimeSail, AnimeXin, Anichin, DonghuaFilm) dengan resolusi hingga 1080p FHD dan 4K Donghua ber-subtitle Indonesia. Dilengkapi sistem failover otomatis jika salah satu provider sedang tidak tersedia.
- **Dracin (Drama China)**: Pemutar drama pendek vertikal modern yang mendukung penyedia konten AsiaBox, ReelShort, NetShort, dan FreeReels. Dilengkapi dukungan gesture **swipe up / swipe down** di ponsel untuk navigasi episode instan.
- **Drakor (Drama Korea)**: Serial trending dari DrakorID dan OppaDrama dengan metadata lengkap, daftar episode, dan pilihan server cadangan.
- **Manga & Manhwa Reader**: Pembaca komik web interaktif bertenaga MangaDex dengan mode baca vertikal continuous-strip, daftar chapter, dan zoom gambar.
- **Light & Web Novel Reader**: Pembaca novel digital dengan tata letak ramah mata, pengaturan ukuran teks, dan navigasi bab cepat.
- **Film & Movie**: Akses pemutar film box office dan sinema terkini.

### 2. 📅 Halaman Jadwal Rilis Terpadu (`/jadwal`)
- Menampilkan jadwal rilis harian komprehensif dari semua kategori (Anime, Donghua, Drakor, Dracin, Manga, dan Novel).
- Filter hari praktis (Senin – Minggu) untuk memantau update episode atau chapter terbaru secara realtime.

### 3. 🔍 Universal Search & Poster Rendering
- Pencarian global instan via modal keyboard shortcut (`Ctrl + K`) maupun halaman pencarian penuh (`/search`).
- Rendering poster terpadu dengan sistem fallback gambar otomatis untuk memastikan visual poster selalu muncul di semua tipe konten (Anime, Manga, Novel, Drakor, Dracin).

### 4. 📱 Mobile First & Gestures
- **Swipe to Next Episode**: Fitur gesture swipe khusus ponsel pada pemutar Dracin untuk pengalaman menonton selayaknya aplikasi short-video native.
- **Draggable Carousel**: Semua carousel daftar tayangan dapat digeser halus baik dengan sentuhan jari maupun drag mouse.

### 5. 🛡️ Resilient Scraper & Embed Protection
- Pemutar video mengisolasi link player embed asli (`putarin.xyz`, `streamtape`, `mp4upload`, direct HLS/MP4) dan mencegah halaman website penyedia tersemat ke dalam frame.
- Fallback cerdas antar-penyedia saat terjadi proteksi Cloudflare atau timeout jaringan.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan palet warna Dark Obsidian & Amber Gold
- **Icons**: [Lucide React](https://lucide.dev/)
- **Streaming & Media**: [Hls.js](https://github.com/video-dev/hls.js/)
- **Scraping & Data Extraction**: [Cheerio](https://cheerio.js.org/), [Axios](https://axios-http.com/)

---

## 📂 Struktur Direktori Utama

```text
nexnime/
├── public/                 # Aset statis & logo
├── src/
│   ├── app/
│   │   ├── (home)/         # Halaman Beranda & Hero Carousel
│   │   ├── anime/          # Hub Anime & Player ([slug])
│   │   ├── anichin/        # Donghua Anichin
│   │   ├── animesail/      # AnimeSail Provider Hub
│   │   ├── animexin/       # AnimeXin Donghua Hub
│   │   ├── dracin/         # Hub Dracin & Reel Swipe Player
│   │   ├── drakor/         # Drama Korea Hub & Player
│   │   ├── film/           # Film Streaming Hub
│   │   ├── jadwal/         # Jadwal Rilis Seluruh Kategori
│   │   ├── manga/          # Manga Hub & Chapter Reader
│   │   ├── novel/          # Web Novel Hub & Reader
│   │   ├── samehadaku/     # Samehadaku Provider Hub
│   │   ├── search/         # Halaman Universal Search
│   │   └── api/            # Route Handlers / Scraper Endpoints
│   ├── components/         # Komponen UI (Navbar, Footer, Modal, Carousel, dll.)
│   └── lib/
│       └── services/       # Scraper engine & data adapters per provider
└── tailwind.config.ts      # Konfigurasi tema dan styling
```

---

## 🚀 Memulai (Local Development)

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18.17 atau lebih baru
- npm / yarn / pnpm

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

4. Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

---

## 📦 Production Build

Untuk memverifikasi dan membangun aplikasi untuk production:

```bash
# Build aplikasi
npm run build

# Menjalankan server production
npm run start
```

---

## 📄 Lisensi & Disclaimer

Proyek ini dikembangkan untuk tujuan edukasi, riset arsitektur modern web scraping, dan eksplorasi teknologi media streaming. Seluruh hak cipta konten (video, gambar, sinopsis, teks komik/novel) tetap menjadi milik masing-masing pemegang hak cipta dan penyedia sumber asli.
