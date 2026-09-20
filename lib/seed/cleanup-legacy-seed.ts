import { prisma } from "../prisma";
import {
  LEGACY_CATEGORY_IDS,
  LEGACY_PRODUCT_IDS,
  LEGACY_SEED_ORDER_IDS,
  LEGACY_SEED_PROMO_IDS,
  LEGACY_SEED_USER_IDS,
} from "./legacy-seed-ids";
import { WOMENS_PRODUCTS, WOMENS_PRODUCT_VARIANTS } from "./womens-catalog-data";

export async function removeLegacySeedData() {
  let removedOrders = 0;
  let removedProducts = 0;
  let removedCategories = 0;
  let removedUsers = 0;
  let removedPromos = 0;
  let removedVariants = 0;

  if (LEGACY_SEED_ORDER_IDS.length > 0) {
    await prisma.payment.deleteMany({
      where: { orderId: { in: [...LEGACY_SEED_ORDER_IDS] } },
    });
    await prisma.promoCodeUsage.deleteMany({
      where: { orderId: { in: [...LEGACY_SEED_ORDER_IDS] } },
    });
    await prisma.orderTimeline.deleteMany({
      where: { orderId: { in: [...LEGACY_SEED_ORDER_IDS] } },
    });
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: [...LEGACY_SEED_ORDER_IDS] } },
    });
    const orderResult = await prisma.order.deleteMany({
      where: { id: { in: [...LEGACY_SEED_ORDER_IDS] } },
    });
    removedOrders = orderResult.count;
  }

  if (LEGACY_SEED_PROMO_IDS.length > 0) {
    const promoResult = await prisma.promoCode.deleteMany({
      where: { id: { in: [...LEGACY_SEED_PROMO_IDS] } },
    });
    removedPromos = promoResult.count;
  }

  if (LEGACY_PRODUCT_IDS.length > 0) {
    await prisma.homeProductPick.deleteMany({
      where: { productId: { in: [...LEGACY_PRODUCT_IDS] } },
    });
    await prisma.review.deleteMany({
      where: { productId: { in: [...LEGACY_PRODUCT_IDS] } },
    });
    await prisma.cartItem.deleteMany({
      where: { productId: { in: [...LEGACY_PRODUCT_IDS] } },
    });
    await prisma.wishlistItem.deleteMany({
      where: { productId: { in: [...LEGACY_PRODUCT_IDS] } },
    });

    const productResult = await prisma.product.deleteMany({
      where: { id: { in: [...LEGACY_PRODUCT_IDS] } },
    });
    removedProducts = productResult.count;
  }

  if (LEGACY_CATEGORY_IDS.length > 0) {
    const categoryResult = await prisma.category.deleteMany({
      where: { id: { in: [...LEGACY_CATEGORY_IDS] } },
    });
    removedCategories = categoryResult.count;
  }

  const validVariantKeys = new Set(
    WOMENS_PRODUCT_VARIANTS.map(
      (variant) => `${variant.productId}:${variant.name}:${variant.value}`,
    ),
  );
  const womensProductIds = WOMENS_PRODUCTS.map((product) => product.id);
  const staleVariants = await prisma.productVariant.findMany({
    where: { productId: { in: womensProductIds } },
    select: { id: true, productId: true, name: true, value: true },
  });

  for (const variant of staleVariants) {
    const key = `${variant.productId}:${variant.name}:${variant.value}`;
    if (validVariantKeys.has(key)) continue;

    await prisma.cartItem.deleteMany({ where: { variantId: variant.id } });
    await prisma.productVariant.delete({ where: { id: variant.id } });
    removedVariants += 1;
  }

  if (LEGACY_SEED_USER_IDS.length > 0) {
    const userResult = await prisma.user.deleteMany({
      where: { id: { in: [...LEGACY_SEED_USER_IDS] } },
    });
    removedUsers = userResult.count;
  }

  console.log(
    `🧹 Removed legacy seed data: ${removedProducts} products, ${removedCategories} categories, ${removedOrders} orders, ${removedPromos} promos, ${removedUsers} demo users, ${removedVariants} stale variants.`,
  );
}
