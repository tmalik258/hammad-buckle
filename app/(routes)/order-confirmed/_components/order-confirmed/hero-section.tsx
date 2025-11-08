import Image from "next/image";
import { CheckCircle } from "lucide-react";

interface HeroSectionProps {
  orderNumber?: string;
  customerEmail?: string;
}

export function HeroSection({ orderNumber, customerEmail }: HeroSectionProps) {
  return (
    <section className="relative bg-white/30 backdrop-blur-sm py-16 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-4xl mx-auto text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Image
              src="/images/purple-tic.png"
              alt="Order Confirmed"
              width={120}
              height={120}
              className="drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
          Thank You! Order Has Been Placed
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed">
          We&apos;ve sent your order details to your email.
        </p>

        {/* Order Details */}
        {orderNumber && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-white/20">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-purple-200">Order Number:</span>
                <span className="font-semibold text-white">#{orderNumber}</span>
              </div>
              {customerEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-purple-200">Email:</span>
                  <span className="font-medium text-white truncate ml-2">{customerEmail}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl"></div>
      </div>
    </section>
  );
}