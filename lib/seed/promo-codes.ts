import { prisma } from '../prisma';
import { DiscountType } from '@prisma/client';

/**
 * Comprehensive Promo Codes Seed Data
 * 
 * This file contains seed data for promotional codes with various scenarios:
 * - Percentage discounts (with and without caps)
 * - Fixed amount discounts
 * - Limited usage codes
 * - Expired codes for testing
 * - Active and inactive codes
 * - Minimum order requirements
 * 
 * Field Validation Rules:
 * - code: Must be unique, alphanumeric, typically 4-20 characters
 * - discountType: PERCENTAGE or FIXED (enum)
 * - discountValue: For PERCENTAGE (0-100), for FIXED (positive amount)
 * - minimumOrderAmount: Optional, must be positive if set
 * - maxDiscountAmount: Optional, only relevant for PERCENTAGE discounts
 * - expirationDate: Optional, must be future date for active codes
 * - usageLimit: Optional, must be positive if set
 * - usageCount: Defaults to 0, tracks current usage
 * - isActive: Boolean, controls if code can be used
 */

const promoCodes = [
  // Active Percentage Discounts
  {
    id: 'promo-welcome10',
    code: 'WELCOME10',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10.0, // 10% discount
    minimumOrderAmount: 50.0, // Minimum order of $50
    maxDiscountAmount: 20.0, // Maximum discount of $20
    expirationDate: new Date('2025-12-31T23:59:59Z'), // Valid until end of 2025
    usageLimit: 1000, // Can be used 1000 times
    usageCount: 45, // Already used 45 times
    isActive: true,
  },
  {
    id: 'promo-save25',
    code: 'SAVE25',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 25.0, // 25% discount
    minimumOrderAmount: 100.0, // Minimum order of $100
    maxDiscountAmount: 50.0, // Maximum discount of $50
    expirationDate: new Date('2025-06-30T23:59:59Z'), // Valid until mid-2025
    usageLimit: 500, // Limited to 500 uses
    usageCount: 123, // Already used 123 times
    isActive: true,
  },
  {
    id: 'promo-student15',
    code: 'STUDENT15',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 15.0, // 15% discount
    minimumOrderAmount: 30.0, // Lower minimum for students
    maxDiscountAmount: 25.0, // Maximum discount of $25
    expirationDate: new Date('2025-08-31T23:59:59Z'), // Valid through summer
    usageLimit: null, // Unlimited usage
    usageCount: 234, // Already used 234 times
    isActive: true,
  },

  // Active Fixed Amount Discounts
  {
    id: 'promo-fixed20',
    code: 'FIXED20',
    discountType: DiscountType.FIXED,
    discountValue: 20.0, // $20 off
    minimumOrderAmount: 80.0, // Minimum order of $80
    maxDiscountAmount: null, // Not applicable for fixed discounts
    expirationDate: new Date('2025-09-30T23:59:59Z'), // Valid until fall 2025
    usageLimit: 200, // Limited to 200 uses
    usageCount: 67, // Already used 67 times
    isActive: true,
  },
  {
    id: 'promo-freeship',
    code: 'FREESHIP',
    discountType: DiscountType.FIXED,
    discountValue: 15.0, // $15 off (typical shipping cost)
    minimumOrderAmount: 75.0, // Minimum order of $75
    maxDiscountAmount: null, // Not applicable for fixed discounts
    expirationDate: null, // No expiration
    usageLimit: null, // Unlimited usage
    usageCount: 456, // Already used 456 times
    isActive: true,
  },
  {
    id: 'promo-newuser50',
    code: 'NEWUSER50',
    discountType: DiscountType.FIXED,
    discountValue: 50.0, // $50 off for new users
    minimumOrderAmount: 200.0, // High minimum for large discount
    maxDiscountAmount: null, // Not applicable for fixed discounts
    expirationDate: new Date('2025-12-31T23:59:59Z'), // Valid until end of 2025
    usageLimit: 1, // One-time use per code
    usageCount: 0, // Not used yet
    isActive: true,
  },

  // High-Value Percentage Discounts (with caps)
  {
    id: 'promo-vip30',
    code: 'VIP30',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 30.0, // 30% discount
    minimumOrderAmount: 150.0, // Higher minimum for VIP discount
    maxDiscountAmount: 100.0, // Cap at $100 discount
    expirationDate: new Date('2025-03-31T23:59:59Z'), // Limited time offer
    usageLimit: 50, // Very limited usage
    usageCount: 12, // Already used 12 times
    isActive: true,
  },
  {
    id: 'promo-flash40',
    code: 'FLASH40',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 40.0, // 40% discount
    minimumOrderAmount: 250.0, // High minimum for flash sale
    maxDiscountAmount: 150.0, // Cap at $150 discount
    expirationDate: new Date('2025-02-14T23:59:59Z'), // Valentine's Day flash sale
    usageLimit: 100, // Limited flash sale usage
    usageCount: 78, // Almost used up
    isActive: true,
  },

  // Expired Codes (for testing)
  {
    id: 'promo-expired20',
    code: 'EXPIRED20',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 20.0, // 20% discount
    minimumOrderAmount: 60.0, // Minimum order of $60
    maxDiscountAmount: 40.0, // Maximum discount of $40
    expirationDate: new Date('2024-12-31T23:59:59Z'), // Expired
    usageLimit: 300, // Had usage limit
    usageCount: 289, // Was heavily used
    isActive: true, // Still marked active but expired
  },
  {
    id: 'promo-oldcode',
    code: 'OLDCODE',
    discountType: DiscountType.FIXED,
    discountValue: 25.0, // $25 off
    minimumOrderAmount: 100.0, // Minimum order of $100
    maxDiscountAmount: null, // Not applicable for fixed discounts
    expirationDate: new Date('2024-06-30T23:59:59Z'), // Expired mid-2024
    usageLimit: 150, // Had usage limit
    usageCount: 150, // Fully used up
    isActive: false, // Deactivated
  },

  // Inactive Codes (for testing)
  {
    id: 'promo-inactive',
    code: 'INACTIVE',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 15.0, // 15% discount
    minimumOrderAmount: 40.0, // Minimum order of $40
    maxDiscountAmount: 30.0, // Maximum discount of $30
    expirationDate: new Date('2025-12-31T23:59:59Z'), // Valid date
    usageLimit: 200, // Has usage limit
    usageCount: 0, // Not used yet
    isActive: false, // Deactivated
  },

  // No Minimum Order Codes
  {
    id: 'promo-any5',
    code: 'ANY5',
    discountType: DiscountType.FIXED,
    discountValue: 5.0, // $5 off
    minimumOrderAmount: null, // No minimum order
    maxDiscountAmount: null, // Not applicable for fixed discounts
    expirationDate: new Date('2025-12-31T23:59:59Z'), // Valid until end of 2025
    usageLimit: null, // Unlimited usage
    usageCount: 1234, // Heavily used
    isActive: true,
  },
  {
    id: 'promo-small3',
    code: 'SMALL3',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 3.0, // 3% discount
    minimumOrderAmount: null, // No minimum order
    maxDiscountAmount: 10.0, // Small cap of $10
    expirationDate: null, // No expiration
    usageLimit: null, // Unlimited usage
    usageCount: 567, // Moderately used
    isActive: true,
  },

  // Seasonal/Holiday Codes
  {
    id: 'promo-summer2025',
    code: 'SUMMER2025',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 20.0, // 20% discount
    minimumOrderAmount: 75.0, // Minimum order of $75
    maxDiscountAmount: 60.0, // Maximum discount of $60
    expirationDate: new Date('2025-09-22T23:59:59Z'), // End of summer 2025
    usageLimit: 750, // Seasonal limit
    usageCount: 0, // New seasonal code
    isActive: true,
  },
  {
    id: 'promo-holiday50',
    code: 'HOLIDAY50',
    discountType: DiscountType.FIXED,
    discountValue: 50.0, // $50 off
    minimumOrderAmount: 300.0, // High minimum for holiday shopping
    maxDiscountAmount: null, // Not applicable for fixed discounts
    expirationDate: new Date('2025-01-15T23:59:59Z'), // Post-holiday cleanup
    usageLimit: 100, // Limited holiday offer
    usageCount: 23, // Some usage during holidays
    isActive: true,
  },
];

