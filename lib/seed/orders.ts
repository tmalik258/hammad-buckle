import { prisma } from '../prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';

const orders = [
  {
    id: 'order-001',
    userId: 'user-customer-1',
    orderNumber: 'WZ-2024-001',
    status: OrderStatus.DELIVERED,
    totalAmount: 2379.98,
    subtotal: 2299.98,
    tax: 65.00,
    shipping: 15.00,
    discount: 0,
    paymentMethod: 'Credit Card',
    paymentStatus: PaymentStatus.PAID,
    trackingNumber: 'TRK123456789',
    estimatedDelivery: new Date('2024-01-20'),
    deliveredAt: new Date('2024-01-18'),
  },
  {
    id: 'order-002',
    userId: 'user-customer-2',
    orderNumber: 'WZ-2024-002',
    status: OrderStatus.SHIPPED,
    totalAmount: 507.48,
    subtotal: 479.98,
    tax: 22.50,
    shipping: 5.00,
    discount: 0,
    paymentMethod: 'PayPal',
    paymentStatus: PaymentStatus.PAID,
    trackingNumber: 'TRK987654321',
    estimatedDelivery: new Date('2024-01-25'),
  },
  {
    id: 'order-003',
    userId: 'user-customer-1',
    orderNumber: 'WZ-2024-003',
    status: OrderStatus.PROCESSING,
    totalAmount: 264.99,
    subtotal: 249.99,
    tax: 12.50,
    shipping: 2.50,
    discount: 0,
    paymentMethod: 'Credit Card',
    paymentStatus: PaymentStatus.PAID,
  },
];

const orderItems = [
  // Order 1 items
  {
    orderId: 'order-001',
    productId: 'prod-iphone-15',
    quantity: 1,
    price: 1199.99,
    total: 1199.99,
  },
  {
    orderId: 'order-001',
    productId: 'prod-macbook-air',
    quantity: 1,
    price: 1099.99,
    total: 1099.99,
  },
  // Order 2 items
  {
    orderId: 'order-002',
    productId: 'prod-designer-jacket',
    quantity: 1,
    price: 299.99,
    total: 299.99,
  },
  {
    orderId: 'order-002',
    productId: 'prod-running-shoes',
    quantity: 1,
    price: 179.99,
    total: 179.99,
  },
  // Order 3 items
  {
    orderId: 'order-003',
    productId: 'prod-coffee-maker',
    quantity: 1,
    price: 249.99,
    total: 249.99,
  },
];

const orderTimelines = [
  // Order 1 timeline (Delivered)
  {
    orderId: 'order-001',
    status: 'Order Placed',
    description: 'Your order has been successfully placed',
    timestamp: new Date('2024-01-15T10:00:00Z'),
  },
  {
    orderId: 'order-001',
    status: 'Payment Confirmed',
    description: 'Payment has been processed successfully',
    timestamp: new Date('2024-01-15T10:05:00Z'),
  },
  {
    orderId: 'order-001',
    status: 'Processing',
    description: 'Your order is being prepared for shipment',
    timestamp: new Date('2024-01-15T14:00:00Z'),
  },
  {
    orderId: 'order-001',
    status: 'Shipped',
    description: 'Your order has been shipped with tracking number TRK123456789',
    timestamp: new Date('2024-01-16T09:00:00Z'),
  },
  {
    orderId: 'order-001',
    status: 'Out for Delivery',
    description: 'Your order is out for delivery',
    timestamp: new Date('2024-01-18T08:00:00Z'),
  },
  {
    orderId: 'order-001',
    status: 'Delivered',
    description: 'Your order has been delivered successfully',
    timestamp: new Date('2024-01-18T15:30:00Z'),
  },
  // Order 2 timeline (Shipped)
  {
    orderId: 'order-002',
    status: 'Order Placed',
    description: 'Your order has been successfully placed',
    timestamp: new Date('2024-01-20T11:00:00Z'),
  },
  {
    orderId: 'order-002',
    status: 'Payment Confirmed',
    description: 'Payment has been processed successfully',
    timestamp: new Date('2024-01-20T11:02:00Z'),
  },
  {
    orderId: 'order-002',
    status: 'Processing',
    description: 'Your order is being prepared for shipment',
    timestamp: new Date('2024-01-21T10:00:00Z'),
  },
  {
    orderId: 'order-002',
    status: 'Shipped',
    description: 'Your order has been shipped with tracking number TRK987654321',
    timestamp: new Date('2024-01-22T14:00:00Z'),
  },
  // Order 3 timeline (Processing)
  {
    orderId: 'order-003',
    status: 'Order Placed',
    description: 'Your order has been successfully placed',
    timestamp: new Date('2024-01-23T16:00:00Z'),
  },
  {
    orderId: 'order-003',
    status: 'Payment Confirmed',
    description: 'Payment has been processed successfully',
    timestamp: new Date('2024-01-23T16:03:00Z'),
  },
  {
    orderId: 'order-003',
    status: 'Processing',
    description: 'Your order is being prepared for shipment',
    timestamp: new Date('2024-01-24T09:00:00Z'),
  },
];

export async function seedOrders() {
  try {
    // Get addresses for orders
    const addresses = await prisma.address.findMany();
    const johnShippingAddress = addresses.find(a => a.userId === 'user-customer-1' && a.type === 'SHIPPING');
    const johnBillingAddress = addresses.find(a => a.userId === 'user-customer-1' && a.type === 'BILLING');
    const janeAddress = addresses.find(a => a.userId === 'user-customer-2');

    // Create orders with address references
    const ordersWithAddresses = [
      {
        ...orders[0],
        shippingAddressId: johnShippingAddress?.id,
        billingAddressId: johnBillingAddress?.id,
      },
      {
        ...orders[1],
        shippingAddressId: janeAddress?.id,
        billingAddressId: janeAddress?.id,
      },
      {
        ...orders[2],
        shippingAddressId: johnShippingAddress?.id,
        billingAddressId: johnBillingAddress?.id,
      },
    ];

    // Create orders
    for (const order of ordersWithAddresses) {
      await prisma.order.create({
        data: order,
      });
      console.log(`✅ Created order: ${order.orderNumber}`);
    }

    // Create order items
    for (const item of orderItems) {
      await prisma.orderItem.create({
        data: item,
      });
      console.log(`✅ Created order item for order: ${item.orderId}`);
    }

    // Create order timeline events
    for (const timeline of orderTimelines) {
      await prisma.orderTimeline.create({
        data: timeline,
      });
      console.log(`✅ Created timeline event: ${timeline.status}`);
    }

    console.log(`🛒 Successfully seeded ${orders.length} orders, ${orderItems.length} order items, and ${orderTimelines.length} timeline events`);
  } catch (error) {
    console.log('❌ Error seeding orders:', error);
    throw error;
  }
}