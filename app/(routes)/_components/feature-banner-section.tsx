"use client"

import Image from "next/image";
import Link from "next/link";

interface FeatureBannerSectionProps {
  className?: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Premium Quality",
    description: "Crafted from the finest materials with attention to every detail"
  },
  {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Fast Delivery",
    description: "Quick and secure shipping to get your order to you promptly"
  },
  {
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    title: "Satisfaction Guaranteed",
    description: "Love your purchase or we'll make it right with our guarantee"
  },
  {
    icon: "M12 15c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    title: "Expert Support",
    description: "Our knowledgeable team is here to help with any questions"
  }
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <div 
      className="text-center group cursor-pointer"
      style={{
        animationDelay: `${index * 0.1}s`,
        animation: "fadeInUp 0.6s ease-out forwards"
      }}
    >
      <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-[#FFF8E7] rounded-full mb-4 group-hover:bg-black/90 transition-colors duration-200">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-black mb-2 group-hover:text-black/80 transition-colors duration-200">
        {feature.title}
      </h3>
      <p className="text-black/70 leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

export default function FeatureBannerSection({ className = "" }: FeatureBannerSectionProps) {
  return (
    <section 
      className={`py-16 ${className}`}
      role="region"
      aria-label="Features and benefits"
    >
      <div className="container mx-auto px-4">
        {/* Top Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Main Banner */}
        <div className="relative bg-gradient-to-r from-black to-black/90 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center p-8 md:p-12">
            {/* Content */}
            <div className="space-y-6">
              <div className="inline-block bg-[#FFF8E7]/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-[#FFF8E7] text-sm font-medium">Limited Time Offer</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-[#FFF8E7] leading-tight">
                Craft Your Perfect Style
              </h2>
              
              <p className="text-[#FFF8E7]/90 text-lg leading-relaxed">
                Every belt buckle tells a story. Our master craftsmen combine traditional techniques 
                with modern design to create pieces that elevate your personal style and make a statement.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/custom"
                  className="inline-flex items-center justify-center px-8 py-3 text-black font-medium rounded-lg hover:bg-[#FFF8E7]/90 transition-colors duration-200 cursor-pointer"
                >
                  Customize Yours
                </Link>
                <Link
                  href="/collections"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-[#FFF8E7] text-[#FFF8E7] font-medium rounded-lg hover:hover:text-black transition-all duration-200 cursor-pointer"
                >
                  Browse Collections
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative aspect-square max-w-md mx-auto">
                <Image
                  src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Premium%20belt%20buckle%20crafting%20process%2C%20artisan%20at%20work%2C%20traditional%20craftsmanship%2C%20handcrafted%20quality%2C%20professional%20workshop%20photography&image_size=square_hd"
                  alt="Master craftsman creating premium belt buckle"
                  fill
                  className="object-cover rounded-2xl shadow-2xl"
                />
              </div>
              
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 text-black rounded-full p-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-xs font-medium">Handmade</div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-20 h-20 bg-[#FFF8E7]/10 rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-[#FFF8E7]/5 rounded-full"></div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-black/70 mb-4">
            Join thousands of satisfied customers who trust our craftsmanship
          </p>
          <div className="flex justify-center space-x-8 text-sm text-black/60">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Free Shipping on Orders Over $100</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>30-Day Money Back Guarantee</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Secure Payment Processing</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}