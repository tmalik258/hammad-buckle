/*
  Warnings:

  - Removing Stripe-related fields from users and payments tables

*/
-- DropIndex
DROP INDEX IF EXISTS "public"."users_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN IF EXISTS "stripeCustomerId";

-- DropIndex
DROP INDEX IF EXISTS "public"."payments_stripePaymentIntentId_key";

-- AlterTable
ALTER TABLE "public"."payments" DROP COLUMN IF EXISTS "stripePaymentIntentId";
ALTER TABLE "public"."payments" DROP COLUMN IF EXISTS "stripeCustomerId";
ALTER TABLE "public"."payments" DROP COLUMN IF EXISTS "stripePaymentMethodId";
