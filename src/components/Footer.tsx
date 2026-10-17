import React from "react";
import Link from "next/link";
import { Tv, BookOpen, Clapperboard, Video } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#08080C] text-gray-400 mt-16 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 flex items-center justify-center p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                <div className="w-full h-full bg-[#0A0A0F] rounded-full flex items-center justify-center font-black text-xs tracking-tight">
                  <span className="text-amber-500">N</span>
                  <span className="text-amber-300">N</span>
                </div>
              </div>
              <span className="font-black text-xl tracking-tight leading-none">
                <span className="text-amber-400">Nex</span>
                <span className="text-white">Nime</span>
              </span>
            </Link>
            <p className="mt-3 text-xs text-gray-400 leading-relaxed max-w-sm">
              Platform hiburan streaming Anime Jepang, Donghua, K-Drama (Drakor), Dracin, serta baca komik Manga, Manhwa &amp; Manhua dengan subtitle Indonesia berkualitas HD 1080p.
            </p>
            <div className="flex items-center gap-3 mt-4 text-xs text-gray-500">
              <span>© {new Date().getFullYear()} NexNime. All rights reserved.</span>
            </div>
          </div>

          {/* Quick Links Anime */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5" /> Streaming
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/anime" className="hover:text-amber-300 transition-colors">
                  Anime Populer
                </Link>
              </li>
              <li>
                <Link href="/anime?type=ongoing" className="hover:text-amber-300 transition-colors">
                  Sedang Tayang (Ongoing)
                </Link>
              </li>
              <li>
                <Link href="/anime#jadwal" className="hover:text-amber-300 transition-colors">
                  Jadwal Rilis Harian
                </Link>
              </li>
              <li>
                <Link href="/anime?type=donghua" className="hover:text-amber-300 transition-colors">
                  Donghua China
                </Link>
              </li>
            </ul>
          </div>

          {/* Reading Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Reading Manga
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/manga" className="hover:text-emerald-300 transition-colors">
                  Manga Terpopuler
                </Link>
              </li>
              <li>
                <Link href="/manga?type=manhwa" className="hover:text-emerald-300 transition-colors">
                  Manhwa Korea
                </Link>
              </li>
              <li>
                <Link href="/manga?type=manhua" className="hover:text-emerald-300 transition-colors">
                  Manhua China
                </Link>
              </li>
              <li>
                <Link href="/manga" className="hover:text-emerald-300 transition-colors">
                  Mode Auto-Scroll Reader
                </Link>
              </li>
            </ul>
          </div>

          {/* Drama Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" /> Drama Asia
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/drakor" className="hover:text-blue-300 transition-colors">
                  Drama Korea (Drakor)
                </Link>
              </li>
              <li>
                <Link href="/dracin" className="hover:text-rose-300 transition-colors">
                  Dracin
                </Link>
              </li>
              <li>
                <Link href="/dracin" className="hover:text-rose-300 transition-colors">
                  Reels Mini Drama
                </Link>
              </li>
              <li>
                <Link href="/drakor?status=ongoing" className="hover:text-blue-300 transition-colors">
                  Drakor Ongoing 2026
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-white/5 text-[11px] text-gray-500 text-center leading-relaxed">
          Disclaimer: Platform ini merupakan agregator media hiburan independen yang memanfaatkan data scraper untuk tujuan demonstrasi antarmuka. Semua video, poster, dan gambar adalah hak cipta pemilik aslinya.
        </div>
      </div>
    </footer>
  );
}
