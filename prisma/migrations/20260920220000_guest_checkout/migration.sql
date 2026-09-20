-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "orders" ADD COLUMN "guestEmail" TEXT;

-- AlterTable
ALTER TABLE "addresses" ALTER COLUMN "userId" DROP NOT NULL;
