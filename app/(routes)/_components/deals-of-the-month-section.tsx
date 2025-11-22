"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface DealsOfTheMonthSectionProps {
  className?: string;
}

interface DealProduct {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  image: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const dealProducts: DealProduct[] = [
  {
    id: "1",
    name: "Executive Leather Belt",
    description: "Premium full-grain leather with solid brass buckle",
    originalPrice: 149.99,
    salePrice: 99.99,
    discount: 33,
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Executive%20leather%20belt%20with%20solid%20brass%20buckle%2C%20premium%20quality%2C%20professional%20product%20photography%2C%20luxury%20styling%2C%20elegant%20display&image_size=square_hd"
  },
  {
    id: "2",
    name: "Classic Western Buckle",
    description: "Handcrafted silver-tone buckle with intricate details",
    originalPrice: 89.99,
    salePrice: 59.99,
    discount: 33,
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Classic%20western%20belt%20buckle%2C%20silver%20tone%2C%20intricate%20detailed%20design%2C%20handcrafted%20quality%2C%20professional%20product%20photography&image_size=square_hd"
  },
  {
    id: "3",
    name: "Modern Minimalist Set",
    description: "Sleek contemporary design with matte finish",
    originalPrice: 119.99,
    salePrice: 79.99,
    discount: 33,
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Modern%20minimalist%20belt%20buckle%20set%2C%20contemporary%20design%2C%20matte%20finish%2C%20sleek%20professional%20photography&image_size=square_hd"
  }
];

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 7, hours: 12, minutes: 30, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="bg-black text-[#FFF8E7] rounded-lg p-4 text-center min-w-[80px]">
      <div className="text-2xl font-bold">{value.toString().padStart(2, '0')}</div>
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );

  return (
    <div className="flex justify-center space-x-4 mb-8">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Mins" />
      <TimeUnit value={timeLeft.seconds} label="Secs" />
    </div>
  );
}

export default function DealsOfTheMonthSection({ className = "" }: DealsOfTheMonthSectionProps) {
  return (
    <section 
      className={`py-16 ${className}`}
      role="region"
      aria-label="Deals of the month"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Deals of the Month
          </h2>
          <p className="text-black/70 max-w-2xl mx-auto mb-8">
            Don&apos;t miss out on our exclusive monthly deals. Premium quality belt buckles at unbeatable prices.
          </p>
          
          <CountdownTimer />
          
          <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            Limited Time Offer - Ends Soon!
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dealProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{product.discount}%
                </div>
                <div className="absolute top-4 right-4 bg-black text-[#FFF8E7] px-3 py-1 rounded-full text-xs font-medium">
                  HOT DEAL
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-black mb-2">{product.name}</h3>
                <p className="text-black/70 text-sm mb-4">{product.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-black">${product.salePrice}</span>
                    <span className="text-lg text-black/50 line-through">${product.originalPrice}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    href={`/product/${product.id}`}
                    className="flex-1 bg-black text-[#FFF8E7] py-3 rounded-lg text-center font-medium hover:bg-black/90 transition-colors duration-200"
                  >
                    View Details
                  </Link>
                  <button
                    type="button"
                    className="px-4 py-3 border-2 border-black text-black rounded-lg hover:bg-black hover:text-[#FFF8E7] transition-all duration-200"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/deals"
            className="inline-flex items-center px-8 py-3 bg-black text-[#FFF8E7] font-medium rounded-lg hover:bg-black/90 transition-colors duration-200"
          >
            View All Deals
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}