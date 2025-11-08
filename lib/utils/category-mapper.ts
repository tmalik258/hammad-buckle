'use client';

import { Category } from '@prisma/client';

/**
 * Category mapper utility for converting between category names and IDs
 * Works with dynamic database categories
 */

/**
 * Maps category name to ID using the provided categories array
 */
export function getCategoryIdByName(categoryName: string, categories: Category[]): string | null {
  const category = categories.find(cat => 
    cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  return category?.id || null;
}

/**
 * Maps category ID to name using the provided categories array
 */
export function getCategoryNameById(categoryId: string, categories: Category[]): string | null {
  const category = categories.find(cat => cat.id === categoryId);
  return category?.name || null;
}

/**
 * Maps an array of category names to IDs
 */
export function getCategoryIdsByNames(categoryNames: string[], categories: Category[]): string[] {
  return categoryNames
    .map(name => getCategoryIdByName(name, categories))
    .filter((id): id is string => id !== null);
}

/**
 * Maps an array of category IDs to names
 */
export function getCategoryNamesByIds(categoryIds: string[], categories: Category[]): string[] {
  return categoryIds
    .map(id => getCategoryNameById(id, categories))
    .filter((name): name is string => name !== null);
}

/**
 * Validates if a category name exists in the provided categories
 */
export function isValidCategoryName(categoryName: string, categories: Category[]): boolean {
  return categories.some(cat => 
    cat.name.toLowerCase() === categoryName.toLowerCase()
  );
}

/**
 * Validates if a category ID exists in the provided categories
 */
export function isValidCategoryId(categoryId: string, categories: Category[]): boolean {
  return categories.some(cat => cat.id === categoryId);
}

/**
 * Creates a URL-safe slug from category name
 */
export function createCategorySlug(categoryName: string): string {
  return categoryName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Finds the best matching category for a given search term
 */
export function findBestCategoryMatch(searchTerm: string, categories: Category[]): Category | null {
  const term = searchTerm.toLowerCase();
  
  // Exact name match
  let match = categories.find(cat => cat.name.toLowerCase() === term);
  if (match) return match;
  
  // Partial name match
  match = categories.find(cat => cat.name.toLowerCase().includes(term));
  if (match) return match;
  
  // Partial description match
  match = categories.find(cat => 
    cat.description?.toLowerCase().includes(term)
  );
  if (match) return match;
  
  return null;
}

/**
 * Type guard to check if a value is a valid Category object
 */
export function isCategory(value: Category) {
  return value && 
    typeof value === 'object' && 
    typeof value.id === 'string' && 
    typeof value.name === 'string';
}