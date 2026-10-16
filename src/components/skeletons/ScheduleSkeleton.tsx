import React from "react";

export default function ScheduleSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      <div className="rounded-2xl bg-[#121218] border border-white/5 p-4 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10" />
            <div className="space-y-1.5">
              <div className="h-4 w-36 rounded bg-white/10" />
              <div className="h-3 w-48 rounded bg-white/5" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-24 rounded-lg bg-white/5" />
            <div className="h-7 w-24 rounded-lg bg-white/5" />
          </div>
        </div>

        {/* Featured Live Banner */}
        <div className="h-24 w-full rounded-xl bg-gradient-to-r from-amber-950/30 via-[#151520] to-[#121218] border border-white/5" />

        {/* 5 Horizontal Mini Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-[#181822] border border-white/5">
              <div className="w-11 h-14 rounded-lg bg-white/10 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-full rounded bg-white/10" />
                <div className="h-2.5 w-16 rounded bg-emerald-500/20" />
                <div className="h-2.5 w-12 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
