import { prisma } from '../prisma';

const occasions = [
  {
    id: 'occasion-everyday',
    name: 'Everyday Use',
    description: 'Perfect for daily activities and regular use',
    isActive: true,
  },
  {
    id: 'occasion-work-office',
    name: 'Work & Office',
    description: 'Professional use for work, office, and business environments',
    isActive: true,
  },
  {
    id: 'occasion-home-personal',
    name: 'Home & Personal',
    description: 'For home use, personal activities, and leisure time',
    isActive: true,
  },
  {
    id: 'occasion-special-events',
    name: 'Special Events',
    description: 'For special occasions, celebrations, and important events',
    isActive: true,
  },
  {
    id: 'occasion-fitness-sports',
    name: 'Fitness & Sports',
    description: 'For sports activities, fitness, and active lifestyle',
    isActive: true,
  },
  {
    id: 'occasion-travel-outdoor',
    name: 'Travel & Outdoor',
    description: 'For travel, outdoor activities, and adventures',
    isActive: true,
  },
];

export async function seedOccasions() {
  try {
    for (const occasion of occasions) {
      await prisma.occasion.create({
        data: occasion,
      });
    }
    console.log('✅ Occasions seeded successfully');
  } catch (error) {
    console.log('❌ Error seeding occasions:', error);
    throw error;
  }
}