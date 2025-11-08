"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Category {
  id: string;
  name: string;
  image: string;
  alt: string;
}

const CategorySection = () => {
  // Categories data array
  const categories: Category[] = [
    {
      id: "fashion",
      name: "Fashion",
      image: "/images/astronaut-product.png",
      alt: "Fashion",
    },
    {
      id: "shoes",
      name: "Shoes",
      image: "/images/sneakers-image.png",
      alt: "Shoes",
    },
    {
      id: "ergonomic",
      name: "Ergonomic",
      image: "/images/desk-image.png",
      alt: "Ergonomic",
    },
    {
      id: "car-stuff",
      name: "Car Stuff",
      image: "/images/image-52.png",
      alt: "Car Stuff",
    },
  ];

  return (
    <section className="relative md:py-20 px-6 max-w-dvw overflow-hidden">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Rotating 3D Sphere */}
          <div className="flex justify-center">
            <div className="relative w-full z-0">
              <Image
                src="/images/rotate-shine-landing.png"
                alt="3D Rotating Sphere"
                width={320}
                height={320}
                className="w-full h-full object-contain animate-spin-slow"
                priority
              />
            </div>
          </div>

          {/* Center - Text Content */}
          <div className="text-center lg:text-left space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              <span className="text-primary">Thousands</span>{" "}
              of products.
              <br />
              One seamless{" "}
              <span className="text-primary">experience.</span>
              <br />
              <span className="text-primary">One Click Away!</span>
            </h2>
          </div>
        </div>

        {/* Metallic Image */}
        <div className="absolute -right-32 w-70 h-70 max-md:hidden">
          <Image
            src="/images/kateerin-metallic.png"
            alt="Metallic Product"
            width={320}
            height={320}
            className="w-full h-full object-contain rounded-[4rem] rotate-45"
            priority
          />
        </div>

        {/* Bottom section - Categories */}
        <div className="mt-20">
          <div className="mb-12">
            <h3 className="text-4xl lg:text-6xl font-bold mb-4">
              <span>Shop </span>
              <span className="text-primary">smarter</span>
              <span> live</span>
              <br />
              <span>better</span>
            </h3>
            <p className="text-muted-foreground text-2xl">
              Explore our best categories!
            </p>
            <Button className="mt-5 bg-transparent border-2 border-primary hover:bg-primary text-primary hover:text-primary-foreground px-8 py-4 text-lg font-semibold rounded-none rounded-tr-2xl rounded-bl-2xl cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Explore Now
            </Button>
          </div>

          {/* Category Cards - Carousel */}
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {categories.map((category, index) => (
                <CarouselItem key={`${category.id}-${index}`} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="space-y-4 flex-shrink-0 w-full h-96 cursor-pointer">
                    <div className="rounded-[3.5rem] p-8 pb-0 h-80 transition-all duration-300">
                      <div className="aspect-square rounded-2xl flex items-center justify-center mt-auto">
                        <Image
                          src={category.image}
                          alt={category.alt}
                          width={120}
                          height={120}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      </div>
                    </div>
                    <h4 className="text-white font-semibold text-center">{category.name}</h4>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-12 bg-pink-400/20 border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white" />
            <CarouselNext className="hidden sm:flex -right-12 bg-pink-400/20 border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
