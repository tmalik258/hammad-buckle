"use client";

import Image from "next/image";
import { Truck, Globe, Lock, Headphones } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

const breadcrumbItems: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "About us", isActive: true },
];

const teamMembers = [
  {
    name: "Omer Saleh",
    role: "Operations Lead",
    image: "/images/team/omer-saleh.png",
  },
  {
    name: "Nour Hassan",
    role: "Customer Support Specialist",
    image: "/images/team/nour-hassan.png",
  },
  {
    name: "Faisal Rahman",
    role: "Tech & Development Lead",
    image: "/images/team/faisal-rahman.png",
  },
  {
    name: "Adnan Raza",
    role: "Marketing Strategist",
    image: "/images/team/adnan-raza.png",
  },
];

const pillars = [
  {
    icon: "/images/green-shield.png",
    title: "Trust & Transparency",
    description: "Secure shopping at every step.",
  },
  {
    icon: "/images/creative-heart.png",
    title: "Customer First",
    description: "Your satisfaction is our priority.",
  },
  {
    icon: "/images/star-badge.png",
    title: "Quality & Reliability",
    description: "Only products we stand behind.",
  },
  {
    icon: "/images/thunder.png",
    title: "Innovation & Growth",
    description: "Always improving your experience.",
  },
];

const features = [
  {
    icon: (
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.7648 38.1615C18.8305 38.3989 18.9422 38.621 19.0937 38.8152C19.2452 39.0093 19.4335 39.1718 19.6478 39.2932C19.862 39.4146 20.0981 39.4926 20.3426 39.5228C20.587 39.553 20.835 39.5347 21.0723 39.469C21.3097 39.4034 21.5318 39.2916 21.726 39.1401C21.9201 38.9886 22.0826 38.8003 22.204 38.5861C22.3254 38.3718 22.4034 38.1357 22.4336 37.8913C22.4637 37.6469 22.4455 37.3989 22.3798 37.1615L18.7648 38.1615ZM7.99982 11.8115C7.76152 11.7419 7.51177 11.7203 7.26507 11.748C7.01836 11.7757 6.7796 11.8521 6.56266 11.9728C6.34571 12.0935 6.15488 12.256 6.00126 12.451C5.84763 12.646 5.73426 12.8696 5.66772 13.1088C5.60118 13.348 5.58281 13.598 5.61365 13.8443C5.6445 14.0906 5.72395 14.3284 5.84741 14.5438C5.97086 14.7591 6.13586 14.9479 6.33283 15.099C6.5298 15.2501 6.75481 15.3606 6.99482 15.424L7.99982 11.8115ZM50.4698 39.3115C50.714 39.2551 50.9443 39.1503 51.1473 39.0033C51.3502 38.8563 51.5216 38.6701 51.6514 38.4557C51.7812 38.2414 51.8667 38.0032 51.9028 37.7552C51.9389 37.5072 51.925 37.2545 51.8619 37.0121C51.7987 36.7696 51.6875 36.5422 51.535 36.3434C51.3825 36.1446 51.1916 35.9784 50.9738 35.8545C50.7559 35.7307 50.5154 35.6519 50.2666 35.6226C50.0177 35.5933 49.7655 35.6142 49.5248 35.684L50.4698 39.3115ZM25.4923 43.8965C26.2673 46.6965 24.5673 49.654 21.5573 50.4365L22.4998 54.064C27.4423 52.7815 30.4623 47.809 29.1073 42.8965L25.4923 43.8965ZM21.5573 50.4365C18.5273 51.224 15.4873 49.464 14.7073 46.639L11.0923 47.639C12.4423 52.5265 17.5773 55.344 22.4998 54.064L21.5573 50.4365ZM14.7073 46.639C13.9323 43.839 15.6323 40.8815 18.6423 40.099L17.6998 36.474C12.7573 37.7565 9.73482 42.7265 11.0923 47.639L14.7073 46.639ZM18.6423 40.099C21.6723 39.3115 24.7123 41.0715 25.4923 43.8965L29.1073 42.8965C27.7573 38.009 22.6223 35.1915 17.6998 36.4715L18.6423 40.099ZM22.3798 37.1615L16.9998 17.6865L13.3848 18.6865L18.7648 38.1615L22.3798 37.1615ZM12.2598 12.9915L7.99982 11.8115L6.99482 15.424L11.2573 16.6065L12.2598 12.9915ZM16.9998 17.6865C16.682 16.5615 16.0784 15.5379 15.2478 14.7151C14.4172 13.8924 13.3878 13.2986 12.2598 12.9915L11.2623 16.6065C12.3248 16.9015 13.1148 17.709 13.3848 18.6865L16.9998 17.6865ZM27.7748 45.2115L50.4698 39.3115L49.5273 35.684L26.8298 41.584L27.7748 45.2115Z"
          fill="#E6E6E6"
        />
        <path
          d="M24.41 22.2876C23.1067 17.9114 22.4565 15.7221 23.5635 13.999C24.6679 12.2735 27.0998 11.6875 31.9634 10.513L37.1226 9.27122C41.9862 8.09924 44.418 7.51076 46.3339 8.50569C48.2498 9.50312 48.9027 11.69 50.2033 16.0687L51.5871 20.7117C52.8904 25.0879 53.5433 27.2772 52.4362 29.0028C51.3292 30.7258 48.8974 31.3143 44.0337 32.4863L38.8745 33.7306C34.0109 34.9025 31.5791 35.4885 29.6632 34.4936C27.7473 33.4962 27.0971 31.3093 25.7938 26.9331L24.41 22.2876Z"
          stroke="#E6E6E6"
          stroke-width="1.5"
        />
      </svg>
    ),
    title: "Fast Delivery",
    description: "Reliable shipping to your door.",
  },
  {
    icon: (
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M40.9 35C41.1 33.35 41.25 31.7 41.25 30C41.25 28.3 41.1 26.65 40.9 25H49.35C49.75 26.6 50 28.275 50 30C50 31.725 49.75 33.4 49.35 35M36.475 48.9C37.975 46.125 39.125 43.125 39.925 40H47.3C44.8779 44.1707 41.0353 47.33 36.475 48.9ZM35.85 35H24.15C23.9 33.35 23.75 31.7 23.75 30C23.75 28.3 23.9 26.625 24.15 25H35.85C36.075 26.625 36.25 28.3 36.25 30C36.25 31.7 36.075 33.35 35.85 35ZM30 49.9C27.925 46.9 26.25 43.575 25.225 40H34.775C33.75 43.575 32.075 46.9 30 49.9ZM20 20H12.7C15.0966 15.8176 18.9366 12.6531 23.5 11.1C22 13.875 20.875 16.875 20 20ZM12.7 40H20C20.875 43.125 22 46.125 23.5 48.9C18.9457 47.3308 15.1107 44.1705 12.7 40ZM10.65 35C10.25 33.4 10 31.725 10 30C10 28.275 10.25 26.6 10.65 25H19.1C18.9 26.65 18.75 28.3 18.75 30C18.75 31.7 18.9 33.35 19.1 35M30 10.075C32.075 13.075 33.75 16.425 34.775 20H25.225C26.25 16.425 27.925 13.075 30 10.075ZM47.3 20H39.925C39.1414 16.904 37.9828 13.9153 36.475 11.1C41.075 12.675 44.9 15.85 47.3 20ZM30 5C16.175 5 5 16.25 5 30C5 36.6304 7.63392 42.9893 12.3223 47.6777C14.6438 49.9991 17.3998 51.8406 20.4329 53.097C23.4661 54.3534 26.717 55 30 55C36.6304 55 42.9893 52.3661 47.6777 47.6777C52.3661 42.9893 55 36.6304 55 30C55 26.717 54.3534 23.4661 53.097 20.4329C51.8406 17.3998 49.9991 14.6438 47.6777 12.3223C45.3562 10.0009 42.6002 8.15938 39.5671 6.90301C36.5339 5.64664 33.283 5 30 5Z"
          fill="#E6E6E6"
        />
      </svg>
    ),
    title: "Curated Products",
    description: "Curated products you'll love.",
  },
  {
    icon: (
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30 1.09961L55 9.84961V29.9996C55 40.3171 48.6675 47.5296 42.76 52.0071C39.1965 54.6858 35.2858 56.8682 31.135 58.4946L30.9175 58.5771L30.855 58.5996L30.8375 58.6046L30.83 58.6071C30.8275 58.6071 30.825 58.6071 30 56.2496L29.1725 58.6096L29.1625 58.6046L29.145 58.5996L29.0825 58.5746L28.865 58.4946C27.6859 58.0386 26.5265 57.5332 25.39 56.9796C22.5209 55.5859 19.7918 53.9208 17.24 52.0071C11.335 47.5296 5 40.3171 5 29.9996V9.84961L30 1.09961ZM30 56.2496L29.1725 58.6096L30 58.8996L30.8275 58.6096L30 56.2496ZM30 53.5696L30.0225 53.5596C33.4817 52.1298 36.7466 50.2693 39.74 48.0221C45.085 43.9746 50 38.0571 50 29.9996V13.3996L30 6.39961L10 13.3996V29.9996C10 38.0571 14.915 43.9696 20.26 48.0246C23.26 50.276 26.5326 52.1391 30 53.5696ZM45.18 20.8571L27.5025 38.5346L16.895 27.9296L20.4325 24.3921L27.5 31.4646L41.6425 17.3221L45.18 20.8571Z"
          fill="#E6E6E6"
        />
      </svg>
    ),
    title: "Secure Payments",
    description: "100% protected checkout.",
  },
  {
    icon: (
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M29.9999 40.7142C29.1609 40.7145 28.3403 40.4686 27.6398 40.0069C26.9393 39.5452 26.3897 38.8881 26.0591 38.117C25.3677 37.9537 24.6871 37.7476 24.0213 37.4999L23.9849 37.487C22.0297 36.7531 20.225 35.6682 18.6599 34.2856C16.5628 32.4357 14.9502 30.1009 13.9625 27.4848C12.9749 24.8686 12.6422 22.0506 12.9935 19.2764C13.3447 16.5022 14.3694 13.856 15.9779 11.5687C17.5865 9.28129 19.7302 7.42215 22.2222 6.15334C24.7141 4.88454 27.4786 4.24459 30.2746 4.2893C33.0706 4.33401 35.8132 5.06203 38.2633 6.40987C40.7134 7.75771 42.7966 9.68445 44.3312 12.0221C45.8658 14.3597 46.8053 17.0373 47.0677 19.8213C47.1513 20.7063 46.4249 21.4285 45.5356 21.4285C44.6484 21.4285 43.9391 20.7063 43.8363 19.8235C43.553 17.3877 42.6317 15.0698 41.1654 13.1042C39.6992 11.1386 37.74 9.59501 35.4859 8.62935C33.2318 7.66369 30.7627 7.31024 28.3283 7.60473C25.8938 7.89922 23.5802 8.83122 21.6214 10.3065C19.6626 11.7818 18.128 13.7481 17.1727 16.0066C16.2174 18.2651 15.8754 20.7357 16.181 23.1688C16.4867 25.6019 17.4294 27.9112 18.9137 29.8632C20.3979 31.8152 22.3713 33.3407 24.6341 34.2856L24.7199 34.322C25.1484 34.4977 25.5884 34.6527 26.0399 34.787C26.4527 33.7812 27.2323 32.9699 28.2209 32.5174C29.2094 32.0649 30.333 32.005 31.3641 32.3499C32.3952 32.6947 33.2566 33.4186 33.774 34.3748C34.2914 35.331 34.426 36.4481 34.1506 37.4999C33.913 38.42 33.3763 39.2351 32.625 39.8169C31.8736 40.3988 30.9502 40.7144 29.9999 40.7142ZM14.9999 37.4999H17.5049C16.3068 36.5661 15.2159 35.5025 14.252 34.3285C12.6871 34.5118 11.244 35.2634 10.1968 36.4406C9.14954 37.6178 8.5711 39.1386 8.57129 40.7142V42.2463C8.57129 50.2135 17.5927 55.7142 29.9999 55.7142C42.407 55.7142 51.4284 49.9113 51.4284 42.2463V40.7142C51.4284 39.0092 50.7511 37.3741 49.5455 36.1685C48.34 34.9629 46.7048 34.2856 44.9999 34.2856H37.1891C37.4997 35.3273 37.5801 36.424 37.4249 37.4999H44.9999L45.3106 37.5149C46.1055 37.5921 46.8433 37.9625 47.38 38.5539C47.9168 39.1454 48.2142 39.9155 48.2141 40.7142V42.2463L48.2034 42.5913C47.9034 47.9913 40.5556 52.4999 29.9999 52.4999C19.0477 52.4999 11.7856 47.9763 11.7856 42.2463V40.7142L11.8006 40.4035C11.8778 39.6085 12.2482 38.8708 12.8396 38.334C13.4311 37.7972 14.2012 37.4999 14.9999 37.4999ZM40.7141 21.4285C40.7145 23.3694 40.1876 25.274 39.1897 26.9388C38.1918 28.6036 36.7604 29.966 35.0484 30.8806C33.6672 29.6241 31.867 28.928 29.9999 28.9285C30.9848 28.9285 31.96 28.7345 32.87 28.3576C33.7799 27.9806 34.6067 27.4282 35.3032 26.7318C35.9996 26.0353 36.552 25.2085 36.929 24.2986C37.3059 23.3886 37.4999 22.4134 37.4999 21.4285C37.4999 20.4435 37.3059 19.4683 36.929 18.5583C36.552 17.6484 35.9996 16.8216 35.3032 16.1252C34.6067 15.4287 33.7799 14.8763 32.87 14.4994C31.96 14.1225 30.9848 13.9285 29.9999 13.9285C28.0107 13.9285 26.1031 14.7186 24.6966 16.1252C23.29 17.5317 22.4999 19.4393 22.4999 21.4285C22.4999 23.4176 23.29 25.3252 24.6966 26.7318C26.1031 28.1383 28.0107 28.9285 29.9999 28.9285C28.0541 28.9285 26.2841 29.6699 24.9534 30.8827C23.2423 29.9689 21.8114 28.6076 20.8134 26.9442C19.9637 25.5286 19.4526 23.9357 19.3201 22.29C19.1876 20.6442 19.4373 18.9901 20.0495 17.4568C20.6618 15.9235 21.6202 14.5524 22.8498 13.4506C24.0794 12.3487 25.5471 11.546 27.1382 11.105C28.7292 10.664 30.4007 10.5967 32.0221 10.9083C33.6435 11.22 35.1709 11.9021 36.4852 12.9015C37.7994 13.9009 38.8649 15.1904 39.5985 16.6696C40.3321 18.1487 40.7139 19.7774 40.7141 21.4285Z"
          fill="#E6E6E6"
        />
      </svg>
    ),
    title: "24/7 Support",
    description: "We were here anytime.",
  },
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen md:pt-20">
      {/* Removed HeroSection */}

      {/* Background decorative elements */}
      <div className="absolute inset-0 z-50">
        {/* Ellipse - Pink/Magenta blur effect */}
        <div
          className="absolute top-1/2 -translate-y-1/3 right-30 w-[20vw] h-[40vh] rounded-full max-w-[50vw] max-h-dvh overflow-hidden"
          style={{
            background: "#ea059a",
            opacity: 0.3,
            boxShadow: `
                0 0 200px 100px rgba(234, 5, 154, 0.6),
                0 0 400px 300px rgba(234, 5, 154, 0.4),
                0 0 800px 500px rgba(234, 5, 154, 0.2)
              `,
            filter: "blur(800px)",
          }}
        />
      </div>

      {/* Our Story Section */}
      <section className="py-16 lg:py-24 px-4 lg:px-0">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Decorative Image */}
            <div className="flex justify-center lg:justify-start order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
                <Image
                  src="/images/staircase.png"
                  alt="Our Story Illustration"
                  width={400}
                  height={500}
                  className="relative z-10 object-contain"
                />
              </div>
            </div>

            {/* Right side - Content */}
            <div className="text-center order-1 lg:order-2">
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                <span className="text-white">Our </span>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Story
                </span>
              </h2>
              <p className="text-gray-300 text-lg lg:text-xl leading-relaxed">
                &quot;At <span className="text-pink-400 font-semibold">Wizza</span>,
                we believe the future of shopping isn&apos;t just digital —
                it&apos;s personal, reliable, and inspiring. We started with one
                goal: to bring together technology and trust, creating an online
                experience that feels effortless.
              </p>
              <p className="text-gray-300 text-lg lg:text-xl leading-relaxed mt-4">
                Our mission is to keep pushing boundaries with smarter, faster,
                and more reliable solutions. Our vision is bold yet simple: to
                become the e-commerce brand that customers not only trust, but
                love to return to.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Stand For Section */}
      <section className="py-16 lg:py-24 px-4 lg:px-0">
        <div className="container mx-auto">
          <h2 className="text-3xl lg:text-5xl font-bold text-center mb-16">
            <span className="text-white">What </span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              We Stand For
            </span>
          </h2>

          {/* Icons Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {pillars.map((pillar, index) => {
              return (
                <div
                  key={index}
                  className="flex flex-col gap-3 justify-center items-center text-center"
                >
                  <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-2xl flex items-center justify-center">
                    <Image
                      src={pillar.icon}
                      alt={pillar.title}
                      width={100}
                      height={100}
                      className="w-full h-full object-contain"
                      priority={true}
                      loading="eager"
                      quality={100}
                      decoding="async"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg lg:text-xl font-bold text-white">
                      {pillar.title}
                    </h3>
                    <p className="text-gray-300 text-sm lg:text-base">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The People Behind Wizza Section */}
      <section className="py-16 lg:py-24 px-4 lg:px-0">
        <div className="container mx-auto">
          <h2 className="text-3xl lg:text-5xl font-bold text-center mb-16">
            <span className="text-white">The People Behind </span>
            <span className="text-pink-400">Wizza</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 lg:w-36 lg:h-36 mx-auto rounded-full overflow-hidden border-4 border-gradient-to-r from-purple-400 to-pink-400 shadow-2xl">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={144}
                      height={144}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-gray-300 text-sm lg:text-base">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Wizza Section */}
      <section className="py-16 lg:py-24 px-4 lg:px-0">
        <div className="container mx-auto">
          <h2 className="text-3xl lg:text-5xl font-bold text-center mb-16">
            <span className="text-white">Why Choose </span>
            <span className="text-pink-400">Wizza</span>
            <span className="text-white">?</span>
          </h2>

          {/* Icons Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {features.map((feature, index) => {
              return (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-2xl flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <h3 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-sm lg:text-base">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-64 w-96 h-96 bg-gradient-to-l from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
