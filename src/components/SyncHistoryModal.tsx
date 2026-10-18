"use client";

import React, { useState } from "react";
import {
  X,
  Share2,
  Download,
  Upload,
  Copy,
  Check,
  Smartphone,
  Laptop,
  KeyRound,
  AlertCircle,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  getWatchHistory,
  importWatchHistory,
  exportWatchHistoryJSON,
  WatchHistoryItem,
} from "@/lib/services/watchHistory";

interface SyncHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess: () => void;
}

export default function SyncHistoryModal({
  isOpen,
  onClose,
  onSyncSuccess,
}: SyncHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentHistory = getWatchHistory();

  const handleGenerateCode = async () => {
    if (currentHistory.length === 0) {
      setErrorMsg("Riwayat tontonan masih kosong, belum ada data untuk dikirim.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/sync-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: currentHistory }),
      });
      const data = await res.json();
      if (data.success && data.code) {
        setSyncCode(data.code);
        setSuccessMsg(`Kode berhasil dibuat untuk ${data.itemCount} riwayat tontonan!`);
      } else {
        setErrorMsg(data.error || "Gagal membuat kode sinkronisasi.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghubungi server sinkronisasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleImportByCode = async (codeToUse?: string) => {
    const code = (codeToUse || inputCode).trim().replace(/\s+/g, "");
    if (!code || code.length < 6) {
      setErrorMsg("Masukkan 6 digit kode sinkronisasi dengan benar.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/sync-history?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        const ok = importWatchHistory(data.history);
        if (ok) {
          setSuccessMsg(`Berhasil mengimpor ${data.history.length} riwayat dari perangkat lain!`);
          onSyncSuccess();
        } else {
          setErrorMsg("Gagal menyimpan riwayat ke penyimpanan lokal perangkat ini.");
        }
      } else {
        setErrorMsg(data.error || "Kode sinkronisasi tidak valid atau sudah kedaluwarsa.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat mengunduh data riwayat.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    try {
      const jsonStr = exportWatchHistoryJSON();
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexnime-history-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setErrorMsg("Gagal mengekspor file JSON.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed)) {
          const ok = importWatchHistory(parsed);
          if (ok) {
            setSuccessMsg(`Berhasil mengimpor ${parsed.length} riwayat dari file JSON!`);
            onSyncSuccess();
          } else {
            setErrorMsg("Format file riwayat tidak valid.");
          }
        } else {
          setErrorMsg("File tidak berisi daftar riwayat yang valid.");
        }
      } catch {
        setErrorMsg("Gagal membaca atau mem-parsing file JSON.");
      }
    };
    reader.readAsText(file);
  };

  const syncLink =
    typeof window !== "undefined" && syncCode
      ? `${window.location.origin}/?sync=${syncCode}`
      : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0F0F16] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#14141E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Sinkronisasi Riwayat Tontonan</span>
              </h3>
              <p className="text-xs text-gray-400">
                Lanjutkan nonton di HP, Laptop, atau perangkat lain
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-black/40">
          <button
            onClick={() => {
              setActiveTab("export");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeTab === "export"
                ? "border-rose-500 text-white bg-white/5"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Laptop className="w-4 h-4 text-rose-400" />
            <span>Kirim / Buat Kode</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("import");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeTab === "import"
                ? "border-rose-500 text-white bg-white/5"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Terima / Masukkan Kode</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Status Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === "export" ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-300 space-y-2">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Kirim riwayat ({currentHistory.length} judul) ke perangkat lain:
                </p>
                <p className="text-gray-400 leading-relaxed">
                  Buat kode 6-digit sementara (berlaku 24 jam) untuk ditarik langsung dari browser HP atau laptop barumu.
                </p>
              </div>

              {syncCode ? (
                <div className="space-y-3 p-4 rounded-2xl bg-black/60 border border-rose-500/30 text-center">
                  <p className="text-xs text-rose-300 uppercase tracking-widest font-semibold">
                    Kode Sinkronisasi Kamu
                  </p>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-widest py-1 flex items-center justify-center gap-2">
                    <span>{syncCode.slice(0, 3)}</span>
                    <span className="text-rose-500">-</span>
                    <span>{syncCode.slice(3)}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(syncCode);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? "Kode Disalin" : "Salin Kode"}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (syncLink) {
                          navigator.clipboard.writeText(syncLink);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? "Link Disalin" : "Salin Tautan Cepat"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleGenerateCode}
                  disabled={loading || currentHistory.length === 0}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  <span>Buat Kode Sinkronisasi 6-Digit</span>
                </button>
              )}

              {/* JSON Backup Download option */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span>Atau cadangkan file secara manual:</span>
                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  disabled={currentHistory.length === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 font-semibold transition-colors disabled:opacity-40"
                >
                  <Download className="w-3 h-3 text-amber-400" />
                  <span>Unduh File JSON</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">
                  Masukkan 6-Digit Kode dari Perangkat Asal:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={8}
                    placeholder="Contoh: 849201"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/15 focus:border-rose-500 rounded-xl px-4 py-2.5 text-center text-lg font-mono font-bold tracking-widest text-white outline-none"
                  />
                  <button
                    onClick={() => handleImportByCode()}
                    disabled={loading || !inputCode.trim()}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>Tarik Riwayat</span>
                  </button>
                </div>
              </div>

              {/* JSON File Import Alternative */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <label className="text-xs font-semibold text-gray-400">
                  Atau impor dari file cadangan JSON:
                </label>
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 hover:border-cyan-400/50 bg-white/5 hover:bg-white/10 cursor-pointer text-xs text-gray-300 transition-colors">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Pilih file .json dari perangkat ini</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
