import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for address - matches Prisma Address model
const addressValidationSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().min(1, 'Phone number is required').optional(),
  street: z.string().min(1, 'Street address is required').optional(),
  city: z.string().min(1, 'City is required'),
  area: z.string().min(1, 'Area is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
});

// Mock third-party address validation service
async function validateWithThirdPartyService(address: {
  name: string;
  email?: string;
  phone?: string;
  street?: string;
  city: string;
  area: string;
  postalCode: string;
}) {
  // In a real implementation, this would call an external API like SmartyStreets, USPS, etc.
  // For now, we'll simulate validation with some basic rules
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const issues: string[] = [];
  const suggestions: string[] = [];
  let isValid = true;
  
  // Basic validation rules (these would be replaced by actual API validation)
  if (address.postalCode) {
    // For other countries, just check if postal code is not empty (basic validation)
    if (address.postalCode.trim().length < 3) {
      issues.push('Postal code seems too short');
      // Don't mark as invalid for international addresses
    }
  }
  
  // Area validation - Kuwait specific areas or general validation
    // For non-Kuwait countries, just ensure area is not empty
    if (!address.area || address.area.trim().length < 1) {
      issues.push('Area/District/Region is required');
      isValid = false;
    }
  
  // Street address validation - optional but recommended
  if (address.street && address.street.trim().length < 3) {
    issues.push('Street address should be at least 3 characters if provided');
    isValid = false;
  }
  
  // Optional: suggest including a street address for better delivery
  if (!address.street || address.street.trim().length === 0) {
    suggestions.push('Consider including a street address for better delivery accuracy');
  }
  
  // Name validation
  if (!address.name || address.name.trim().length < 2) {
    issues.push('Full name must be at least 2 characters');
    isValid = false;
  }
  
  // Email validation (optional but if provided, should be valid)
  if (address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
    issues.push('Invalid email format');
    isValid = false;
  }
  
  return {
    isValid,
    normalizedAddress: isValid ? {
      name: address.name,
      email: address.email,
      phone: address.phone,
      street: address.street,
      city: address.city,
      area: address.area,
      postalCode: address.postalCode,
    } : null,
    issues,
    suggestions
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body against schema
    const validationResult = addressValidationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const address = validationResult.data;
    
    // Call third-party validation service
    const validationResponse = await validateWithThirdPartyService(address);
    
    return NextResponse.json({
      isValid: validationResponse.isValid,
      normalizedAddress: validationResponse.normalizedAddress,
      issues: validationResponse.issues,
      suggestions: validationResponse.suggestions
    });
  } catch (error) {
    console.log('Error validating address:', error);
    return NextResponse.json(
      { error: 'Failed to validate address' },
      { status: 500 }
    );
  }
}