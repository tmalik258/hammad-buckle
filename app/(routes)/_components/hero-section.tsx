"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

export default function HeroSection() {
  const [api, setApi] = useState<CarouselApi>();

  const products = [
    {
      image: "/images/sneakers-image.png",
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
    <section className="relative min-h-screen max-md:pt-20">
      {/* Main Content Container */}
      <div className="relative z-50 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between min-h-screen container mx-auto gap-8 lg:gap-12">
        {/* Left Content */}
        <div className="flex-1 max-w-2xl text-center lg:text-left">
          {/* Main Heading */}
          <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
              Smart Finds
              <br />
              <span className="text-primary">Curated For You</span>
            </h1>

            <p className="text-base sm:text-lg font-medium text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Shop now and get fast delivery in{" "}
              <span className="text-primary">Kuwait</span>!
            </p>
          </div>

          {/* CTA Button */}
          <div className="mb-8 sm:mb-16">
            <Button
              size="lg"
              className="bg-transparent border-2 border-primary hover:bg-primary text-primary hover:text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none rounded-tr-2xl rounded-bl-2xl cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              asChild
            >
              <Link href="/products">Explore Now</Link>
            </Button>
          </div>
        </div>

        {/* Right Content - Product Carousel */}
        <div className="flex-1 flex justify-center relative w-full lg:w-auto">
          <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl">
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
                  <CarouselItem key={index}>
                    <div className="relative">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={500}
                        height={400}
                        className="w-full h-auto rounded-2xl object-contain"
                      />

                      {/* Rating Badge */}
                      <Badge
                        variant="secondary"
                        className="absolute top-[50%] sm:top-[60%] right-2 sm:right-4 bg-card/80 backdrop-blur-sm border border-border hover:bg-accent/40 rounded-none rounded-tr-2xl rounded-bl-2xl px-2 sm:px-4 py-1 sm:py-2 text-foreground cursor-pointer transition-colors duration-300 text-xs sm:text-sm"
                      >
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        {product.rating}/5
                      </Badge>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-muted-foreground text-sm mb-2">Scroll to Explore</p>
        <div className="w-6 h-10 border-2 border-border rounded-full flex justify-center mx-auto animate-bounce">
          <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
