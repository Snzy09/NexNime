import React from "react";

export default function MangaSpotlightSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-4">
      {/* Search Input Skeleton */}
      <div className="rounded-2xl bg-[#121218] border border-white/5 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="h-11 flex-1 rounded-xl bg-[#181824]" />
          <div className="h-11 w-32 rounded-xl bg-amber-400/20" />
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <div className="h-4 w-20 rounded bg-white/10" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-5 w-24 rounded-full bg-white/5" />
          ))}
        </div>
      </div>

      {/* Featured Banner Skeleton */}
      <div className="rounded-3xl bg-[#161622] border border-white/10 p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 lg:col-span-3 flex justify-center">
            <div className="aspect-[3/4] w-48 sm:w-56 rounded-2xl bg-white/10" />
          </div>
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            <div className="flex gap-2">
              <div className="h-5 w-24 rounded bg-rose-500/20" />
              <div className="h-5 w-12 rounded bg-amber-400/20" />
              <div className="h-5 w-24 rounded bg-white/5" />
            </div>
            <div className="h-8 sm:h-10 w-2/3 rounded-xl bg-white/10" />
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-5 w-16 rounded-full bg-white/5" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-full rounded bg-white/5" />
              <div className="h-3.5 w-4/5 rounded bg-white/5" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="h-10 w-36 rounded-full bg-emerald-500/30" />
              <div className="h-10 w-32 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Slider Selector Skeleton */}
      <div className="rounded-xl bg-[#121218] border border-white/5 p-2 flex items-center justify-between">
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 w-28 rounded-lg bg-white/5" />
          ))}
        </div>
        <div className="h-7 w-16 rounded-lg bg-white/5" />
      </div>
    </div>
  );
}
