"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import SearchModal from "@/components/SearchModal";
import Footer from "@/components/Footer";
import BookmarkButton from "@/components/BookmarkButton";
import {
  BookOpen,
  Star,
  Calendar,
  User,
  ChevronRight,
  Globe,
  ArrowDownUp,
  Download,
  Copy,
  Check,
  ExternalLink,
  X,
  Loader2,
  ArrowLeft,
} from "lucide-react";

export default function MangaDetailPage({ params }: { params?: { id?: string } }) {
  const routeParams = useParams();
  const mangaIdParam = (routeParams?.id as string) || params?.id || "";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<"id" | "en" | "all">("all");
  const [orderAsc, setOrderAsc] = useState(false);
  const [mangaDetail, setMangaDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Download modal state
  const [dlModalOpen, setDlModalOpen] = useState(false);
  const [dlChapter, setDlChapter] = useState<any>(null);
  const [dlData, setDlData] = useState<any>(null);
  const [dlLoading, setDlLoading] = useState(false);
  const [dlQuality, setDlQuality] = useState<"hq" | "dataSaver">("hq");
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    if (!mangaIdParam) return;
    setLoading(true);
    fetch(`/api/manga?action=detail&id=${encodeURIComponent(mangaIdParam)}&lang=${selectedLang}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.detail) setMangaDetail(d.detail);
        else setMangaDetail(null);
      })
      .catch(() => setMangaDetail(null))
      .finally(() => setLoading(false));
  }, [mangaIdParam, selectedLang]);

  const openDownloadModal = (ch: any) => {
    setDlChapter(ch);
    setDlModalOpen(true);
    setDlLoading(true);
    setDlData(null);
    setCopiedAll(false);

    fetch(`/api/manga?action=dl&chapterId=${ch.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.chapter) {
          setDlData(d);
        }
      })
      .catch(() => {})
      .finally(() => setDlLoading(false));
  };

  const handleCopyAll = (urls: string[]) => {
    if (!urls || urls.length === 0) return;
    navigator.clipboard.writeText(urls.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const currentManga = mangaDetail?.manga;
  const chapters = mangaDetail?.chapters || [];
  const sortedChapters = orderAsc ? [...chapters].reverse() : chapters;

  return (
    <div className="min-h-screen bg-[#09090D] text-white flex flex-col selection:bg-amber-400 selection:text-black">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-amber-300">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/manga" className="hover:text-amber-300">
            Manga
          </Link>
          <span>/</span>
          <span className="text-emerald-400 truncate max-w-xs">
            {currentManga?.title || "Detail Komik"}
          </span>
        </div>

        {loading ? (
          /* Skeletons */
          <div className="space-y-6 animate-pulse">
            <div className="rounded-3xl bg-[#12121A] border border-white/10 p-6 sm:p-8 flex flex-col md:flex-row gap-6">
              <div className="w-48 sm:w-56 aspect-[3/4] rounded-2xl bg-white/5" />
              <div className="flex-1 space-y-4">
                <div className="h-6 w-32 bg-white/10 rounded" />
                <div className="h-9 w-3/4 bg-white/10 rounded" />
                <div className="h-4 w-1/2 bg-white/5 rounded" />
                <div className="h-20 w-full bg-white/5 rounded" />
              </div>
            </div>
            <div className="rounded-2xl bg-[#121218] border border-white/10 p-6 space-y-4">
              <div className="h-6 w-48 bg-white/10 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-white/5" />
                ))}
              </div>
            </div>
          </div>
        ) : !currentManga ? (
          /* Not Found */
          <div className="rounded-3xl bg-[#12121A] border border-white/10 p-12 text-center space-y-4">
            <BookOpen className="w-12 h-12 text-emerald-400/50 mx-auto" />
            <h2 className="text-xl font-bold text-white">Komik Tidak Ditemukan</h2>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              ID komik tidak valid atau belum terindeks di server MangaDex. Silakan cari judul lain di katalog.
            </p>
            <Link
              href="/manga"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs text-black bg-emerald-400 hover:bg-emerald-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Katalog Komik</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Hero Card */}
            <div className="rounded-3xl bg-[#12121A] border border-white/10 p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
                <div className="w-48 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden bg-black/60 shrink-0 border border-white/15 shadow-2xl">
                  {currentManga.coverUrl ? (
                    <img
                      src={
                        currentManga.coverUrl.startsWith("/api/manga")
                          ? currentManga.coverUrl
                          : `/api/manga?action=image&url=${encodeURIComponent(currentManga.coverUrl)}`
                      }
                      alt={currentManga.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#181822]">
                      <BookOpen className="w-12 h-12 text-emerald-400/50" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      {currentManga.type || "Manhwa"}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      9.2
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                      {currentManga.status || "Ongoing"}
                    </span>
                    {currentManga.year && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {currentManga.year}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black text-white">{currentManga.title}</h1>

                  {(currentManga.author || currentManga.artist) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 my-2">
                      {currentManga.author && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Author: {currentManga.author}</span>
                        </span>
                      )}
                      {currentManga.artist && currentManga.artist !== currentManga.author && (
                        <span className="flex items-center gap-1">
                          <span>Artist: {currentManga.artist}</span>
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 my-3">
                    {currentManga.tags?.map((t: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mt-2 max-h-36 overflow-y-auto">
                    {currentManga.synopsis ||
                      "Ikuti petualangan seru dan rilis chapter terbaru dalam bahasa Indonesia dengan grafis memukau."}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-6">
                    {chapters.length > 0 && (
                      <>
                        <Link
                          href={`/manga/read/${chapters[0]?.id}`}
                          className="px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm text-black bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105 flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Mulai Baca (Ch. {chapters[0]?.chapter})</span>
                        </Link>
                        {chapters.length > 1 && (
                          <Link
                            href={`/manga/read/${chapters[chapters.length - 1]?.id}`}
                            className="px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                          >
                            <span>Baca dari Ch. {chapters[chapters.length - 1]?.chapter}</span>
                          </Link>
                        )}
                      </>
                    )}

                    <BookmarkButton
                      item={{
                        id: `manga-${currentManga.id}`,
                        title: currentManga.title,
                        category: "manga",
                        poster: currentManga.coverUrl || "",
                        url: `/manga/${currentManga.id}`,
                        totalEpisodes: chapters.length ? `${chapters.length} Ch` : undefined,
                      }}
                      accentColor="emerald"
                      variant="button"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chapters Section */}
            <div className="rounded-2xl bg-[#121218] border border-white/10 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <span>Daftar Chapter Komik</span>
                  </h2>
                  <p className="text-xs text-gray-400">Total {chapters.length} chapter tersedia</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Language Switcher */}
                  <div className="flex items-center gap-1 bg-[#181822] p-1 rounded-lg border border-white/5 text-xs font-semibold">
                    <Globe className="w-3.5 h-3.5 text-gray-400 ml-1" />
                    <button
                      onClick={() => setSelectedLang("id")}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        selectedLang === "id"
                          ? "bg-emerald-400 text-black font-bold"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      🇮🇩 ID
                    </button>
                    <button
                      onClick={() => setSelectedLang("en")}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        selectedLang === "en"
                          ? "bg-emerald-400 text-black font-bold"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      🇬🇧 EN
                    </button>
                    <button
                      onClick={() => setSelectedLang("all")}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        selectedLang === "all"
                          ? "bg-emerald-400 text-black font-bold"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      🌐 Semua
                    </button>
                  </div>

                  {/* Order Toggle */}
                  <button
                    onClick={() => setOrderAsc(!orderAsc)}
                    className="p-2 rounded-lg bg-[#181822] hover:bg-[#20202F] text-gray-300 border border-white/5 text-xs flex items-center gap-1"
                    title="Urutkan Chapter"
                  >
                    <ArrowDownUp className="w-3.5 h-3.5" />
                    <span>{orderAsc ? "Terlama" : "Terbaru"}</span>
                  </button>
                </div>
              </div>

              {chapters.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  Tidak ada chapter terbitan aktif untuk bahasa yang dipilih. Coba pilih tab &ldquo;EN&rdquo; atau &ldquo;Semua&rdquo;.
                </div>
              ) : (
                /* Chapters Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[550px] overflow-y-auto pr-1">
                  {sortedChapters.map((ch: any) => (
                    <div
                      key={ch.id}
                      className="p-3 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between group"
                    >
                      <Link href={`/manga/read/${ch.id}`} className="flex-1 pr-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 truncate">
                          Chapter {ch.chapter} {ch.title ? `- ${ch.title}` : ""}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {ch.group || "Scanlation"} • {ch.pages || 0} Halaman
                        </p>
                      </Link>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-emerald-400 font-mono">
                          {ch.language?.toUpperCase() || "ID"}
                        </span>

                        {/* Direct Download (DL) Action Button */}
                        <button
                          type="button"
                          onClick={() => openDownloadModal(ch)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-400/20 text-gray-400 hover:text-amber-300 border border-white/5 transition-colors"
                          title="Download Chapter (DL)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          href={`/manga/read/${ch.id}`}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                          title="Baca Chapter"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Chapter Download (DL) Modal */}
      {dlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#12121A] border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download Chapter {dlChapter?.chapter}</span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  {dlChapter?.title || currentManga?.title} • {dlChapter?.group || "MangaDex"}
                </p>
              </div>
              <button
                onClick={() => setDlModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            {dlLoading ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-xs text-gray-400">Mengambil link download resolusi penuh dari server...</p>
              </div>
            ) : !dlData ? (
              <div className="py-12 text-center text-xs text-rose-400">
                Gagal memuat link unduhan untuk chapter ini. Silakan coba lagi.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Watermark Notice */}
                <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 flex items-center justify-between">
                  <span>
                    Creator: <strong className="font-bold">{dlData.Creator}</strong>
                  </span>
                  <a
                    href={dlData.Saluran}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-[11px] text-amber-400 hover:text-amber-200"
                  >
                    Saluran WhatsApp
                  </a>
                </div>

                {/* Quality Toggle & Copy All */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDlQuality("hq")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        dlQuality === "hq"
                          ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                          : "bg-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      HQ ({dlData.chapter.images.hq.length} Halaman)
                    </button>
                    <button
                      onClick={() => setDlQuality("dataSaver")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        dlQuality === "dataSaver"
                          ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                          : "bg-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      Data Saver ({dlData.chapter.images.dataSaver.length} Halaman)
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      handleCopyAll(
                        (dlQuality === "hq"
                          ? dlData.chapter.images.hq
                          : dlData.chapter.images.dataSaver
                        ).map((i: any) => i.url)
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAll ? "Tersalin!" : "Salin Semua Link"}</span>
                  </button>
                </div>

                {/* Direct Image Links List */}
                <div className="space-y-2">
                  {(dlQuality === "hq"
                    ? dlData.chapter.images.hq
                    : dlData.chapter.images.dataSaver
                  ).map((img: any) => (
                    <div
                      key={img.page}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs hover:border-white/10"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="font-mono text-gray-400 font-bold shrink-0">
                          Halaman {img.page}
                        </span>
                        <span className="text-gray-500 truncate text-[11px]">{img.url}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(img.url);
                          }}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                          title="Salin Link"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-emerald-400"
                          title="Buka Gambar"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
