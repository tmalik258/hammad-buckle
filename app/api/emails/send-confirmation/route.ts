import { NextResponse } from "next/server";
import { z } from "zod";

// Email data validation schema
const emailSchema = z.object({
  orderId: z.string(),
  customerEmail: z.string().email(),
  customerName: z.string(),
  orderItems: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      price: z.number(),
    })
  ),
  orderTotal: z.number(),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  estimatedDelivery: z.string(),
});

// Mock function to send email via a service like SendGrid, Mailgun, etc.
async function sendOrderConfirmationEmail(data: z.infer<typeof emailSchema>) {
  // In a real implementation, this would connect to an email service API
  console.log(`Sending order confirmation email to ${data.customerEmail}`);
  
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Return success response (in production, would return actual API response)
  return {
    success: true,
    messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = emailSchema.parse(body);
    
    // Send the email
    const result = await sendOrderConfirmationEmail(validatedData);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Order confirmation email sent successfully",
      data: result,
    });
  } catch (error) {
    console.log("Error sending confirmation email:", error);
    
    // Check if it's a validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email data",
          errors: error,
        },
        { status: 400 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send confirmation email",
      },
      { status: 500 }
    );
  }
}