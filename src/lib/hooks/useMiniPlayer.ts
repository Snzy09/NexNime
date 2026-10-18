"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface MiniPlayerOptions {
  videoRef?: React.RefObject<HTMLVideoElement>;
  containerRef?: React.RefObject<HTMLElement>;
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

  // 3. Register Media Session API so background playback never pauses when minimized
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
    } catch {}
  }, [options?.title, options?.poster, options?.videoRef, options?.onNext, options?.onPrev]);

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

  // 4. Toggle Picture-in-Picture: floats video out of the browser into an OS-level window
  // that remains visible and playing even when the browser or app is completely minimized!
  const togglePictureInPicture = useCallback(async () => {
    try {
      const video = options?.videoRef?.current;

      // A. Standard HTML5 Video Picture-in-Picture
      if (video && document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setIsPipActive(false);
        } else {
          await video.requestPictureInPicture();
          setIsPipActive(true);
        }
        return;
      }

      // B. Fallback / Iframe: Activate in-app floating Mini Player
      toggleManualMini();
    } catch (err) {
      console.warn("PiP toggle error, falling back to in-app mini-player:", err);
      toggleManualMini();
    }
  }, [options?.videoRef]);

  // Is mini player active (either scrolled out of view or manually toggled by user, unless dismissed)
  const isMini = (isManualMini || isOutOfView) && !isDismissed;

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
