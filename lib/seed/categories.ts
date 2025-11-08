import { prisma } from '../prisma';

const categories = [
  {
    id: 'cat-electronics',
    name: 'Electronics',
    description: 'Latest gadgets, smartphones, laptops, and electronic accessories',
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20electronics%20store%20display%20with%20smartphones%20laptops%20tablets%20clean%20minimalist%20style&image_size=square_hd',
    productsCount: 0,
    featured: true,
  },
  {
    id: 'cat-fashion',
    name: 'Fashion & Clothing',
    description: 'Trendy clothing, shoes, and accessories for men and women',
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=fashion%20clothing%20store%20display%20with%20stylish%20clothes%20shoes%20accessories%20modern%20boutique&image_size=square_hd',
    productsCount: 0,
    featured: true,
  },
  {
    id: 'cat-home-garden',
    name: 'Home & Garden',
    description: 'Home decor, furniture, kitchen appliances, and garden supplies',
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=home%20decor%20furniture%20display%20modern%20living%20room%20setup%20plants%20cozy%20atmosphere&image_size=square_hd',
    productsCount: 0,
    featured: false,
  },
  {
    id: 'cat-sports-outdoors',
    name: 'Sports & Outdoors',
    description: 'Sports equipment, outdoor gear, fitness accessories, and activewear',
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=sports%20equipment%20display%20gym%20gear%20outdoor%20activities%20fitness%20accessories%20active%20lifestyle&image_size=square_hd',
    productsCount: 0,
    featured: false,
  },
  {
    id: 'cat-books-media',
    name: 'Books & Media',
    description: 'Books, magazines, movies, music, and educational materials',
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=bookstore%20display%20with%20books%20magazines%20cozy%20reading%20corner%20warm%20lighting&image_size=square_hd',
    productsCount: 0,
    featured: false,
  },
];

export async function seedCategories() {
  try {
    for (const category of categories) {
      await prisma.category.create({
        data: category,
      });
      console.log(`✅ Created category: ${category.name}`);
    }
    console.log(`🏷️ Successfully seeded ${categories.length} categories`);
  } catch (error) {
    console.log('❌ Error seeding categories:', error);
    throw error;
  }
}