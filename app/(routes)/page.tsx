import HeroSection from "./_components/hero-section";
import BrandLogosSection from "./_components/brand-logos-section";
import DealsOfTheMonthSection from "./_components/deals-of-the-month-section";
import NewArrivalsSection from "./_components/new-arrivals-section";
import FeatureBannerSection from "./_components/feature-banner-section";
import InstagramGallerySection from "./_components/instagram-gallery-section";
import TestimonialsSection from "./_components/testimonials-section";
import NewsletterSection from "./_components/newsletter-section";

export default function Home() {
  return (
    <div className="min-h-screen">
        <HeroSection />
        <BrandLogosSection />
        <DealsOfTheMonthSection />
        <NewArrivalsSection />
        <FeatureBannerSection />
        <InstagramGallerySection />
        <TestimonialsSection />
        <NewsletterSection />
    </div>
  );
}
