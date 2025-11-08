"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star, Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  isNew?: boolean;
  discount?: number;
}

interface CarouselSectionProps {
  title?: string;
  subtitle?: string;
  products: Product[];
}

export function CarouselSection({
  title = "You May Also Like",
  subtitle = "Discover more products that complement your purchase",
  products
}: CarouselSectionProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                    <CardContent className="p-0">
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.isNew && (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              New
                            </Badge>
                          )}
                          {product.discount && (
                            <Badge className="bg-red-500 hover:bg-red-600">
                              -{product.discount}%
                            </Badge>
                          )}
                        </div>

                        {/* Favorite Button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                          onClick={() => toggleFavorite(product.id)}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              favorites.has(product.id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-600"
                            }`}
                          />
                        </Button>

                        {/* Quick Add to Cart */}
                        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button className="w-full bg-black/80 hover:bg-black text-white">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Quick Add
                          </Button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <div className="mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {product.name}
                        </h3>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {renderStars(product.rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            ({product.reviewCount})
                          </span>
                        </div>
                        
                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            KWD {product.price.toFixed(3)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              KWD {product.originalPrice.toFixed(3)}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation Buttons */}
            <CarouselPrevious className="-left-12 bg-white shadow-lg border-gray-200 hover:bg-gray-50" />
            <CarouselNext className="-right-12 bg-white shadow-lg border-gray-200 hover:bg-gray-50" />
          </Carousel>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="px-8">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}