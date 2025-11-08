-- CreateEnum
CREATE TYPE "public"."ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED', 'HIDDEN', 'REPORTED');

-- AlterTable
ALTER TABLE "public"."reviews" ADD COLUMN     "status" "public"."ReviewStatus" NOT NULL DEFAULT 'PENDING';
