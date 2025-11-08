"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import HeroSection from "./_components/hero-section";
import PromotionalSection from "./_components/promotional-section";
import { useRouter } from "next/navigation";
import { useCategories } from "@/lib/hooks/useCategories";

export default function CategoriesPage() {
  const router = useRouter();

  // Fetch categories from database
  const {
    data: categoriesData,
    isLoading,
    error,
  } = useCategories({
    limit: 100,
    orderBy: "name",
    order: "asc",
  });

  const categories = categoriesData?.categories || [];

  const handleCategoryClick = (categoryId: string) => {
    // Navigate to products page with category filter
    const encodedCategory = encodeURIComponent(categoryId);
    router.push(`/products?category=${encodedCategory}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative">
        <HeroSection />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 py-8 sm:py-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Curated Collections
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-300">
              &quot;Where style, comfort, and innovation meet.&quot;
            </p>
          </div>
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-12 sm:mb-16 lg:mb-20 relative">
            {/* Mask group SVG - Decorative background */}
            <div className="absolute top-1/2 -translate-1/2 left-0 opacity-50 max-w-[70vw] max-h-[30vh]">
              <Image
                src="/images/mask-group.svg"
                alt="Decorative mask group"
                width={662}
                height={388}
                className="w-full h-full object-contain opacity-70 blur-[0.3px]"
              />
            </div>

            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="border-2 border-pink-500/30 rounded-2xl sm:rounded-[3rem] bg-transparent h-[350px] sm:h-[400px] animate-pulse"
              >
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-center text-center h-full">
                  <div className="mb-4 sm:mb-6 flex-1 flex items-center justify-center">
                    <div className="w-40 h-40 bg-gray-700 rounded-lg"></div>
                  </div>
                  <div className="mt-auto space-y-3 sm:space-y-4">
                    <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
                    <div className="h-10 bg-gray-700 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-black relative">
        <HeroSection />
        <div className="container bg-black px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 py-8 sm:py-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Curated Collections
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-300">
              &quot;Where style, comfort, and innovation meet.&quot;
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-red-400 text-lg mb-4">
              Failed to load categories
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black relative"> 
      <HeroSection />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 py-8 sm:py-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
            Curated Collections
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-300">
            &quot;Where style, comfort, and innovation meet.&quot;
          </p>
        </div>
        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-12 sm:mb-16 lg:mb-20 relative">
          {/* Mask group SVG - Decorative background */}
          <div className="absolute top-1/2 -translate-1/2 left-0 opacity-50 max-w-[70vw] max-h-[30vh]">
            <Image
              src="/images/mask-group.svg"
              alt="Decorative mask group"
              width={662}
              height={388}
              className="w-full h-full object-contain opacity-70 blur-[0.3px]"
            />
          </div>

          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
            >
              <Card className="group cursor-pointer border-2 border-pink-500/30 hover:border-pink-400 rounded-2xl sm:rounded-[3rem] bg-none bg-transparent h-full transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10">
                <CardContent className="p-4 sm:p-6 lg:p-8 flex flex-col content-between justify-center text-center h-full min-h-[350px] sm:min-h-[400px]">
                  <div className="mb-4 sm:mb-6 flex-1 flex items-center justify-center">
                    <Image
                      src={category.image || "/images/logo.png"}
                      alt={category.name}
                      width={120}
                      height={250}
                      className="max-w-40 sm:max-w-48 lg:max-w-52 w-full h-full object-contain mx-auto group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="mt-auto space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-serif">
                      {category.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">
                      {category.description}
                    </p>
                    <p className="text-xs sm:text-sm text-pink-400 font-medium mb-3 sm:mb-4">
                      {category.productsCount} Products
                    </p>
                    <button className="bg-transparent border-2 border-pink-400 hover:bg-pink-400 text-pink-400 hover:text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-none rounded-tr-xl rounded-bl-xl sm:rounded-tr-2xl sm:rounded-bl-2xl cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto">
                      Explore Now
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Promotional Sections */}
        <div className="mt-12 sm:mt-16 lg:mt-20 space-y-8 sm:space-y-12 lg:space-y-16 relative">
          {/* Mask group SVG - Decorative background */}
          <div className="absolute top-1/2 md:top-10 -right-100 opacity-50 md:max-w-[50vw] max-h-[40vh]">
            <Image
              src="/images/mask-group.svg"
              alt="Decorative mask group"
              width={662}
              height={388}
              className="w-full h-full object-contain opacity-70 blur-[0.3px]"
            />
          </div>
          <div className="px-2 sm:px-4 lg:px-0">
            <PromotionalSection
              title="BIG SALE! - UP TO 50% OFF"
              subtitle="Shop now and grab your favorite products at unbeatable prices!"
              highlightText="Limited-Time Discount Offer"
              buttonText="Shop Now"
              onButtonClick={"/products"}
              urgencyText="Hurry-Limited Stock Available!"
              imageSrc="/images/young-woman-with-shopping-bags.png"
              imageAlt="BIG SALE! - UP TO 50% OFF"
              reverse={false}
            />
          </div>
          <div className="px-2 sm:px-4 lg:px-0">
            <PromotionalSection
              title="SAVE KWD 5 ON All ORDERS"
              subtitle="Shop now and grab your favorite products at unbeatable prices!"
              highlightText="Exclusive Saving Deals"
              buttonText="Shop Now"
              onButtonClick={"/products"}
              urgencyText="Hurry-Limited Stock Available!"
              imageSrc="/images/muslim-woman-in-traditional-dress.png"
              imageAlt="SAVE KWD 5 ON All ORDERS"
              reverse={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
