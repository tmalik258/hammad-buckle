"use client"

import Image from "next/image";

interface BrandLogosSectionProps {
  className?: string;
}

interface Brand {
  name: string;
  logo: string;
  alt: string;
}

const brands: Brand[] = [
  {
    name: "Premium Leather Co.",
    logo: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Premium%20Leather%20Company%20logo%2C%20minimalist%20design%2C%20elegant%20typography%2C%20black%20and%20white%2C%20professional%20corporate%20branding&image_size=landscape_4_3",
    alt: "Premium Leather Co. logo"
  },
  {
    name: "Craftsman Elite",
    logo: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Craftsman%20Elite%20logo%2C%20artisan%20craftsmanship%20branding%2C%20handcrafted%20aesthetic%2C%20premium%20quality%20symbol%2C%20black%20and%20white%20design&image_size=landscape_4_3",
    alt: "Craftsman Elite logo"
  },
  {
    name: "Luxury Hardware",
    logo: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Luxury%20Hardware%20logo%2C%20high-end%20metal%20hardware%20branding%2C%20sophisticated%20design%2C%20premium%20quality%20mark%2C%20black%20and%20white%20corporate%20identity&image_size=landscape_4_3",
    alt: "Luxury Hardware logo"
  },
  {
    name: "Artisan Forge",
    logo: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Artisan%20Forge%20logo%2C%20blacksmith%20craftsmanship%20branding%2C%20forged%20metal%20aesthetic%2C%20traditional%20craftsman%20symbol%2C%20premium%20handcrafted%20quality%20mark&image_size=landscape_4_3",
    alt: "Artisan Forge logo"
  },
  {
    name: "Heritage Leather",
    logo: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Heritage%20Leather%20logo%2C%20traditional%20leather%20craft%20branding%2C%20vintage%20aesthetic%2C%20heritage%20craftsmanship%20symbol%2C%20premium%20quality%20mark%2C%20black%20and%20white%20design&image_size=landscape_4_3",
    alt: "Heritage Leather logo"
  },
  {
    name: "Master Crafted",
    logo: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Master%20Crafted%20logo%2C%20master%20craftsman%20branding%2C%20excellence%20in%20craftsmanship%2C%20premium%20quality%20seal%2C%20professional%20corporate%20identity%2C%20black%20and%20white%20design&image_size=landscape_4_3",
    alt: "Master Crafted logo"
  }
];

export default function BrandLogosSection({ className = "" }: BrandLogosSectionProps) {
  return (
    <section 
      className={`py-16 ${className}`}
      role="region"
      aria-label="Partner brands"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-black/70 max-w-2xl mx-auto">
            Our premium belt buckles are crafted using materials and techniques 
            trusted by the most respected names in leather craftsmanship
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {brands.map((brand, index) => (
            <div
              key={brand.name}
              className="flex items-center justify-center p-4 hover:bg-black/5 rounded-lg transition-colors duration-200 cursor-pointer"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: "fadeInUp 0.6s ease-out forwards"
              }}
            >
              <Image
                src={brand.logo}
                alt={brand.alt}
                width={120}
                height={60}
                className="max-w-full h-auto opacity-70 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-black/60 text-sm">
            Partnering with premium leather craftsmen worldwide
          </p>
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