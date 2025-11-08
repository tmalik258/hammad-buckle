/*
  Warnings:

  - You are about to drop the column `address1` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `address2` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `addresses` table. All the data in the column will be lost.
  - Added the required column `area` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."addresses" DROP COLUMN "address1",
DROP COLUMN "address2",
DROP COLUMN "company",
DROP COLUMN "country",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "state",
ADD COLUMN     "area" TEXT NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "street" TEXT;
