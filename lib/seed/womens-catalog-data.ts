import { GenderTarget } from "@prisma/client";

/** Shared catalog + storefront seed data — women's clothing and shoes only. */

export const WOMENS_CATEGORY_IDS = {
  clothing: "cat-fashion",
  shoes: "cat-womens-shoes",
} as const;

export const WOMENS_CATEGORIES = [
  {
    id: WOMENS_CATEGORY_IDS.clothing,
    name: "Women's Clothing",
    description: "Dresses, blazers, skirts, and everyday womenswear",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
    productsCount: 0,
    featured: true,
  },
  {
    id: WOMENS_CATEGORY_IDS.shoes,
    name: "Women's Shoes & Heels",
    description: "Heels, pumps, sandals, and statement footwear",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    productsCount: 0,
    featured: true,
  },
];

export const WOMENS_PRODUCTS = [
  {
    id: "prod-wrap-dress",
    name: "Elegant Wrap Dress",
    description:
      "Flattering wrap silhouette in a soft drape fabric — day-to-night polish.",
    price: 189.99,
    originalPrice: 229.99,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
    ],
    categoryId: WOMENS_CATEGORY_IDS.clothing,
    averageRating: 4.7,
    reviewCount: 0,
    inStock: true,
    stockQuantity: 24,
    isNew: true,
    onSale: true,
    featured: true,
    sku: "WD-WRAP-001",
    weight: 420.0,
    genderTarget: GenderTarget.WOMENS,
  },
  {
    id: "prod-linen-blazer",
    name: "Women's Linen Blazer",
    description:
      "Relaxed tailored blazer in breathable linen — sharp structure, easy movement.",
    price: 149.99,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    categoryId: WOMENS_CATEGORY_IDS.clothing,
    averageRating: 4.6,
    reviewCount: 0,
    inStock: true,
    stockQuantity: 18,
    isNew: true,
    onSale: false,
    featured: true,
    sku: "WB-LINEN-001",
    weight: 680.0,
    genderTarget: GenderTarget.WOMENS,
  },
  {
    id: "prod-designer-jacket",
    name: "Premium Leather Jacket",
    description:
      "Handcrafted women's leather jacket with a modern cropped fit and premium finish.",
    price: 299.99,
    originalPrice: 399.99,
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
    categoryId: WOMENS_CATEGORY_IDS.clothing,
    averageRating: 4.6,
    reviewCount: 0,
    inStock: true,
    stockQuantity: 15,
    isNew: false,
    onSale: true,
    featured: true,
    sku: "LJ-PREM-BLK-L",
    weight: 1200.0,
    genderTarget: GenderTarget.WOMENS,
  },
  {
    id: "prod-satin-midi",
    name: "Satin Midi Skirt",
    description:
      "Liquid satin midi with a soft sheen — pairs with knits, blazers, and heels.",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80",
    categoryId: WOMENS_CATEGORY_IDS.clothing,
    averageRating: 4.5,
    reviewCount: 0,
    inStock: true,
    stockQuantity: 30,
    isNew: true,
    onSale: false,
    featured: false,
    sku: "SK-SATIN-001",
    weight: 280.0,
    genderTarget: GenderTarget.WOMENS,
  },
  {
    id: "prod-running-shoes",
    name: "Classic Stiletto Heels",
    description:
      "Pointed stiletto heel with cushioned insole — elevated height, all-day balance.",
    price: 199.99,
    originalPrice: 249.99,
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    categoryId: WOMENS_CATEGORY_IDS.shoes,
    averageRating: 4.8,
    reviewCount: 0,
    inStock: true,
    stockQuantity: 20,
    isNew: true,
    onSale: true,
    featured: true,
    sku: "SH-STILETTO-001",
    weight: 520.0,
    genderTarget: GenderTarget.WOMENS,
  },
  {
    id: "prod-block-heels",
    name: "Block Heel Sandals",
    description:
      "Stable block heel sandal with ankle strap — dress up or down with ease.",
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=800&q=80",
    categoryId: WOMENS_CATEGORY_IDS.shoes,
    averageRating: 4.5,
    reviewCount: 0,
    inStock: true,
    stockQuantity: 22,
    isNew: false,
    onSale: false,
    featured: true,
    sku: "SH-BLOCK-001",
    weight: 480.0,
    genderTarget: GenderTarget.WOMENS,
  },
  {
    id: "prod-pump-heels",
    name: "Pointed Toe Pumps",
    description:
      "Sleek pointed pump in smooth finish — a wardrobe essential for work and evenings.",
    price: 159.99,
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    categoryId: WOMENS_CATEGORY_IDS.shoes,
    averageRating: 4.6,
    reviewCount: 0,
    inStock: true,
    stockQuantity: 26,
    isNew: true,
    onSale: false,
    featured: false,
    sku: "SH-PUMP-001",
    weight: 510.0,
    genderTarget: GenderTarget.WOMENS,
  },
];

