"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface UseSleepTimerOptions {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onSleep?: () => void;
  onWake?: () => void;
}

export function useSleepTimer(options?: UseSleepTimerOptions) {
  // null = off, number > 0 = minutes, -1 = end of current episode
  const [sleepOption, setSleepOption] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger sleep action
  const triggerSleep = useCallback(() => {
    setIsSleeping(true);
    setSleepOption(null);
    setSecondsRemaining(null);

    // Pause HTML5 video if present
    const video = options?.videoRef?.current;
    if (video) {
      try {
        video.pause();
      } catch {}
    }

    // Safety fallback: pause any HTML5 videos and broadcast pause commands to iframes
    if (typeof document !== "undefined") {
      try {
        document.querySelectorAll("video").forEach((v) => {
          try {
            v.pause();
          } catch {}
        });
      } catch {}

      try {
        document.querySelectorAll("iframe").forEach((ifr) => {
          try {
            ifr.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            ifr.contentWindow?.postMessage(JSON.stringify({ method: "pause" }), "*");
            ifr.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "pauseVideo" }), "*");
            ifr.contentWindow?.postMessage("pause", "*");
          } catch {}
        });
      } catch {}
    }

    // Exit Picture-in-Picture if active
    if (typeof document !== "undefined" && document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    }

    if (options?.onSleep) {
      options.onSleep();
    }
  }, [options]);

  // Set timer option: 15, 30, 45, 60, -1 (end of ep), or null (cancel)
  const setTimer = useCallback(
    (minutes: number | null) => {
      setIsMenuOpen(false);
      setSleepOption(minutes);
      setIsSleeping(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (minutes === null) {
        setSecondsRemaining(null);
        return;
      }

      if (minutes === -1) {
        // End of episode mode
        setSecondsRemaining(null);
        return;
      }

      // Countdown in seconds
      const totalSecs = minutes * 60;
      setSecondsRemaining(totalSecs);

      const expireTime = Date.now() + totalSecs * 1000;

      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.round((expireTime - Date.now()) / 1000));
        setSecondsRemaining(remaining);

        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          triggerSleep();
        }
      }, 1000);
    },
    [triggerSleep]
  );

  // Hook to call when current episode ends
  const notifyEpisodeEnded = useCallback(() => {
    if (sleepOption === -1) {
      triggerSleep();
      return true; // indicates sleep triggered, caller should avoid auto-next
    }
    return false;
  }, [sleepOption, triggerSleep]);

  // Wake up and continue watching
  const wakeUp = useCallback(() => {
    setIsSleeping(false);
    setSleepOption(null);
    setSecondsRemaining(null);

    const video = options?.videoRef?.current;
    if (video) {
      try {
        video.play().catch(() => {});
      } catch {}
    }

    if (options?.onWake) {
      options.onWake();
    }
  }, [options]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Format remaining time for button badge (e.g. "14m" or "28s")
  const formattedRemaining = (() => {
    if (sleepOption === -1) return "Akhir Ep";
    if (secondsRemaining === null) return null;
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    if (mins > 0) return `${mins}m`;
    return `${secs}s`;
  })();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  return {
    sleepOption,
    secondsRemaining,
    formattedRemaining,
    isSleeping,
    isMenuOpen,
    setIsMenuOpen,
    toggleMenu,
    setTimer,
    wakeUp,
    notifyEpisodeEnded,
  };
}
