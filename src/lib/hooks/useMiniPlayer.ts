"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface MiniPlayerOptions {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  containerRef?: React.RefObject<HTMLElement | null>;
  title?: string;
  poster?: string;
  onNext?: () => void;
  onPrev?: () => void;
}

export function useMiniPlayer(options?: MiniPlayerOptions) {
  const [isOutOfView, setIsOutOfView] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isManualMini, setIsManualMini] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pipWindowRef = useRef<Window | null>(null);

  // 1. Auto-Mini on Scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setIsOutOfView(true);
        } else if (entry.isIntersecting) {
          setIsOutOfView(false);
          setIsDismissed(false);
        }
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // 2. Enable Auto-Picture-in-Picture on Native Video when supported (Chromium)
  useEffect(() => {
    const video = options?.videoRef?.current;
    if (!video) return;

    try {
      if ("autoPictureInPicture" in video) {
        (video as any).autoPictureInPicture = true;
      }
      video.setAttribute("autopictureinpicture", "");
    } catch {}

    const handleEnterPip = () => setIsPipActive(true);
    const handleLeavePip = () => setIsPipActive(false);

    video.addEventListener("enterpictureinpicture", handleEnterPip);
    video.addEventListener("leavepictureinpicture", handleLeavePip);

    return () => {
      video.removeEventListener("enterpictureinpicture", handleEnterPip);
      video.removeEventListener("leavepictureinpicture", handleLeavePip);
    };
  }, [options?.videoRef]);

  // Clean up PiP window on unmount
  useEffect(() => {
    return () => {
      if (pipWindowRef.current && !pipWindowRef.current.closed) {
        try {
          pipWindowRef.current.close();
        } catch {}
      }
    };
  }, []);

  const scrollToPlayer = () => {
    setIsManualMini(false);
    setIsDismissed(false);
    if (sentinelRef.current) {
      sentinelRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const dismissMini = () => {
    setIsDismissed(true);
    setIsManualMini(false);
  };

  const toggleManualMini = () => {
    setIsManualMini((prev) => !prev);
    setIsDismissed(false);
  };

  // 3. Toggle Picture-in-Picture:
  // Uses Chrome Document Picture-in-Picture API (Chrome 116+) to create a real, OS-level
  // always-on-top window that stays visible and playing even when Chrome is completely MINIMIZED!
  // Falls back to HTML5 Video PiP (video.requestPictureInPicture) or in-app dock.
  const togglePictureInPicture = useCallback(async () => {
    try {
      // A. Close existing Document PiP window if currently open
      if (pipWindowRef.current && !pipWindowRef.current.closed) {
        pipWindowRef.current.close();
        pipWindowRef.current = null;
        setIsPipActive(false);
        return;
      }

      // B. Exit native video PiP if currently active
      if (typeof document !== "undefined" && document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
        return;
      }

      const targetEl = options?.containerRef?.current;
      const video = options?.videoRef?.current || targetEl?.querySelector("video");

      // C. Document Picture-in-Picture API (Chrome 116+, Edge, Opera)
      // Pops out the entire player (including iframe or video + controls) into a native OS window
      if (
        typeof window !== "undefined" &&
        "documentPictureInPicture" in window &&
        targetEl &&
        targetEl.parentNode
      ) {
        const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 560,
          height: 315,
        });

        pipWindowRef.current = pipWindow;
        setIsPipActive(true);

        // Copy all stylesheets from main document so styles and Tailwind apply inside PiP window
        [...document.styleSheets].forEach((sheet) => {
          try {
            if (sheet.href) {
              const link = pipWindow.document.createElement("link");
              link.rel = "stylesheet";
              link.href = sheet.href;
              pipWindow.document.head.appendChild(link);
            } else if (sheet.cssRules) {
              const style = pipWindow.document.createElement("style");
              style.textContent = Array.from(sheet.cssRules)
                .map((r) => r.cssText)
                .join("");
              pipWindow.document.head.appendChild(style);
            }
          } catch {
            if (sheet.href) {
              const link = pipWindow.document.createElement("link");
              link.rel = "stylesheet";
              link.href = sheet.href;
              pipWindow.document.head.appendChild(link);
            }
          }
        });

        // Setup PiP window document body
        pipWindow.document.title = options?.title
          ? `${options.title} - NexNime Floating Player`
          : "NexNime Floating Player";
        pipWindow.document.body.style.margin = "0";
        pipWindow.document.body.style.padding = "0";
        pipWindow.document.body.style.backgroundColor = "#000";
        pipWindow.document.body.style.width = "100vw";
        pipWindow.document.body.style.height = "100vh";
        pipWindow.document.body.style.overflow = "hidden";
        pipWindow.document.body.style.display = "flex";
        pipWindow.document.body.style.flexDirection = "column";

        // Create placeholder in main document
        const placeholder = document.createElement("div");
        placeholder.id = "nexnime-pip-placeholder";
        placeholder.style.width = "100%";
        placeholder.style.aspectRatio = "16/9";
        placeholder.style.borderRadius = "1rem";
        placeholder.style.backgroundColor = "#0b0b14";
        placeholder.style.border = "2px dashed rgba(244, 63, 94, 0.4)";
        placeholder.style.display = "flex";
        placeholder.style.flexDirection = "column";
        placeholder.style.alignItems = "center";
        placeholder.style.justifyContent = "center";
        placeholder.style.padding = "1.5rem";
        placeholder.style.textAlign = "center";
        placeholder.style.gap = "0.75rem";
        placeholder.style.userSelect = "none";
        placeholder.innerHTML = `
          <div style="width:48px;height:48px;border-radius:50%;background:rgba(244,63,94,0.15);color:#fb7185;display:flex;align-items:center;justify-content:center;margin:0 auto;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><rect x="14" y="12" width="6" height="6" rx="1"/></svg>
          </div>
          <div>
            <p style="font-weight:bold;font-size:14px;color:#ffffff;margin:0 0 4px 0;">Player Mengambang Aktif (Picture-in-Picture)</p>
            <p style="font-size:12px;color:#9ca3af;margin:0;max-width:340px;">Jendela mengambang tetap tampil di layar desktop meskipun aplikasi Chrome utama diminimalkan.</p>
          </div>
          <button id="restore-pip-btn" style="padding:8px 16px;background:linear-gradient(to right, #e11d48, #d97706);color:#ffffff;font-size:12px;font-weight:bold;border-radius:12px;border:none;cursor:pointer;margin-top:4px;box-shadow:0 4px 14px rgba(225,29,72,0.35);">
            Kembalikan ke Halaman
          </button>
        `;

        const origParent = targetEl.parentNode;
        const origWidth = targetEl.style.width;
        const origHeight = targetEl.style.height;
        const origMaxW = targetEl.style.maxWidth;
        const origBorderRadius = targetEl.style.borderRadius;

        origParent.insertBefore(placeholder, targetEl);

        targetEl.style.width = "100%";
        targetEl.style.height = "100%";
        targetEl.style.maxWidth = "none";
        targetEl.style.borderRadius = "0";
        pipWindow.document.body.appendChild(targetEl);

        let restored = false;
        const restore = () => {
          if (restored) return;
          restored = true;
          targetEl.style.width = origWidth;
          targetEl.style.height = origHeight;
          targetEl.style.maxWidth = origMaxW;
          targetEl.style.borderRadius = origBorderRadius;

          if (placeholder.parentNode) {
            placeholder.parentNode.insertBefore(targetEl, placeholder);
            placeholder.remove();
          }
          setIsPipActive(false);
          pipWindowRef.current = null;
          try {
            if (!pipWindow.closed) pipWindow.close();
          } catch {}
        };

        pipWindow.addEventListener("pagehide", restore);
        const restoreBtn = placeholder.querySelector("#restore-pip-btn");
        restoreBtn?.addEventListener("click", restore);
        return;
      }

      // D. Option B: Native Video Element Picture-in-Picture fallback
      if (video && document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
        setIsPipActive(true);
        return;
      }

      // E. Fallback: In-app floating dock
      toggleManualMini();
    } catch (err) {
      console.warn("PiP activation fallback:", err);
      const video = options?.videoRef?.current;
      if (video && document.pictureInPictureEnabled && !document.pictureInPictureElement) {
        try {
          await video.requestPictureInPicture();
          setIsPipActive(true);
          return;
        } catch {}
      }
      toggleManualMini();
    }
  }, [options?.containerRef, options?.videoRef, options?.title]);

  // 4. Register Media Session API for persistent background playback and PiP actions
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

    try {
      if (options?.title) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: options.title,
          artist: "NexNime Stream",
          artwork: options.poster
            ? [{ src: options.poster, sizes: "512x512", type: "image/jpeg" }]
            : [],
        });
      }

      const video = options?.videoRef?.current;
      if (video) {
        navigator.mediaSession.setActionHandler("play", () => {
          video.play().catch(() => {});
        });
        navigator.mediaSession.setActionHandler("pause", () => {
          video.pause();
        });
        if (options.onNext) {
          navigator.mediaSession.setActionHandler("nexttrack", options.onNext);
        }
        if (options.onPrev) {
          navigator.mediaSession.setActionHandler("previoustrack", options.onPrev);
        }
      }

      // Register enterpictureinpicture so Chrome's browser PiP controls or auto triggers use our floating window
      try {
        navigator.mediaSession.setActionHandler("enterpictureinpicture" as any, () => {
          togglePictureInPicture();
        });
      } catch {}
    } catch {}
  }, [
    options?.title,
    options?.poster,
    options?.videoRef,
    options?.onNext,
    options?.onPrev,
    togglePictureInPicture,
  ]);

  // Is in-app mini player active (when scrolled or toggled, unless dismissed or currently in native PiP)
  const isMini = (isManualMini || isOutOfView) && !isDismissed && !isPipActive;

  return {
    isMini,
    isManualMini,
    isPipActive,
    sentinelRef,
    scrollToPlayer,
    dismissMini,
    toggleManualMini,
    togglePictureInPicture,
  };
}

