import { seedCategories } from './categories';
import { seedTypes } from './types';
import { seedOccasions } from './occasions';
import { seedProducts } from './products';
import { seedUsers } from './users';
import { seedOrders } from './orders';
import { seedReviews } from './reviews';
import { seedPromoCodes } from './promo-codes';
import { prisma } from '../prisma';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data in reverse order of dependencies
    console.log('🧹 Clearing existing data...');
    await prisma.review.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.orderTimeline.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.promoCode.deleteMany();
    await prisma.address.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.type.deleteMany();
    await prisma.occasion.deleteMany();
    await prisma.user.deleteMany();

    // Seed data in order of dependencies
    console.log('👥 Seeding users...');
    await seedUsers();

    console.log('🏷️ Seeding categories...');
    await seedCategories();

    console.log('🔖 Seeding types...');
    await seedTypes();

    console.log('🎯 Seeding occasions...');
    await seedOccasions();

    console.log('📦 Seeding products...');
    await seedProducts();

    console.log('🎫 Seeding promo codes...');
    await seedPromoCodes();

    console.log('🛒 Seeding orders...');
    await seedOrders();

    console.log('⭐ Seeding reviews...');
    await seedReviews();

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.log('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding process finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.log('💥 Seeding failed:', error);
      process.exit(1);
    });
}