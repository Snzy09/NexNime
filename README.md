# NexNime — Streaming & Manga Hub

Platform streaming modern all-in-one untuk Anime, Donghua, Manga/Manhwa, Drama Korea (Drakor), dan Drama Pendek Vertikal China (Dracin 9:16 Reels).

![NexNime Preview](https://github.com/Snzy09/NexNime/raw/main/public/preview.png)

## 🌟 Fitur Utama

- **Hero Carousel Realtime**: Banner interaktif di beranda dengan background dinamis dan metadata langsung dari anime, donghua, manga, drakor, dan dracin terpopuler.
- **Anime & Donghua Hub**: Multi-server streaming (AnimeIndo, AnimeXin, AnimeSail) kualitas hingga 1080p FHD dan 4K Donghua dengan subtitle Indonesia.
- **Manga & Manhwa Reader**: Pembaca komik online interaktif (MangaDex) dengan dukungan mode strip, zoom, dan chapter update harian.
- **Drakor Streaming**: Serial drama Korea trending (DrakorID, OppaDrama) lengkap dengan rating, sinopsis, dan episode player.
- **Dracin Short Reels 9:16**: Pemutar drama pendek vertikal native ponsel dan PC (AsiaBox, ReelShort, NetShort) dengan swipe/momentum navigation.
- **Mouse Draggable Carousel**: Seluruh carousel rekomendasi dapat digeser halus menggunakan klik dan drag mouse.
- **Symmetrical Header & Quick Search**: Navigasi responsif dengan modal pencarian global instan (`Ctrl + K`).
- **Autentikasi Pengguna**: Halaman Login dan Register dengan dark-gold glassmorphism dan persistensi sesi lokal.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan Dark & Gold Palette
- **Icons**: [Lucide React](https://lucide.dev/)
- **Scraping & Data Processing**: Cheerio, Axios, Node.js HTTPS

## 🚀 Memulai (Local Development)

```bash
# Clone repositori
git clone https://github.com/Snzy09/NexNime.git
cd NexNime

# Install dependencies
npm install

# Jalankan server development
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📦 Production Build

```bash
npm run build
npm run start
```

## 📄 Lisensi

Proyek ini dibuat untuk tujuan edukasi dan eksplorasi teknologi streaming media.
