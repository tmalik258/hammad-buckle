import Image from "next/image";
import Link from "next/link";

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className = "" }: HeroSectionProps) {
  return (
    <section 
      className={`relative py-20 md:py-32 ${className}`}
      role="banner"
      aria-label="Hero section"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
                Premium Leather
                <span className="block">Belt Buckles</span>
              </h1>
              <p className="text-lg md:text-xl text-black/80 max-w-lg">
                Handcrafted with precision and designed for those who appreciate quality. 
                Elevate your style with our exclusive collection of premium belt buckles.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-3 bg-black text-[#FFF8E7] font-medium rounded-lg hover:bg-black/90 transition-colors duration-200 cursor-pointer"
                aria-label="Shop Now - Browse our premium belt buckles"
              >
                Shop Now
              </Link>
              <Link
                href="/collections"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-black text-black font-medium rounded-lg hover:bg-black hover:text-[#FFF8E7] transition-all duration-200 cursor-pointer"
                aria-label="View Collections - Explore our exclusive collections"
              >
                View Collections
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-black/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-black">500+</div>
                <div className="text-sm text-black/70">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">50+</div>
                <div className="text-sm text-black/70">Unique Designs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">5+</div>
                <div className="text-sm text-black/70">Years Experience</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent rounded-3xl"></div>
              <Image
                src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Premium%20leather%20belt%20buckle%20on%20elegant%20display%2C%20luxury%20product%20photography%2C%20high-end%20styling%2C%20professional%20lighting%2C%20sophisticated%20background&image_size=square_hd"
                alt="Premium leather belt buckle showcase"
                fill
                className="object-cover rounded-3xl shadow-2xl"
                priority
              />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-black rounded-full flex items-center justify-center shadow-lg">
              <span className="text-[#FFF8E7] text-xs font-bold text-center leading-tight">
                NEW<br/>ARRIVAL
              </span>
            </div>
            
            <div className="absolute -bottom-6 -left-6 border-2 border-black rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-black text-sm font-medium">In Stock</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-black/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-black/5 rounded-full blur-3xl"></div>
    </section>
  );
}