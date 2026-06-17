import Image from "next/image";
import Link from "next/link";
import { ProductWithRelations } from "@/lib/hooks/useProductQueries";

interface NewArrivalsSectionProps {
  className?: string;
  products: ProductWithRelations[];
}

function ProductCard({ product }: { product: ProductWithRelations }) {
  const productImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : '/logo-transparent.png');
  const categoryName = product.category?.name || 'Uncategorized';
  const rating = product.averageRating || product.rating || 0;
  const reviewCount = product.reviewCount || 0;
  return (
    <div className="group cursor-pointer">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden rounded-2xl mb-4 bg-white">
          <Image
            src={productImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {product.isNew && (
            <div className="absolute top-4 left-4 bg-black text-[#FFF8E7] px-3 py-1 rounded-full text-xs font-bold">
              NEW
            </div>
          )}
          
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-black">
            {categoryName}
          </div>
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
          
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              type="button"
              className="w-full bg-black text-[#FFF8E7] py-2 rounded-lg text-sm font-medium hover:bg-black/90 transition-colors duration-200 cursor-pointer"
            >
              Quick View
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-bold text-black group-hover:text-black/80 transition-colors duration-200">
            {product.name}
          </h3>
          
          <div className="flex items-center space-x-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-black/60">({reviewCount})</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-black">${product.price.toFixed(2)}</span>
            <button
              type="button"
              className="p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors duration-200 cursor-pointer"
              aria-label={`Add ${product.name} to wishlist`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // TODO: Add wishlist functionality
              }}
            >
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function NewArrivalsSection({ className = "", products }: NewArrivalsSectionProps) {
  // Handle empty state
  if (!products || products.length === 0) {
    return (
      <section 
        className={`py-16 ${className}`}
        role="region"
        aria-label="New arrivals"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              New Arrivals
            </h2>
            <p className="text-black/70 max-w-2xl mx-auto">
              No new arrivals at the moment. Check back soon for our latest collection!
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
      aria-label="New arrivals"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            New Arrivals
          </h2>
          <p className="text-black/70 max-w-2xl mx-auto mb-8">
            Discover our latest collection of premium belt buckles, 
            featuring innovative designs and exceptional craftsmanship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/products?isNew=true"
            className="inline-flex items-center px-8 py-3 bg-black text-[#FFF8E7] font-medium rounded-lg hover:bg-black/90 transition-colors duration-200 cursor-pointer"
          >
            View All Products
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}