import React from "react";

export default function HeroSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 animate-pulse">
      <div className="relative rounded-3xl overflow-hidden min-h-[380px] sm:min-h-[440px] md:min-h-[480px] bg-[#12121A] border border-white/5 p-6 sm:p-10 md:p-12 flex flex-col justify-between">
        {/* Top Badges */}
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-24 rounded-full bg-white/10" />
          <div className="h-6 w-16 rounded-full bg-white/10" />
          <div className="h-6 w-20 rounded-full bg-white/10" />
          <div className="h-6 w-16 rounded-full bg-white/10" />
        </div>

        {/* Center Text */}
        <div className="max-w-xl my-auto py-6 space-y-4">
          <div className="h-10 sm:h-14 w-3/4 rounded-xl bg-white/10" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded-lg bg-white/5" />
            <div className="h-4 w-5/6 rounded-lg bg-white/5" />
            <div className="h-4 w-2/3 rounded-lg bg-white/5" />
          </div>
          <div className="pt-2">
            <div className="h-12 w-44 rounded-full bg-amber-400/20 border border-amber-400/30" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-7 w-20 rounded-full bg-white/5" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10" />
            <div className="w-8 h-8 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
