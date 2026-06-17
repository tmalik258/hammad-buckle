"use client"

import Image from "next/image";
import { useState, useEffect } from "react";

interface TestimonialsSectionProps {
  className?: string;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    verified: boolean;
    user: {
      id: string;
      name: string;
      avatar: string | null;
    };
    product: {
      id: string;
      name: string;
    };
  }>;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  rating: number;
  text: string;
  image: string;
  verified: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex space-x-1" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300 fill-current"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial, isActive }: { testimonial: Testimonial; isActive: boolean }) {
  return (
    <div
      className={`bg-white rounded-2xl p-8 shadow-lg transition-all duration-300 ${
        isActive ? "scale-105 shadow-xl" : "scale-100"
      }`}
      style={{
        animation: "fadeInUp 0.6s ease-out forwards"
      }}
    >
      <div className="flex items-start space-x-4 mb-6">
        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-black">{testimonial.name}</h3>
          <p className="text-black/70 text-sm mb-2">{testimonial.role}</p>
          {testimonial.company && (
            <p className="text-black/60 text-xs mb-2">{testimonial.company}</p>
          )}
          <StarRating rating={testimonial.rating} />
        </div>
      </div>
      
      <blockquote className="text-black/80 leading-relaxed mb-4">
        &quot;{testimonial.text}&quot;
      </blockquote>
      
      {testimonial.verified && (
        <div className="flex items-center space-x-2 text-green-600 text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Verified Purchase</span>
        </div>
      )}
    </div>
  );
}

// Map reviews to testimonials format
function mapReviewsToTestimonials(reviews: TestimonialsSectionProps['reviews']): Testimonial[] {
  const defaultRoles = ['Customer', 'Verified Buyer', 'Satisfied Customer', 'Happy Customer'];
  const defaultCompanies = ['Premium Member', 'Valued Customer', 'Loyal Customer', 'Trusted Buyer'];
  
  return reviews.map((review, index) => ({
    id: review.id,
    name: review.user.name || 'Anonymous',
    role: defaultRoles[index % defaultRoles.length],
    company: defaultCompanies[index % defaultCompanies.length],
    rating: review.rating,
    text: review.comment,
    image: review.user.avatar || '/pfp-placeholder.jpg',
    verified: review.verified,
  }));
}

export default function TestimonialsSection({ className = "", reviews }: TestimonialsSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Map reviews to testimonials format
  const testimonials = mapReviewsToTestimonials(reviews || []);

  const nextSlide = () => {
    if (testimonials.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    if (testimonials.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    if (testimonials.length === 0) return;
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!isPaused && testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused, testimonials.length]);

  // Handle empty state
  if (!reviews || reviews.length === 0) {
    return (
      <section
        className={`py-16 ${className}`}
        role="region"
        aria-label="Customer testimonials"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              What Our Customers Say
            </h2>
            <p className="text-black/70 max-w-2xl mx-auto">
              No testimonials available at the moment. Be the first to share your experience!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`py-16 ${className}`}
      role="region"
      aria-label="Customer testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            What Our Customers Say
          </h2>
          <p className="text-black/70 max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what our valued customers have to say about their experience with our premium belt buckles.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial Carousel */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <TestimonialCard
                    testimonial={testimonial}
                    isActive={testimonials[currentSlide].id === testimonial.id}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-black"
            aria-label="Previous testimonial"
          >
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-black"
            aria-label="Next testimonial"
          >
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black ${
                  index === currentSlide ? "bg-black" : "bg-black/30"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-black mb-2">10,000+</div>
            <div className="text-black/70 text-sm">Happy Customers</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-black mb-2">4.9/5</div>
            <div className="text-black/70 text-sm">Average Rating</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-black mb-2">25+</div>
            <div className="text-black/70 text-sm">Years Experience</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-black mb-2">100%</div>
            <div className="text-black/70 text-sm">Satisfaction</div>
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