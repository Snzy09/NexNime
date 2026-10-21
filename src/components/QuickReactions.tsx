"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Flame } from "lucide-react";

export interface QuickReactionItem {
  key: string;
  emoji: string;
  label: string;
  activeColor: string;
  badgeActiveColor: string;
}

const REACTIONS: QuickReactionItem[] = [
  {
    key: "fire",
    emoji: "🔥",
    label: "Epic",
    activeColor: "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/20",
    badgeActiveColor: "bg-amber-500/30 text-amber-200 border-amber-500/40",
  },
  {
    key: "sad",
    emoji: "😭",
    label: "Sedih",
    activeColor: "bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-blue-500/20",
    badgeActiveColor: "bg-blue-500/30 text-blue-200 border-blue-500/40",
  },
  {
    key: "laugh",
    emoji: "😂",
    label: "Kocak",
    activeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-yellow-500/20",
    badgeActiveColor: "bg-yellow-500/30 text-yellow-200 border-yellow-500/40",
  },
  {
    key: "shock",
    emoji: "😱",
    label: "Plot Twist",
    activeColor: "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-purple-500/20",
    badgeActiveColor: "bg-purple-500/30 text-purple-200 border-purple-500/40",
  },
  {
    key: "love",
    emoji: "❤️",
    label: "Suka",
    activeColor: "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-500/20",
    badgeActiveColor: "bg-rose-500/30 text-rose-200 border-rose-500/40",
  },
];

interface Particle {
  id: number;
  emoji: string;
  xOffset: number;
}

interface QuickReactionsProps {
  contentId: string;
  title?: string;
  className?: string;
}

// Generate consistent baseline counts from content ID
function getBaseCounts(id: string): Record<string, number> {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  return {
    fire: (abs % 45) + 18,
    sad: ((abs >> 2) % 30) + 6,
    laugh: ((abs >> 4) % 35) + 12,
    shock: ((abs >> 6) % 28) + 8,
    love: ((abs >> 8) % 55) + 24,
  };
}

export default function QuickReactions({
  contentId,
  title = "Reaksi Cepat",
  className = "",
}: QuickReactionsProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({});
  const [particles, setParticles] = useState<Particle[]>([]);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Load reaction data on contentId change
  useEffect(() => {
    if (!contentId) return;
    const base = getBaseCounts(contentId);
    try {
      const stored = localStorage.getItem(`nexnime_react_${contentId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCounts(parsed.counts || base);
        setUserReactions(parsed.userReactions || {});
      } else {
        setCounts(base);
        setUserReactions({});
      }
    } catch {
      setCounts(base);
      setUserReactions({});
    }
  }, [contentId]);

  const handleToggle = (key: string, emoji: string) => {
    // Subtle haptic feedback if supported
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(20);
      } catch {}
    }

    const isCurrentActive = Boolean(userReactions[key]);
    const updatedUser = {
      ...userReactions,
      [key]: !isCurrentActive,
    };
    const updatedCounts = {
      ...counts,
      [key]: Math.max(0, (counts[key] || 0) + (isCurrentActive ? -1 : 1)),
    };

    setUserReactions(updatedUser);
    setCounts(updatedCounts);

    // Persist to localStorage
    try {
      localStorage.setItem(
        `nexnime_react_${contentId}`,
        JSON.stringify({
          counts: updatedCounts,
          userReactions: updatedUser,
        })
      );
    } catch {}

    // Spawn floating emoji particles on reaction activation
    if (!isCurrentActive) {
      const now = Date.now();
      const newParticles: Particle[] = [
        { id: now + 1, emoji, xOffset: -12 },
        { id: now + 2, emoji, xOffset: 0 },
        { id: now + 3, emoji, xOffset: 12 },
      ];

      setParticles((prev) => [...prev, ...newParticles]);

      // Auto clean up after animation ends
      setTimeout(() => {
        setParticles((prev) =>
          prev.filter((p) => !newParticles.some((np) => np.id === p.id))
        );
      }, 900);
    }
  };

  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div
      className={`relative rounded-2xl bg-[#111118]/80 border border-white/10 p-3.5 sm:p-4 shadow-xl backdrop-blur-md overflow-visible ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Flame className="w-4 h-4 fill-rose-500/30 text-rose-500" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>{title}</span>
              <span className="text-[10px] font-semibold text-gray-400 hidden sm:inline">
                • Bagikan impresimu!
              </span>
            </h3>
            <p className="text-[11px] text-gray-400 sm:hidden">Bagikan impresimu!</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>{totalReactions.toLocaleString()} Total Reaksi</span>
          </span>
        </div>
      </div>

      {/* Emoji Reaction Buttons */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 pt-3 overflow-x-auto no-scrollbar">
        {REACTIONS.map((item) => {
          const isActive = Boolean(userReactions[item.key]);
          const count = counts[item.key] || 0;

          return (
            <div key={item.key} className="relative flex-1 min-w-[58px]">
              <button
                ref={(el) => {
                  buttonRefs.current[item.key] = el;
                }}
                type="button"
                onClick={() => handleToggle(item.key, item.emoji)}
                className={`w-full group relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-1.5 sm:py-2 rounded-xl border transition-all duration-200 select-none active:scale-95 ${
                  isActive
                    ? `${item.activeColor} shadow-md scale-[1.02]`
                    : "bg-white/[0.03] hover:bg-white/[0.07] border-white/5 hover:border-white/15 text-gray-300"
                }`}
                title={`${item.label} (${count})`}
              >
                <span className="text-base sm:text-lg group-hover:scale-125 transition-transform duration-200">
                  {item.emoji}
                </span>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-semibold hidden md:inline">
                    {item.label}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                      isActive
                        ? item.badgeActiveColor
                        : "bg-white/10 text-gray-400 group-hover:text-gray-200"
                    }`}
                  >
                    {count}
                  </span>
                </div>
              </button>

              {/* Floating particles spawned over this button */}
              {particles.length > 0 &&
                particles
                  .filter((p) => p.emoji === item.emoji)
                  .map((p) => (
                    <span
                      key={p.id}
                      className="absolute top-0 left-1/2 text-lg sm:text-xl animate-float-particle pointer-events-none z-30"
                      style={{
                        transform: `translateX(calc(-50% + ${p.xOffset}px))`,
                      }}
                    >
                      {p.emoji}
                    </span>
                  ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
