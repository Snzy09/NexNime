"use client";

import React, { useState } from "react";
import { Film } from "lucide-react";

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  fallbackIcon?: React.ReactNode;
  aspectRatioClass?: string;
}

export default function ImageWithSkeleton({
  src,
  alt = "Cover thumbnail",
  className = "",
  containerClassName = "",
  aspectRatioClass = "",
  fallbackIcon,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#121218] ${aspectRatioClass} ${containerClassName}`}>
      {/* Skeleton Shimmer Placeholder while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-tr from-white/[0.03] via-white/[0.08] to-white/[0.02] animate-pulse">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20">
            {fallbackIcon || <Film className="w-4 h-4 animate-spin-slow" />}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
        </div>
      )}

      {/* Error Fallback */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-[#12121A] text-center text-[10px] text-gray-500 font-medium">
          <Film className="w-6 h-6 text-gray-600 mb-1" />
          <span className="line-clamp-1">{alt || "Gambar Tidak Tersedia"}</span>
        </div>
      ) : (
        /* Real Scraped Image */
        src && (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true);
              setIsLoaded(true);
            }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            } ${className}`}
            {...props}
          />
        )
      )}
    </div>
  );
}
