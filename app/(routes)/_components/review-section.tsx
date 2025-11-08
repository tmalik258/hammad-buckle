"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import ReviewCard, { Review } from "./review-card";

interface ReviewSectionProps {
  reviews: Review[];
  className?: string;
}

const CarouselDots = ({
  api,
  className,
}: {
  api: CarouselApi | undefined;
  className?: string;
}) => {
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (count <= 1) return null;

  return (
    <div className={cn("flex gap-2", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-200",
            current === index + 1
              ? "bg-pink-500 w-6"
              : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
          )}
          onClick={() => api?.scrollTo(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};

export function ReviewSection({ reviews, className = "" }: ReviewSectionProps) {
  const [api, setApi] = React.useState<CarouselApi>();

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover why thousands of customers trust us for their shopping
            needs
          </p>
        </div>

        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full px-10"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {reviews.map((review) => (
              <CarouselItem
                key={review.id}
                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <ReviewCard review={review} />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Pagination dots */}
          <div className="flex justify-center mt-8">
            <CarouselDots api={api} />
          </div>
        </Carousel>
      </div>
    </section>
  );
}

// Sample data for demonstration
export const sampleReviews: Review[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    rating: 5,
    comment:
      "Amazing quality products and fast shipping! I&apos;ve been shopping here for months and never been disappointed. The customer service is exceptional.",
    date: "2 days ago",
    position: "Business Owner",
  },
  {
    id: "2",
    name: "Michael Chen",
    rating: 5,
    comment:
      "The best online shopping experience I&apos;ve had. Great prices, authentic products, and the packaging is always perfect. Highly recommend!",
    date: "1 week ago",
    position: "Business Owner",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    rating: 4,
    comment:
      "Love the variety of products available. The website is easy to navigate and the checkout process is smooth. Will definitely shop again.",
    date: "2 weeks ago",
    position: "Business Owner",
  },
  {
    id: "4",
    name: "David Thompson",
    rating: 5,
    comment:
      "Outstanding service from start to finish. The product quality exceeded my expectations and delivery was faster than promised.",
    date: "3 weeks ago",
    position: "Business Owner",
  },
  {
    id: "5",
    name: "Lisa Wang",
    rating: 5,
    comment:
      "Incredible selection and unbeatable prices. The customer support team helped me find exactly what I was looking for. Five stars!",
    date: "1 month ago",
    position: "Business Owner",
  },
];
