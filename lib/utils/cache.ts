import { apiCache } from '@/lib/cache';

/**
 * Clear entire products cache when a product is not found
 * This ensures data consistency across all users by removing potentially stale cached data
 */
export function clearProductsCache(): void {
  // Clear all product-related cache entries
  const cacheStats = apiCache.getStats();
  const productCacheKeys = cacheStats.keys.filter(key => 
    key.startsWith('products:') || 
    key.startsWith('product:') ||
    key.startsWith('product-stats:') ||
    key.startsWith('product-variations:')
  );
  
  productCacheKeys.forEach(key => {
    apiCache.delete(key);
  });
  
  console.log(`Cleared ${productCacheKeys.length} product cache entries due to product not found`);
}

/**
 * Clear specific product cache entry by ID
 * @param productId - The ID of the product to clear from cache
 */
export function clearProductCache(productId: string): void {
  const cacheStats = apiCache.getStats();
  const productCacheKeys = cacheStats.keys.filter(key => 
    key.includes(productId)
  );
  
  productCacheKeys.forEach(key => {
    apiCache.delete(key);
  });
  
  console.log(`Cleared ${productCacheKeys.length} cache entries for product ${productId}`);
}

/**
 * Clear all cache entries
 * Use with caution - this will clear the entire cache
 */
export function clearAllCache(): void {
  apiCache.clear();
  console.log('Cleared all cache entries');
}