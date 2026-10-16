import React from "react";

export default function CatalogGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-36 rounded bg-amber-400/20" />
          <div className="h-7 w-64 rounded bg-white/10" />
          <div className="h-3 w-80 rounded bg-white/5" />
        </div>
        <div className="h-7 w-48 rounded-full bg-white/5" />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-white/5">
        <div className="h-7 w-28 rounded-lg bg-amber-400/20" />
        <div className="h-7 w-40 rounded-lg bg-white/5" />
        <div className="h-7 w-36 rounded-lg bg-white/5" />
        <div className="h-7 flex-1 min-w-[200px] rounded-lg bg-white/5" />
      </div>

      {/* Search & Dropdown Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#121218] p-3 rounded-xl border border-white/5">
        <div className="sm:col-span-5 h-9 rounded-lg bg-[#181822]" />
        <div className="sm:col-span-3 h-9 rounded-lg bg-[#181822]" />
        <div className="sm:col-span-2 h-9 rounded-lg bg-[#181822]" />
        <div className="sm:col-span-2 h-9 rounded-lg bg-[#181822]" />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden bg-[#13131A] border border-white/5 flex flex-col">
            <div className="relative aspect-[2/3] w-full bg-[#181822]">
              <div className="absolute top-2 left-2 h-3.5 w-10 rounded bg-white/10" />
              <div className="absolute top-2 right-2 h-3.5 w-10 rounded bg-white/10" />
            </div>
            <div className="p-2 sm:p-2.5 space-y-2">
              <div className="h-3.5 w-full rounded bg-white/10" />
              <div className="h-3 w-2/3 rounded bg-white/5" />
              <div className="flex justify-between pt-1.5 border-t border-white/5">
                <div className="h-2.5 w-6 rounded bg-white/5" />
                <div className="h-2.5 w-8 rounded bg-emerald-500/20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
