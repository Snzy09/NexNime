"use client";

import { useState, useEffect, useRef } from "react";

export function useMiniPlayer() {
  const [isOutOfView, setIsOutOfView] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Triggered when the top sentinel is scrolled above viewport
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setIsOutOfView(true);
        } else if (entry.isIntersecting) {
          setIsOutOfView(false);
          setIsDismissed(false); // Auto reset dismiss when back to main player view
        }
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const scrollToPlayer = () => {
    if (sentinelRef.current) {
      sentinelRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const dismissMini = () => {
    setIsDismissed(true);
  };

  return {
    isMini: isOutOfView && !isDismissed,
    sentinelRef,
    scrollToPlayer,
    dismissMini,
  };
}
