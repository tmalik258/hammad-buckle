-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "isValid" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "validationErrors" JSONB;
