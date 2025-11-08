"use client";

import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [api, setApi] = useState<CarouselApi>();

  const products = [
    {
      image: "/images/blue-goggles-avatar.png",
      name: "Premium Sneakers",
      rating: 4.9,
    },
    {
      image: "/images/astronaut-product.png",
      name: "Space Explorer",
      rating: 4.8,
    },
    {
      image: "/images/desk-image.png",
      name: "Modern Desk",
      rating: 4.6,
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="relative md:min-h-screen">
      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4 flex flex-col md:flex-row items-center justify-between max-md:gap-10 md:min-h-screen">
        {/* Left Content */}
        <div className="flex-1 max-w-2xl space-y-4 md:space-y-6 lg:space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Curated
              </span>
              <br />
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Collections
              </span>
            </h1>

            <p className="text-lg text-gray-300 max-w-lg">
              &quot;Discover premium edits crafted for every lifestyle.&quot;
            </p>
          </div>

          <hr className="border-t border-[#D793FE99] w-[80%]" />

          {/* User Statistics */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-white">500K</div>
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 border-2 border-white flex items-center justify-center text-white font-bold text-sm">
                  ?1
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 border-2 border-white flex items-center justify-center text-white font-bold text-sm">
                  ?2
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 border-2 border-white flex items-center justify-center text-white font-bold text-sm">
                  ?3
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm font-medium">Worldwide User</p>
          </div>
        </div>

        {/* Right Content - Product Carousel */}
        <div className="flex-1 flex justify-center relative">
          <div className="w-full max-w-2xl">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              setApi={setApi}
              className="w-full"
            >
              <CarouselContent>
                {products.map((product, index) => (
                  <CarouselItem key={index} className="max-h-[450px]">
                    <div className="relative h-full">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={500}
                        height={400}
                        className="w-full h-full rounded-2xl object-contain"
                      />

                      {/* Rating Badge */}
                      <Badge
                        variant="secondary"
                        className="absolute top-[30%] left-4 bg-black/30 backdrop-blur-sm border border-pink-400 hover:bg-pink-400 rounded-full px-4 py-2 text-white cursor-pointer transition-colors duration-300"
                      >
                        <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                        {product.rating}+ Overall Global Rating
                      </Badge>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
