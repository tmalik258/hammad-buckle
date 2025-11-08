import { prisma } from '../prisma';

const reviews = [
  // iPhone 15 Pro Max reviews
  {
    userId: 'user-customer-1',
    productId: 'prod-iphone-15',
    rating: 5,
    title: 'Amazing phone with incredible camera!',
    comment: 'The iPhone 15 Pro Max exceeded my expectations. The camera quality is outstanding, especially in low light conditions. The titanium build feels premium and the battery life easily lasts a full day of heavy usage.',
    verified: true,
    helpful: 12,
  },
  {
    userId: 'user-customer-2',
    productId: 'prod-iphone-15',
    rating: 4,
    title: 'Great phone but expensive',
    comment: 'Excellent performance and build quality. The A17 Pro chip handles everything smoothly. Only downside is the high price, but you get what you pay for with Apple.',
    verified: false,
    helpful: 8,
  },
  // MacBook Air M3 reviews
  {
    userId: 'user-customer-2',
    productId: 'prod-macbook-air',
    rating: 5,
    title: 'Perfect laptop for productivity',
    comment: 'The M3 chip is incredibly fast and efficient. Battery life is amazing - I can work for 12+ hours without charging. The display is crisp and colors are vibrant. Highly recommended for professionals.',
    verified: true,
    helpful: 15,
  },
  // Designer Jacket reviews
  {
    userId: 'user-customer-1',
    productId: 'prod-designer-jacket',
    rating: 4,
    title: 'High quality leather, great fit',
    comment: 'Beautiful leather jacket with excellent craftsmanship. The fit is perfect and the leather feels premium. Worth the investment for a timeless piece.',
    verified: true,
    helpful: 6,
  },
  {
    userId: 'user-customer-2',
    productId: 'prod-designer-jacket',
    rating: 5,
    title: 'Love this jacket!',
    comment: 'Absolutely love this leather jacket! The quality is outstanding and it looks even better in person. Gets compliments every time I wear it.',
    verified: false,
    helpful: 4,
  },
  // Running Shoes reviews
  {
    userId: 'user-customer-1',
    productId: 'prod-running-shoes',
    rating: 4,
    title: 'Comfortable for long runs',
    comment: 'Great running shoes with excellent cushioning. Very comfortable for long distance running. The breathable upper keeps feet cool during workouts.',
    verified: true,
    helpful: 9,
  },
  // Coffee Maker reviews
  {
    userId: 'user-customer-2',
    productId: 'prod-coffee-maker',
    rating: 4,
    title: 'Smart features are convenient',
    comment: 'Love being able to start my coffee from bed using the app. Makes great coffee and the programmable features are very convenient for busy mornings.',
    verified: true,
    helpful: 7,
  },
];

export async function seedReviews() {
  try {
    // Create reviews
    for (const review of reviews) {
      await prisma.review.create({
        data: review,
      });
      console.log(`✅ Created review for product: ${review.productId}`);
    }

    // Update product ratings and review counts
    const productUpdates = [
      { id: 'prod-iphone-15', rating: 4.5, reviewCount: 2 },
      { id: 'prod-macbook-air', rating: 5.0, reviewCount: 1 },
      { id: 'prod-designer-jacket', rating: 4.5, reviewCount: 2 },
      { id: 'prod-running-shoes', rating: 4.0, reviewCount: 1 },
      { id: 'prod-coffee-maker', rating: 4.0, reviewCount: 1 },
    ];

    for (const update of productUpdates) {
      await prisma.product.update({
        where: { id: update.id },
        data: {
          rating: update.rating,
          reviewCount: update.reviewCount,
        },
      });
      console.log(`✅ Updated product ratings: ${update.id}`);
    }

    console.log(`⭐ Successfully seeded ${reviews.length} reviews`);
  } catch (error) {
    console.log('❌ Error seeding reviews:', error);
    throw error;
  }
}