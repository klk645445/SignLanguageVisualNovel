"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface BackgroundProps {
  src?: string;
  alt?: string;
  transition?: "fade" | "slide" | "none";
  fallbackColor?: string;
}

export default function Background({
  src,
  alt = "Background",
  transition = "fade",
  fallbackColor = "#1a1a2e",
}: BackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (src !== currentSrc) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setCurrentSrc(src);
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [src, currentSrc]);

  const transitionClasses = {
    fade: `transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`,
    slide: `transition-transform duration-500 ${isTransitioning ? "-translate-x-full" : "translate-x-0"}`,
    none: "",
  };

  // If no source provided, show gradient background
  if (!currentSrc) {
    return (
      <div
        className={`absolute inset-0 ${transitionClasses[transition]}`}
        style={{
          background: `linear-gradient(135deg, ${fallbackColor} 0%, #16213e 50%, #0f3460 100%)`,
        }}
      />
    );
  }

  return (
    <div className={`absolute inset-0 ${transitionClasses[transition]}`}>
      {/* Fallback gradient while image loads */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
        style={{
          background: `linear-gradient(135deg, ${fallbackColor} 0%, #16213e 50%, #0f3460 100%)`,
        }}
      />

      {/* Background image */}
      <Image
        src={currentSrc}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(false)}
        priority
      />

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
    </div>
  );
}
