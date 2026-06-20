"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";

interface EnhancedImageProps {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackInitial?: string;
  onError?: () => void;
  priority?: boolean;
}

export function EnhancedImage({
  src,
  alt,
  width,
  height,
  className = "",
  fallbackInitial,
  onError,
  priority = false,
}: EnhancedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 1; // Reduced retries for faster fallback

  // Preload image for faster display
  useEffect(() => {
    if (src && !imageError) {
      const img = new window.Image();
      img.onload = () => {
        setImageLoaded(true);
        setImageError(false);
      };
      img.onerror = () => {
        setImageError(true);
        onError?.();
      };
      img.src = src;
    }
  }, [src, onError]);

  const handleImageError = useCallback(() => {
    if (retryCount < maxRetries && src) {
      setRetryCount(prev => prev + 1);
      setImageError(false);
      setImageLoaded(false);
    } else {
      setImageError(true);
      onError?.();
    }
  }, [src, retryCount, maxRetries, onError]);

  // Show fallback immediately if no src or image failed to load
  if (!src || imageError) {
    return (
      <div 
        className={`rounded-full bg-zinc-900 flex items-center justify-center text-white font-medium ${className}`}
        style={{ width, height }}
      >
        {fallbackInitial || 'U'}
      </div>
    );
  }

  // Show fallback while image is loading (for better perceived performance)
  if (!imageLoaded && !priority) {
    return (
      <div 
        className={`rounded-full bg-zinc-900 flex items-center justify-center text-white font-medium ${className}`}
        style={{ width, height }}
      >
        {fallbackInitial || 'U'}
      </div>
    );
  }

  return (
    <Image
      src={retryCount > 0 ? `${src}?retry=${retryCount}` : src}
      alt={alt}
      width={width}
      height={height}
      className={`rounded-full object-cover ${className}`}
      onError={handleImageError}
      onLoad={() => setImageLoaded(true)}
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      sizes={`${width}px`}
    />
  );
}