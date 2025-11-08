import { prisma } from '../prisma';
import { UserRole } from '@prisma/client';

const users = [
  {
    id: 'user-admin-1',
    email: 'admin@wizza.com',
    name: 'Admin User',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20business%20person%20avatar%20friendly%20smile%20modern%20style&image_size=square',
    role: UserRole.ADMIN,
  },
  {
    id: 'user-customer-1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=casual%20male%20avatar%20friendly%20approachable%20modern%20style&image_size=square',
    role: UserRole.CUSTOMER,
  },
  {
    id: 'user-customer-2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20avatar%20confident%20smile%20modern%20style&image_size=square',
    role: UserRole.CUSTOMER,
  }
];

const addresses = [
  {
    userId: 'user-customer-1',
    type: 'SHIPPING' as const,
    name: 'John Doe - Home',
    email: 'john.doe@example.com',
    street: '123 Main Street, Apt 4B',
    city: 'Kuwait City',
    area: 'Al Asimah',
    postalCode: '13001',
    isDefault: true,
  },
  {
    userId: 'user-customer-1',
    type: 'BILLING' as const,
    name: 'John Doe - Office',
    email: 'john.doe@example.com',
    street: '456 Business Ave',
    city: 'Kuwait City',
    area: 'Al Asimah',
    postalCode: '13002',
    isDefault: false,
  },
  {
    userId: 'user-customer-2',
    type: 'BOTH' as const,
    name: 'Jane Smith - Home',
    email: 'jane.smith@example.com',
    street: '789 Residential Blvd',
    city: 'Hawalli',
    area: 'Hawalli',
    postalCode: '32001',
    isDefault: true,
  },
];

export async function seedUsers() {
  try {
    // Create users
    for (const user of users) {
      await prisma.user.create({
        data: user,
      });
      console.log(`✅ Created user: ${user.name} (${user.role})`);
    }

    // Create addresses
    for (const address of addresses) {
      await prisma.address.create({
        data: address,
      });
      console.log(`✅ Created address for user: ${address.userId}`);
    }

    console.log(`👥 Successfully seeded ${users.length} users and ${addresses.length} addresses`);
  } catch (error) {
    console.log('❌ Error seeding users:', error);
    throw error;
  }
}