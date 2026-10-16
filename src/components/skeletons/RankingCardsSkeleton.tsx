import React from "react";

export default function RankingCardsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10" />
            <div className="h-6 w-48 rounded-lg bg-white/10" />
          </div>
          <div className="h-3 w-64 rounded bg-white/5" />
        </div>
        <div className="h-4 w-24 rounded bg-white/5" />
      </div>

      {/* 5 Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden bg-[#13131A] border border-white/5 flex flex-col"
          >
            <div className="relative aspect-[2/3] w-full bg-[#181822] overflow-hidden">
              <div className="absolute top-2 left-2 h-4 w-12 rounded bg-white/10" />
              <div className="absolute top-2 right-2 h-4 w-10 rounded bg-white/10" />
              <div className="absolute bottom-2 left-2 h-8 w-10 rounded bg-white/10" />
            </div>
            <div className="p-3 space-y-2">
              <div className="h-3.5 w-full rounded bg-white/10" />
              <div className="h-3 w-3/4 rounded bg-white/5" />
              <div className="flex justify-between pt-2 border-t border-white/5">
                <div className="h-3 w-8 rounded bg-white/5" />
                <div className="h-3 w-10 rounded bg-emerald-500/20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
