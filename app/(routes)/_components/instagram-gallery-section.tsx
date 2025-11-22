"use client"

import Image from "next/image";
import Link from "next/link";

interface InstagramGallerySectionProps {
  className?: string;
}

interface InstagramPost {
  id: string;
  image: string;
  alt: string;
  likes: number;
  comments: number;
  caption: string;
}

const instagramPosts: InstagramPost[] = [
  {
    id: "1",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Premium%20belt%20buckle%20lifestyle%20photography%2C%20elegant%20styling%2C%20Instagram%20worthy%20composition%2C%20professional%20lighting%2C%20luxury%20aesthetic&image_size=square",
    alt: "Premium belt buckle lifestyle shot",
    likes: 234,
    comments: 18,
    caption: "Crafted for perfection 🖤 #PremiumBuckle #Craftsmanship"
  },
  {
    id: "2",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Belt%20buckle%20crafting%20process%2C%20artisan%20hands%20at%20work%2C%20behind%20the%20scenes%2C%20Instagram%20story%20style%2C%20authentic%20workshop%20photography&image_size=square",
    alt: "Crafting process behind the scenes",
    likes: 189,
    comments: 24,
    caption: "Behind every great buckle is a master craftsman 👨‍🔧 #Handmade #Artisan"
  },
  {
    id: "3",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Collection%20of%20premium%20belt%20buckles%20displayed%20elegantly%2C%20flat%20lay%20composition%2C%20Instagram%20flatlay%20style%2C%20professional%20product%20arrangement&image_size=square",
    alt: "Collection display flat lay",
    likes: 312,
    comments: 31,
    caption: "Sunday essentials ✨ #Collection #StyleInspo"
  },
  {
    id: "4",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Premium%20belt%20buckle%20detail%20shot%2C%20close-up%20macro%20photography%2C%20texture%20and%20craftsmanship%20details%2C%20Instagram%20macro%20style&image_size=square",
    alt: "Detailed craftsmanship close-up",
    likes: 267,
    comments: 22,
    caption: "The devil is in the details 🔍 #Details #Quality"
  },
  {
    id: "5",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Customer%20wearing%20premium%20belt%20buckle%2C%20lifestyle%20fashion%20photography%2C%20confident%20style%2C%20Instagram%20fashion%20influencer%20style&image_size=square",
    alt: "Customer style showcase",
    likes: 445,
    comments: 45,
    caption: "Confidence looks good on you 💪 #CustomerStyle #Confidence"
  },
  {
    id: "6",
    image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Premium%20belt%20buckle%20packaging%2C%20luxury%20unboxing%20experience%2C%20elegant%20presentation%2C%20Instagram%20unboxing%20style%2C%20professional%20product%20photography&image_size=square",
    alt: "Luxury packaging and unboxing",
    likes: 198,
    comments: 28,
    caption: "Unboxing luxury 🎁 #Packaging #LuxuryExperience"
  }
];

function InstagramPostCard({ post, index }: { post: InstagramPost; index: number }) {
  return (
    <div 
      className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer"
      style={{
        animationDelay: `${index * 0.1}s`,
        animation: "fadeInUp 0.6s ease-out forwards"
      }}
    >
      <Image
        src={post.image}
        alt={post.alt}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-300"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300"></div>
      
      {/* Hover content */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="text-center text-white p-4">
          <div className="flex items-center justify-center space-x-6 mb-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{post.likes}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{post.comments}</span>
            </div>
          </div>
          <p className="text-sm leading-tight">{post.caption}</p>
        </div>
      </div>
      
      {/* Instagram icon in corner */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.162c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </div>
    </div>
  );
}

export default function InstagramGallerySection({ className = "" }: InstagramGallerySectionProps) {
  return (
    <section 
      className={`py-16 ${className}`}
      role="region"
      aria-label="Instagram gallery"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.162c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <h2 className="text-3xl md:text-4xl font-bold text-black">
              Follow Us On Instagram
            </h2>
          </div>
          <p className="text-black/70 max-w-2xl mx-auto mb-8">
            Get inspired by our latest designs, behind-the-scenes content, and style tips. 
            Join our community of belt buckle enthusiasts!
          </p>
          <Link
            href="https://instagram.com/hammadbuckle"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-black text-[#FFF8E7] font-medium rounded-lg hover:bg-black/90 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.162c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Follow @hammadbuckle
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {instagramPosts.map((post, index) => (
            <InstagramPostCard key={post.id} post={post} index={index} />
          ))}
        </div>

        <div className="text-center">
          <p className="text-black/60 mb-6">
            Share your style with #HammadBuckle for a chance to be featured!
          </p>
          <div className="flex justify-center space-x-4 text-sm text-black/60">
            <span>#HammadBuckle</span>
            <span>#PremiumCraftsmanship</span>
            <span>#BeltBuckleStyle</span>
            <span>#HandmadeQuality</span>
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