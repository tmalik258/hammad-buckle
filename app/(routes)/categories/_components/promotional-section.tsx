"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface PromotionalSectionProps {
  title: string;
  subtitle?: string;
  highlightText?: string;
  limitedTimeText?: string;
  bigSaleText?: string;
  description?: string;
  buttonText: string;
  urgencyText?: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
  onButtonClick?: string;
}

export default function PromotionalSection({
  title,
  subtitle,
  highlightText,
  description,
  buttonText,
  urgencyText,
  imageSrc,
  imageAlt,
  reverse = false,
  onButtonClick,
}: PromotionalSectionProps) {
  const router = useRouter();

  const handleButtonClick = () => {
    if (onButtonClick) {
      router.push(onButtonClick);
    }
  };

  return (
    <div className="w-full">
      <Card className="rounded-2xl sm:rounded-[3rem] bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10">
        <CardContent className="p-6 sm:p-8 lg:p-12">
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center ${
              reverse ? "lg:grid-flow-col-dense" : ""
            }`}
          >
            {/* Content */}
            <div
              className={`flex flex-col justify-around h-full text-center lg:text-left ${
                reverse ? "lg:col-start-2" : ""
              }`}
            >
              <div className="space-y-2 sm:space-y-3">
                {highlightText && (
                  <div className="flex max-md:flex-col items-center gap-5">
                    <p className="text-pink-400 font-bold text-sm sm:text-base lg:text-lg">
                      {highlightText}
                    </p>
                    <div className="h-2 border-t border-[#ED1E92] w-[50%]" />
                  </div>
                )}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">
                  {title}
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-300">
                  {subtitle}
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {buttonText && (
                  <button
                    onClick={handleButtonClick}
                    className="bg-transparent border-2 border-pink-400 hover:bg-pink-400 text-pink-400 hover:text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-none rounded-tr-xl rounded-bl-xl sm:rounded-tr-2xl sm:rounded-bl-2xl cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
                  >
                    {buttonText}
                  </button>
                )}
                {urgencyText && (
                  <p className="text-sm sm:text-base lg:text-lg">
                    {urgencyText}
                  </p>
                )}
              </div>
            </div>

            {/* Image */}
            <div
              className={`flex justify-center ${
                reverse ? "lg:col-start-1" : "lg:justify-end"
              }`}
            >
              <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  width={400}
                  height={400}
                  className="object-contain w-full h-auto"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
