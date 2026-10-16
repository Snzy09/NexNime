import React from "react";

export default function DrakorSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-5">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10" />
            <div className="h-6 w-52 rounded-lg bg-white/10" />
          </div>
          <div className="h-3 w-64 rounded bg-white/5" />
        </div>
        <div className="h-4 w-20 rounded bg-white/5" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden bg-[#13131A] border border-white/5 flex flex-col">
            <div className="aspect-[2/3] w-full bg-[#181822] relative">
              <div className="absolute top-2 left-2 h-3.5 w-12 rounded bg-blue-500/20" />
              <div className="absolute top-2 right-2 h-3.5 w-8 rounded bg-white/10" />
            </div>
            <div className="p-2.5 space-y-2">
              <div className="h-3.5 w-full rounded bg-white/10" />
              <div className="flex justify-between pt-1 border-t border-white/5">
                <div className="h-2.5 w-8 rounded bg-white/5" />
                <div className="h-2.5 w-12 rounded bg-blue-500/20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
