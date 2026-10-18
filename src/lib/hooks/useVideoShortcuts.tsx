"use client";

import React, { useEffect, useState, useCallback } from "react";

export interface VideoShortcutsOptions {
  videoRef?: React.RefObject<HTMLVideoElement>;
  containerRef?: React.RefObject<HTMLElement>;
  onTogglePlay?: () => void;
  onToggleFullscreen?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  enabled?: boolean;
}

export interface ShortcutToastInfo {
  text: string;
  type?: "play" | "pause" | "seek_fwd" | "seek_bwd" | "volume" | "mute" | "fullscreen" | "episode";
}

export function useVideoShortcuts({
  videoRef,
  containerRef,
  onTogglePlay,
  onToggleFullscreen,
  onNext,
  onPrev,
  enabled = true,
}: VideoShortcutsOptions) {
  const [toast, setToast] = useState<ShortcutToastInfo | null>(null);
  const [isIframeFocused, setIsIframeFocused] = useState(false);

  const showToast = useCallback((info: ShortcutToastInfo) => {
    setToast(info);
    const timer = setTimeout(() => setToast(null), 900);
    return () => clearTimeout(timer);
  }, []);

  const refocus = useCallback(() => {
    if (typeof window !== "undefined") {
      window.focus();
      setIsIframeFocused(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Detect when iframe takes focus (window blur)
    const handleWindowBlur = () => {
      setTimeout(() => {
        if (typeof document !== "undefined" && document.activeElement?.tagName === "IFRAME") {
          setIsIframeFocused(true);
        }
      }, 50);
    };

    const handleWindowFocus = () => {
      setIsIframeFocused(false);
    };

    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    // Auto-reclaim window focus whenever user points or moves mouse over the player area
    const container = containerRef?.current;
    const handlePointerOver = () => {
      if (document.activeElement?.tagName === "IFRAME") {
        window.focus();
      }
      setIsIframeFocused(false);
    };

    if (container) {
      container.addEventListener("mouseenter", handlePointerOver);
      container.addEventListener("mousemove", handlePointerOver);
    }

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      if (container) {
        container.removeEventListener("mouseenter", handlePointerOver);
        container.removeEventListener("mousemove", handlePointerOver);
      }
    };
  }, [enabled, containerRef]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in form inputs or modals
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const video = videoRef?.current;
      const key = e.key;

      // 1. Play / Pause: Space or K
      if (key === " " || key === "k" || key === "K") {
        e.preventDefault();
        if (onTogglePlay) {
          onTogglePlay();
        } else if (video) {
          if (video.paused) {
            video.play().catch(() => {});
            showToast({ text: "Putar", type: "play" });
          } else {
            video.pause();
            showToast({ text: "Jeda", type: "pause" });
          }
        }
      }

      // 2. Fullscreen: F
      else if (key === "f" || key === "F") {
        e.preventDefault();
        if (onToggleFullscreen) {
          onToggleFullscreen();
        } else {
          const targetElem = containerRef?.current || video;
          if (!document.fullscreenElement) {
            if (targetElem?.requestFullscreen) {
              targetElem.requestFullscreen().catch(() => {});
            } else if ((targetElem as any)?.webkitRequestFullscreen) {
              (targetElem as any).webkitRequestFullscreen();
            }
            showToast({ text: "Layar Penuh", type: "fullscreen" });
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
            } else if ((document as any)?.webkitExitFullscreen) {
              (document as any).webkitExitFullscreen();
            }
            showToast({ text: "Layar Biasa", type: "fullscreen" });
          }
        }
      }

      // 3. Mute / Unmute: M
      else if (key === "m" || key === "M") {
        e.preventDefault();
        if (video) {
          video.muted = !video.muted;
          showToast({
            text: video.muted ? "Suara Dibisukan" : "Suara Aktif",
            type: video.muted ? "mute" : "volume",
          });
        }
      }

      // 4. Seek Backward: Left Arrow or J (-10s)
      else if (key === "ArrowLeft" || key === "j" || key === "J") {
        e.preventDefault();
        if (video) {
          video.currentTime = Math.max(0, video.currentTime - 10);
          showToast({ text: "-10 detik", type: "seek_bwd" });
        }
      }

      // 5. Seek Forward: Right Arrow or L (+10s)
      else if (key === "ArrowRight" || key === "l" || key === "L") {
        e.preventDefault();
        if (video) {
          const dur = video.duration || 0;
          video.currentTime = dur > 0 ? Math.min(dur, video.currentTime + 10) : video.currentTime + 10;
          showToast({ text: "+10 detik", type: "seek_fwd" });
        }
      }

      // 6. Volume Up: Up Arrow (+10%)
      else if (key === "ArrowUp") {
        e.preventDefault();
        if (video) {
          video.volume = Math.min(1, Math.round((video.volume + 0.1) * 10) / 10);
          if (video.muted) video.muted = false;
          showToast({
            text: `Volume ${Math.round(video.volume * 100)}%`,
            type: "volume",
          });
        }
      }

      // 7. Volume Down: Down Arrow (-10%)
      else if (key === "ArrowDown") {
        e.preventDefault();
        if (video) {
          video.volume = Math.max(0, Math.round((video.volume - 0.1) * 10) / 10);
          showToast({
            text: `Volume ${Math.round(video.volume * 100)}%`,
            type: "volume",
          });
        }
      }

      // 8. Next Episode: N
      else if ((key === "n" || key === "N") && onNext) {
        e.preventDefault();
        onNext();
        showToast({ text: "Episode Berikutnya", type: "episode" });
      }

      // 9. Previous Episode: P
      else if ((key === "p" || key === "P") && onPrev) {
        e.preventDefault();
        onPrev();
        showToast({ text: "Episode Sebelumnya", type: "episode" });
      }

      // 10. Skip Intro / Opening (+85s): S
      else if (key === "s" || key === "S") {
        e.preventDefault();
        const video = videoRef?.current;
        if (video) {
          const dur = video.duration || 0;
          video.currentTime = dur > 0 ? Math.min(dur, video.currentTime + 85) : video.currentTime + 85;
        }
        showToast({ text: "⏩ Lewati Intro (+85s)", type: "seek_fwd" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    videoRef,
    containerRef,
    onTogglePlay,
    onToggleFullscreen,
    onNext,
    onPrev,
    showToast,
  ]);

  const skipIntro = useCallback((seconds = 85) => {
    const video = videoRef?.current;
    if (video) {
      const dur = video.duration || 0;
      video.currentTime = dur > 0 ? Math.min(dur, video.currentTime + seconds) : video.currentTime + seconds;
    }
    showToast({ text: `⏩ Lewati Intro (+${seconds}s)`, type: "seek_fwd" });
  }, [videoRef, showToast]);

  return { toast, isIframeFocused, refocus, skipIntro };
}

export function VideoShortcutToast({
  toast,
  isIframeFocused,
  onRefocus,
}: {
  toast: ShortcutToastInfo | null;
  isIframeFocused?: boolean;
  onRefocus?: () => void;
}) {
  return (
    <>
      {/* Toast Feedback */}
      {toast && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="px-5 py-2.5 rounded-2xl bg-black/85 backdrop-blur-md border border-white/20 text-white font-black text-sm tracking-wide shadow-2xl flex items-center gap-2">
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Floating Iframe Focus Recovery Pill */}
      {isIframeFocused && (
        <div
          onClick={onRefocus}
          className="absolute top-3 inset-x-0 mx-auto w-fit z-40 px-3.5 py-1.5 rounded-full bg-black/85 hover:bg-black text-amber-300 hover:text-amber-200 border border-amber-500/40 backdrop-blur-md shadow-xl text-[11px] font-semibold flex items-center gap-2 cursor-pointer animate-in fade-in slide-in-from-top-2 duration-200 transition-all active:scale-95"
          title="Klik di sini untuk mengaktifkan shortcut keyboard (Spasi, F, N, P)"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Iframe Aktif • Klik di sini / geser mouse untuk aktifkan Hotkey [Spasi / F / N / P]</span>
        </div>
      )}
    </>
  );
}
