"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ProductImageSkeleton } from "../../_components/product-skeleton";
import { CircleArrowLeft, CircleArrowRight } from "lucide-react";

interface ProductImagesProps {
  images: string[];
  productName: string;
  brand?: string;
  loading?: boolean;
}

export function ProductImages({ 
  images, 
  productName, 
  brand, 
  loading = false 
}: ProductImagesProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (loading) {
    return <ProductImageSkeleton />;
  }

  if (!images || images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-[4/3] max-h-96 overflow-hidden rounded-2xl bg-gray-800 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No image available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] max-h-96 overflow-hidden rounded-2xl">
        <Image
          src={images[selectedImage]}
          alt={productName}
          fill
          className="object-cover rounded-2xl"
          priority
        />
        {brand && (
          <Badge className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-sm font-medium">
            {brand}
          </Badge>
        )}
        {/* Navigation arrows */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-between px-4">
            <button
              onClick={() => setSelectedImage(prev => (prev === 0 ? images.length - 1 : prev - 1))}
              className="rounded-full p-1 text-white group hover:fill-current transition-all cursor-pointer duration-300"
              aria-label="Previous image"
            >
              <CircleArrowLeft size={24} className="group-hover:fill-white group-hover:text-black transition-all duration-300" />
            </button>
            <button
              onClick={() => setSelectedImage(prev => (prev === images.length - 1 ? 0 : prev + 1))}
              className="rounded-full p-1 text-white group hover:fill-current transition-all cursor-pointer duration-300"
              aria-label="Next image"
            >
              <CircleArrowRight size={24} className="group-hover:fill-white group-hover:text-black transition-all duration-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductImages;
