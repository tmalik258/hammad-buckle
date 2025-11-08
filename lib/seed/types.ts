import { prisma } from '../prisma';

const types = [
  {
    id: 'type-premium',
    name: 'Premium',
    description: 'High-end premium products with superior quality and features',
    isActive: true,
  },
  {
    id: 'type-standard',
    name: 'Standard',
    description: 'Standard quality products for everyday use',
    isActive: true,
  },
  {
    id: 'type-budget',
    name: 'Budget',
    description: 'Affordable products with good value for money',
    isActive: true,
  },
  {
    id: 'type-luxury',
    name: 'Luxury',
    description: 'Luxury products with exclusive features and premium materials',
    isActive: true,
  },
  {
    id: 'type-eco-friendly',
    name: 'Eco-Friendly',
    description: 'Environmentally conscious products with sustainable materials',
    isActive: true,
  },
  {
    id: 'type-smart',
    name: 'Smart',
    description: 'Smart products with advanced technology and connectivity features',
    isActive: true,
  },
  {
    id: 'type-professional',
    name: 'Professional',
    description: 'Professional-grade products for business and work use',
    isActive: true,
  },
];

export async function seedTypes() {
  try {
    for (const type of types) {
      await prisma.type.create({
        data: type,
      });
    }
    console.log('✅ Types seeded successfully');
  } catch (error) {
    console.log('❌ Error seeding types:', error);
    throw error;
  }
}