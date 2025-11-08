-- AlterTable
ALTER TABLE "public"."products" ALTER COLUMN "categoryId" DROP NOT NULL,
ALTER COLUMN "occasionId" DROP NOT NULL,
ALTER COLUMN "typeId" DROP NOT NULL;
