"use client";

import React, { useRef, useState } from "react";

interface DraggableCarouselProps {
  children: React.ReactNode;
  className?: string;
}

export default function DraggableCarousel({
  children,
  className = "",
}: DraggableCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    // Only drag with left mouse button
    if (e.button !== 0) return;

    isDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftRef.current = containerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDownRef.current || !containerRef.current) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.6;

    if (Math.abs(walk) > 6) {
      if (!isDragging) setIsDragging(true);
      hasMovedRef.current = true;
    }

    containerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDownRef.current = false;
    setTimeout(() => {
      setIsDragging(false);
      hasMovedRef.current = false;
    }, 60);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    // If the user dragged more than threshold, prevent firing link clicks
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onClickCapture={handleClickCapture}
      className={`flex items-stretch gap-3 sm:gap-4 overflow-x-auto select-none no-scrollbar scroll-smooth py-2.5 px-0.5 ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
      style={{
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {children}
    </div>
  );
}
