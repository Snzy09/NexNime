"use client";

import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user already dismissed in this session
    if (sessionStorage.getItem("nexnime_pwa_dismissed") === "1") {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("nexnime_pwa_dismissed", "1");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#12121A]/95 backdrop-blur-md border border-rose-500/30 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-rose-400" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">Pasang NexNime</h4>
            <p className="text-[11px] text-gray-400 truncate">Akses cepat & nonton layar penuh</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/30"
          >
            Pasang
          </button>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
