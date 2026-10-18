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

  const showToast = useCallback((info: ShortcutToastInfo) => {
    setToast(info);
    const timer = setTimeout(() => setToast(null), 900);
    return () => clearTimeout(timer);
  }, []);

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

  return { toast };
}

export function VideoShortcutToast({ toast }: { toast: ShortcutToastInfo | null }) {
  if (!toast) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
      <div className="px-5 py-2.5 rounded-2xl bg-black/85 backdrop-blur-md border border-white/20 text-white font-black text-sm tracking-wide shadow-2xl flex items-center gap-2">
        <span>{toast.text}</span>
      </div>
    </div>
  );
}
