"use client";

import React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Deal {
  id: string;
  title: string;
  image: string;
  alt: string;
}

export default function DealsSection() {
  // Deals data array
  const deals: Deal[] = [
    {
      id: "hair-accessories",
      title: "Hair Accessories",
      image: "/images/hair-dryer-image.png",
      alt: "Hair Accessories",
    },
    {
      id: "essential-oil",
      title: "Essential Oil",
      image: "/images/essential-oil.png",
      alt: "Essential Oil",
    },
    {
      id: "wireless-buds",
      title: "Wireless Buds",
      image: "/images/wireless-buds.jpg",
      alt: "Wireless Buds",
    },
    {
      id: "aromatherapy",
      title: "Aromatherapy Essential Oil Diffuser",
      image: "/images/image-53.png",
      alt: "Aromatherapy Essential Oil Diffuser",
    },
    {
      id: "mobile-accessories",
      title: "Mobile Accessories",
      image: "/images/image-54.png",
      alt: "Mobile Accessories",
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 relative">
      <div className="container mx-auto overflow-hidden">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12 lg:mb-16 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4">
            <span className="text-primary">
              Deals of the, Day
            </span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto sm:mx-0">
            Sign up for our newsletter &amp; get early access to sales, special
            discounts, and the latest trends - straight to your inbox!
          </p>
        </div>

        {/* Deal Cards - Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-dvw px-16"
        >
          <CarouselContent className="py-10">
            {deals.map((deal, index) => (
              <CarouselItem key={`${deal.id}-${index}`} className="basis-full sm:basis-1/2 lg:basis-1/4 h-full">
                <div className="relative cursor-pointer h-full">
                  <div className="border border-border hover:border-primary transition-all duration-300 min-h-80 sm:min-h-88 lg:min-h-96 rounded-[3rem] hover:shadow-lg hover:shadow-primary/20">
                    <div className="rounded-[3rem] p-4 sm:p-5 lg:p-6 h-full border-0">
                      <div className="relative h-64 mb-3 sm:mb-4 overflow-hidden rounded-[3rem] bg-card/80">
                        <Image
                          src={deal.image}
                          alt={deal.alt}
                          width={800}
                          height={800}
                          className="object-cover rounded-[3rem] w-full h-full hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground text-center leading-tight">
                          {deal.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex left-4 bg-card/80 border-border hover:bg-accent/40 text-foreground" />
          <CarouselNext className="hidden sm:flex right-4 bg-card/80 border-border hover:bg-accent/40 text-foreground" />
        </Carousel>
      </div>
    </section>
  );
}
