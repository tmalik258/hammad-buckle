import React from "react";
import { Database, Sun, Truck, RotateCcw } from "lucide-react";
import Image from "next/image";

export default function WhyChooseSection() {
  const features = [
    {
      icon: Database,
      title: "Practical Products",
      description: "Unique Trendy & Essentials",
    },
    {
      icon: Sun,
      title: "Affordable Prices",
      description: "Top Quality At Unbeatable Prices",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Super Quick Shipping Across Kuwait",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns & Support",
      description: "Hassle-Free Returns & 24/7 Help",
    },
  ];

  const stats = [
    { value: "2M+", label: "Happy Customers" },
    { value: "500K+", label: "Products Available" },
    { value: "99.9%", label: "Up Time Guarantee" },
    { value: "24H", label: "Average Delivery" },
  ];

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      {/* Background gradient effects */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -left-30 w-[30vw] h-[40vh] rounded-full max-w-[50vw] max-h-dvh overflow-hidden"
        style={{
          background: "#ea059a",
          opacity: 0.7,
          boxShadow: `
                0 0 200px 100px rgba(234, 5, 154, 0.6),
                0 0 400px 200px rgba(234, 5, 154, 0.4)  ,
                0 0 0px 300px rgba(234, 5, 154, 0.2)
              `,
          filter: "blur(800px)",
        }}
      />

      <div className="relative container mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-14 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-5 lg:mb-6">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Wizza
            </span>
            ?
          </h2>
          <p className="text-gray-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            We&apos;re not just another marketplace. We&apos;re your personal
            shopping companion, designed to make discovery delightful and
            purchasing effortless.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-16 sm:mb-18 lg:mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-pink-500/30 rounded-xl sm:rounded-2xl p-6 sm:p-7 lg:p-8 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className="flex justify-center mb-4 sm:mb-5 lg:mb-6">
                <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 text-white flex items-center justify-center">
                  <feature.icon className="w-full h-full text-white" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-7 lg:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div className="text-gray-300 text-xs sm:text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
