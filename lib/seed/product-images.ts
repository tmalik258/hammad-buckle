/** Stable Unsplash URLs for seeded catalog items (images.unsplash.com is allowed in next.config). */

import { WOMENS_CATEGORIES, WOMENS_PRODUCTS } from "./womens-catalog-data";

export const SEED_PRODUCT_IMAGES = Object.fromEntries(
  WOMENS_PRODUCTS.map((product) => [
    product.id,
    {
      image: product.image,
      ...(product.images ? { images: product.images } : {}),
    },
  ]),
);

export const SEED_CATEGORY_IMAGES = Object.fromEntries(
  WOMENS_CATEGORIES.map((category) => [category.id, category.image]),
);

export const BROKEN_IMAGE_HOST = "trae-api-sg.mchost.guru";