export const WOMENS_PRODUCT_VARIANTS = [
  { productId: "prod-wrap-dress", name: "Size", value: "S", price: 0, stock: 8 },
  { productId: "prod-wrap-dress", name: "Size", value: "M", price: 0, stock: 10 },
  { productId: "prod-wrap-dress", name: "Size", value: "L", price: 0, stock: 6 },
  { productId: "prod-linen-blazer", name: "Size", value: "S", price: 0, stock: 5 },
  { productId: "prod-linen-blazer", name: "Size", value: "M", price: 0, stock: 8 },
  { productId: "prod-linen-blazer", name: "Size", value: "L", price: 0, stock: 5 },
  { productId: "prod-designer-jacket", name: "Size", value: "S", price: 0, stock: 4 },
  { productId: "prod-designer-jacket", name: "Size", value: "M", price: 0, stock: 6 },
  { productId: "prod-designer-jacket", name: "Size", value: "L", price: 0, stock: 5 },
  { productId: "prod-satin-midi", name: "Size", value: "S", price: 0, stock: 10 },
  { productId: "prod-satin-midi", name: "Size", value: "M", price: 0, stock: 12 },
  { productId: "prod-satin-midi", name: "Size", value: "L", price: 0, stock: 8 },
  { productId: "prod-running-shoes", name: "Size", value: "6", price: 0, stock: 6 },
  { productId: "prod-running-shoes", name: "Size", value: "7", price: 0, stock: 8 },
  { productId: "prod-running-shoes", name: "Size", value: "8", price: 0, stock: 6 },
  { productId: "prod-block-heels", name: "Size", value: "6", price: 0, stock: 7 },
  { productId: "prod-block-heels", name: "Size", value: "7", price: 0, stock: 9 },
  { productId: "prod-block-heels", name: "Size", value: "8", price: 0, stock: 6 },
  { productId: "prod-pump-heels", name: "Size", value: "6", price: 0, stock: 8 },
  { productId: "prod-pump-heels", name: "Size", value: "7", price: 0, stock: 10 },
  { productId: "prod-pump-heels", name: "Size", value: "8", price: 0, stock: 8 },
];

export const WOMENS_HERO_SLIDES = [
  {
    sortOrder: 0,
    isActive: true,
    imageDesktop:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80",
    imageMobile:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=768&q=80",
    heading: "New season womenswear",
    subheading:
      "Fresh dresses, blazers, and layers cut for modern silhouettes.",
    badgeText: "Just dropped",
    primaryCtaLabel: "Shop clothing",
    primaryCtaHref: "/products?genderTarget=WOMENS&category=cat-fashion",
    secondaryCtaLabel: "New arrivals",
    secondaryCtaHref: "/products?genderTarget=WOMENS&isNew=true",
  },
  {
    sortOrder: 1,
    isActive: true,
    imageDesktop:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1920&q=80",
    imageMobile:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=768&q=80",
    heading: "Heels that elevate every look",
    subheading:
      "Stilettos, pumps, and block heels — statement height with refined comfort.",
    badgeText: "Shoes & heels",
    primaryCtaLabel: "Shop heels",
    primaryCtaHref: "/products?genderTarget=WOMENS&category=cat-womens-shoes",
    secondaryCtaLabel: "View all shoes",
    secondaryCtaHref: "/products?genderTarget=WOMENS&category=cat-womens-shoes",
  },
  {
    sortOrder: 2,
    isActive: true,
    imageDesktop:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
    imageMobile:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=768&q=80",
    heading: "Dresses for every moment",
    subheading:
      "From wrap silhouettes to satin midis — polished pieces for day and night.",
    badgeText: "Dresses",
    primaryCtaLabel: "Shop dresses",
    primaryCtaHref: "/products?genderTarget=WOMENS&category=cat-fashion",
    secondaryCtaLabel: "Sale picks",
    secondaryCtaHref: "/products?genderTarget=WOMENS&onSale=true",
  },
  {
    sortOrder: 3,
    isActive: true,
    imageDesktop:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80",
    imageMobile:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=768&q=80",
    heading: "Curated for her",
    subheading:
      "Women's clothing and footwear only — edit your wardrobe in one place.",
    badgeText: "Hanara",
    primaryCtaLabel: "Explore collection",
    primaryCtaHref: "/products?genderTarget=WOMENS",
    secondaryCtaLabel: "Collections",
    secondaryCtaHref: "/collections",
  },
];

export const WOMENS_STOREFRONT_SETTINGS = {
  announcementEnabled: true,
  announcementText:
    "Free shipping on orders over $75 · New women's arrivals every week",
  announcementHref: "/products?genderTarget=WOMENS",
  homeTitle: "Women's apparel & footwear",
  homeDescription:
    "Shop curated women's clothing, dresses, and heels — new drops and timeless staples.",
  newsletterTitle: "Stay in the loop",
  newsletterSubtitle: "Early access to women's releases and members-only offers.",
  trustBadgesJson: [
    { icon: "truck", label: "Free shipping", sub: "On qualifying orders" },
    { icon: "refresh", label: "Easy returns", sub: "30-day policy" },
    { icon: "shield", label: "Secure checkout", sub: "Encrypted payments" },
  ],
  homeSectionOrderJson: [
    "announcement",
    "hero",
    "categories",
    "editorial",
    "promos",
    "newArrivals",
    "sale",
    "featured",
    "trending",
    "testimonials",
    "newsletter",
    "trust",
  ],
};
