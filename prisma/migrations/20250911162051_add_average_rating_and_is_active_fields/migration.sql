-- AlterTable
ALTER TABLE "public"."categories" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0;
