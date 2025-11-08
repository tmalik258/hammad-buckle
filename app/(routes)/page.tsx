import HeroSection from "./_components/hero-section";
import CategoriesSection from "./_components/categories-section";
import TrendingProductsSection from "./_components/trending-products-section";
import DealsSection from "./_components/deals-section";
import WhyChooseSection from "./_components/why-choose-section";
import { ReviewSection, sampleReviews } from "@/app/(routes)/_components/review-section";

export default function Home() {
  return (
    <div className="flex flex-col overflow-hidden relative max-md:-mt-20">
      <HeroSection />
      <CategoriesSection />
      <TrendingProductsSection />
      <DealsSection />
      <WhyChooseSection />
      <ReviewSection reviews={sampleReviews} />
    </div>
  );
}
