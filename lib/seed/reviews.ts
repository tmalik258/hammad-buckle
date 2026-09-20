import { prisma } from '../prisma';

const reviews = [
  {
    userId: 'user-customer-1',
    productId: 'prod-wrap-dress',
    rating: 5,
    title: 'Perfect fit and fabric',
    comment:
      'The wrap dress drapes beautifully and fits true to size. I wore it to dinner and received so many compliments.',
    verified: true,
    helpful: 11,
  },
  {
    userId: 'user-customer-2',
    productId: 'prod-wrap-dress',
    rating: 4,
    title: 'Elegant everyday dress',
    comment:
      'Lovely silhouette and comfortable for all-day wear. The fabric feels premium without being stiff.',
    verified: false,
    helpful: 6,
  },
  {
    userId: 'user-customer-2',
    productId: 'prod-linen-blazer',
    rating: 5,
    title: 'My go-to blazer',
    comment:
      'Lightweight linen with a sharp cut — works with denim or tailored trousers. Exactly what I wanted.',
    verified: true,
    helpful: 9,
  },
  {
    userId: 'user-customer-1',
    productId: 'prod-designer-jacket',
    rating: 4,
    title: 'High quality leather, great fit',
    comment:
      'Beautiful leather jacket with excellent craftsmanship. The cropped fit is flattering and versatile.',
    verified: true,
    helpful: 6,
  },
  {
    userId: 'user-customer-2',
    productId: 'prod-designer-jacket',
    rating: 5,
    title: 'Worth the investment',
    comment:
      'Absolutely love this jacket — the leather feels premium and it elevates every outfit.',
    verified: false,
    helpful: 4,
  },
  {
    userId: 'user-customer-1',
    productId: 'prod-running-shoes',
    rating: 5,
    title: 'Stunning heels',
    comment:
      'These stilettos are surprisingly comfortable for the height. Perfect for evenings out.',
    verified: true,
    helpful: 8,
  },
  {
    userId: 'user-customer-2',
    productId: 'prod-block-heels',
    rating: 4,
    title: 'Stable and stylish',
    comment:
      'The block heel makes these easy to walk in. Great with dresses and cropped trousers.',
    verified: true,
    helpful: 5,
  },
];

export async function seedReviews() {
  try {
    for (const review of reviews) {
      await prisma.review.create({
        data: review,
      });
      console.log(`✅ Created review for product: ${review.productId}`);
    }

    const productUpdates = [
      { id: 'prod-wrap-dress', rating: 4.5, reviewCount: 2 },
      { id: 'prod-linen-blazer', rating: 5.0, reviewCount: 1 },
      { id: 'prod-designer-jacket', rating: 4.5, reviewCount: 2 },
      { id: 'prod-running-shoes', rating: 5.0, reviewCount: 1 },
      { id: 'prod-block-heels', rating: 4.0, reviewCount: 1 },
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
