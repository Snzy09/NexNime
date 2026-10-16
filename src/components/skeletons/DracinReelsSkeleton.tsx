import React from "react";

export default function DracinReelsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-5">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10" />
            <div className="h-6 w-56 rounded-lg bg-white/10" />
          </div>
          <div className="h-3 w-72 rounded bg-white/5" />
        </div>
        <div className="h-4 w-28 rounded bg-white/5" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[9/16] rounded-2xl bg-[#13131A] border border-white/5 relative p-4 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between">
              <div className="h-4 w-16 rounded-full bg-rose-500/20" />
              <div className="h-4 w-12 rounded-full bg-white/10" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-rose-400/20" />
              <div className="h-4 w-full rounded bg-white/10" />
              <div className="h-3 w-3/4 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
