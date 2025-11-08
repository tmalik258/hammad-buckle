/*
  Warnings:

  - A unique constraint covering the columns `[userId,productId,variantId]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."cart_items_userId_productId_key";

-- AlterTable
ALTER TABLE "public"."cart_items" ADD COLUMN     "variantId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_userId_productId_variantId_key" ON "public"."cart_items"("userId", "productId", "variantId");

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
