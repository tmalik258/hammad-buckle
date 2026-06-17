import { GenderTarget } from '@prisma/client';
import { prisma } from '../prisma';

const products = [
  // Electronics
  {
    id: 'prod-iphone-15',
    name: 'iPhone 15 Pro Max',
    description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system',
    price: 1199.99,
    originalPrice: 1299.99,
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20smartphone%20iPhone%20style%20premium%20design%20titanium%20finish%20product%20photography&image_size=square_hd',
    images: [
      'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%20front%20view%20premium%20smartphone%20clean%20background&image_size=square_hd',
      'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%20back%20view%20camera%20system%20titanium%20finish&image_size=square_hd'
    ],
    categoryId: 'cat-electronics',
    averageRating: 4.8,
    reviewCount: 0,
    inStock: true,
    stockQuantity: 50,
    isNew: true,
    onSale: true,
    featured: true,
    sku: 'IPH-15-PM-256',
    weight: 221.0,
    dimensions: '159.9 x 76.7 x 8.25 mm',
    genderTarget: GenderTarget.UNISEX,
  },
  {
    id: 'prod-macbook-air',
    name: 'MacBook Air M3',
    description: 'Ultra-thin laptop with M3 chip, 13-inch Liquid Retina display, and all-day battery life',
    price: 1099.99,
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20laptop%20MacBook%20style%20thin%20design%20premium%20aluminum%20finish%20product%20photography&image_size=square_hd',
    categoryId: 'cat-electronics',
    averageRating: 4.7,
    reviewCount: 0,
    inStock: true,
    stockQuantity: 25,
    isNew: true,
    onSale: false,
    featured: true,
    sku: 'MBA-M3-13-256',
    weight: 1290.0,
    dimensions: '304.1 x 215 x 11.3 mm',
    genderTarget: GenderTarget.UNISEX,
  },
  // Fashion
  {
    id: 'prod-designer-jacket',
    name: 'Premium Leather Jacket',
    description: 'Handcrafted genuine leather jacket with modern fit and premium finishing',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20leather%20jacket%20black%20modern%20fit%20fashion%20photography%20studio%20lighting&image_size=square_hd',
    categoryId: 'cat-fashion',
    averageRating: 4.6,
    reviewCount: 0,
    inStock: true,
    stockQuantity: 15,
    isNew: false,
    onSale: true,
    featured: true,
    sku: 'LJ-PREM-BLK-L',
    weight: 1200.0,
    genderTarget: GenderTarget.WOMENS,
  },
  {
    id: 'prod-running-shoes',
    name: 'Ultra Boost Running Shoes',
    description: 'High-performance running shoes with responsive cushioning and breathable upper',
    price: 179.99,
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20running%20shoes%20athletic%20footwear%20white%20and%20blue%20design%20product%20photography&image_size=square_hd',
    categoryId: 'cat-fashion',
    averageRating: 4.5,
    reviewCount: 0,
    inStock: true,
    stockQuantity: 30,
    isNew: true,
    onSale: false,
    featured: false,
    sku: 'UB-RUN-WB-10',
    weight: 320.0,
    genderTarget: GenderTarget.UNISEX,
  },
  // Home & Garden
  {
    id: 'prod-coffee-maker',
    name: 'Smart Coffee Maker Pro',
    description: 'WiFi-enabled coffee maker with programmable brewing and mobile app control',
    price: 249.99,
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20coffee%20maker%20machine%20stainless%20steel%20kitchen%20appliance%20product%20photography&image_size=square_hd',
    categoryId: 'cat-home-garden',
    averageRating: 4.4,
    reviewCount: 0,
    inStock: true,
    stockQuantity: 20,
    isNew: true,
    onSale: false,
    featured: false,
    sku: 'CM-SMART-PRO',
    weight: 3500.0,
    dimensions: '350 x 200 x 400 mm',
    genderTarget: GenderTarget.UNISEX,
  },
];

const productVariants = [
  // iPhone variants
  {
    productId: 'prod-iphone-15',
    name: 'Storage',
    value: '256GB',
    price: 0,
    stock: 30,
  },
  {
    productId: 'prod-iphone-15',
    name: 'Storage',
    value: '512GB',
    price: 200,
    stock: 15,
  },
  {
    productId: 'prod-iphone-15',
    name: 'Color',
    value: 'Natural Titanium',
    price: 0,
    stock: 25,
  },
  {
    productId: 'prod-iphone-15',
    name: 'Color',
    value: 'Blue Titanium',
    price: 0,
    stock: 20,
  },
  // Jacket variants
  {
    productId: 'prod-designer-jacket',
    name: 'Size',
    value: 'M',
    price: 0,
    stock: 5,
  },
  {
    productId: 'prod-designer-jacket',
    name: 'Size',
    value: 'L',
    price: 0,
    stock: 7,
  },
  {
    productId: 'prod-designer-jacket',
    name: 'Size',
    value: 'XL',
    price: 0,
    stock: 3,
  },
  // Shoes variants
  {
    productId: 'prod-running-shoes',
    name: 'Size',
    value: '9',
    price: 0,
    stock: 8,
  },
  {
    productId: 'prod-running-shoes',
    name: 'Size',
    value: '10',
    price: 0,
    stock: 12,
  },
  {
    productId: 'prod-running-shoes',
    name: 'Size',
    value: '11',
    price: 0,
    stock: 10,
  },
];

export async function seedProducts() {
  try {
    // Create products
    for (const product of products) {
      await prisma.product.create({
        data: product,
      });
      console.log(`✅ Created product: ${product.name}`);
    }

    // Create product variants
    for (const variant of productVariants) {
      await prisma.productVariant.create({
        data: variant,
      });
      console.log(`✅ Created variant: ${variant.name} - ${variant.value}`);
    }

    // Update category product counts
    const categoryUpdates = [
      { id: 'cat-electronics', count: 2 },
      { id: 'cat-fashion', count: 2 },
      { id: 'cat-home-garden', count: 1 },
    ];

    for (const update of categoryUpdates) {
      await prisma.category.update({
        where: { id: update.id },
        data: { productsCount: update.count },
      });
    }

    console.log(`📦 Successfully seeded ${products.length} products and ${productVariants.length} variants`);
  } catch (error) {
    console.log('❌ Error seeding products:', error);
    throw error;
  }
}