export async function seedPromoCodes() {
  try {
    console.log('🎫 Starting promo codes seeding...');

    // Create promo codes
    for (const promoCode of promoCodes) {
      await prisma.promoCode.create({
        data: promoCode,
      });
      console.log(`✅ Created promo code: ${promoCode.code} (${promoCode.discountType} - ${promoCode.discountValue}${promoCode.discountType === 'PERCENTAGE' ? '%' : '$'})`);
    }

    // Log summary statistics
    const activeCount = promoCodes.filter(p => p.isActive).length;
    const inactiveCount = promoCodes.filter(p => !p.isActive).length;
    const expiredCount = promoCodes.filter(p => p.expirationDate && p.expirationDate < new Date()).length;
    const percentageCount = promoCodes.filter(p => p.discountType === DiscountType.PERCENTAGE).length;
    const fixedCount = promoCodes.filter(p => p.discountType === DiscountType.FIXED).length;

    console.log(`🎫 Successfully seeded ${promoCodes.length} promo codes:`);
    console.log(`   📊 ${activeCount} active, ${inactiveCount} inactive`);
    console.log(`   ⏰ ${expiredCount} expired codes (for testing)`);
    console.log(`   📈 ${percentageCount} percentage discounts, ${fixedCount} fixed amount discounts`);
    console.log(`   💰 Total usage count: ${promoCodes.reduce((sum, p) => sum + p.usageCount, 0)}`);

  } catch (error) {
    console.log('❌ Error seeding promo codes:', error);
    throw error;
  }
}