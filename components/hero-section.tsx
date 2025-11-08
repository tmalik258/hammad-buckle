"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BreadcrumbNavigation from "@/components/breadcrumb-navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface HeroSectionProps {
  beforeSubtitle?: string;
  title: string;
  highlightText?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  imageSrc: string;
  imageAlt: string;
  onButtonClick?: () => void;
  breadcrumbItems?: BreadcrumbItem[];
  showBreadcrumb?: boolean;
  showToggleButton?: boolean;
}

export default function HeroSection({
  beforeSubtitle,
  title,
  highlightText,
  subtitle,
  description,
  buttonText,
  imageSrc,
  imageAlt,
  onButtonClick,
  breadcrumbItems,
  showBreadcrumb = false,
  showToggleButton = true,
}: HeroSectionProps) {
  return (
    <div className="mb-8 lg:mb-16">
      <div className="px-4 lg:px-0">
        <div className="container mx-auto">
          <Card className="relative rounded-2xl lg:rounded-[3rem] overflow-hidden p-0">
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
              {/* Breadcrumb Navigation */}
              {showBreadcrumb && breadcrumbItems && (
                <BreadcrumbNavigation items={breadcrumbItems} />
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center z-[2000]">
                {/* Left Content */}
                <div className="space-y-4 lg:space-y-6 text-center lg:text-left">
                  <div className="space-y-1 lg:space-y-2">
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-tight">
                      {beforeSubtitle}{" "}
                    </h2>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                      {title}{" "}
                      <span className="text-pink-400">{highlightText}</span>
                    </h1>
                    <p className="text-pink-400 text-sm sm:text-base lg:text-lg font-medium tracking-wide">
                      {subtitle}
                    </p>
                  </div>

                  <p className="text-gray-800 text-sm sm:text-base lg:text-lg leading-relaxed">
                    {description}
                  </p>

                  {/* Target Button with Conditional Visibility */}
                  {buttonText && showToggleButton && (
                    <Button
                      onClick={onButtonClick}
                      className="bg-transparent border-2 border-black hover:bg-gray-900 text-pink-400 hover:px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-none rounded-tr-2xl rounded-bl-2xl cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
                    >
                      {buttonText}
                    </Button>
                  )}
                </div>

                {/* Right Content - Image */}
                <div className="flex justify-center lg:justify-end order-first lg:order-last z-[60]">
                  <div className="relative">
                    <div className="absolute">
                      <svg
                        width="1198"
                        height="1510"
                        viewBox="0 0 1198 1510"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g filter="url(#filter0_f_463_673)">
                          <path
                            d="M1269 496C1269 614.189 1164.01 710 1034.5 710C904.989 710 800 614.189 800 496C800 377.811 904.989 282 1034.5 282C1164.01 282 1269 377.811 1269 496Z"
                            fill="#EA059A"
                          />
                        </g>
                        <defs>
                          <filter
                            id="filter0_f_463_673"
                            x="0"
                            y="-518"
                            width="2069"
                            height="2028"
                            filterUnits="userSpaceOnUse"
                            colorInterpolationFilters="sRGB"
                          >
                            <feFlood
                              floodOpacity="0"
                              result="BackgroundImageFix"
                            />
                            <feBlend
                              mode="normal"
                              in="SourceGraphic"
                              in2="BackgroundImageFix"
                              result="shape"
                            />
                            <feGaussianBlur
                              stdDeviation="400"
                              result="effect1_foregroundBlur_463_673"
                            />
                          </filter>
                        </defs>
                      </svg>
                    </div>

                    <Image
                      src={imageSrc}
                      alt={imageAlt}
                      width={400}
                      height={400}
                      className="object-contain w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
