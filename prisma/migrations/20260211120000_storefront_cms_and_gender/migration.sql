-- CreateEnum
CREATE TYPE "GenderTarget" AS ENUM ('WOMENS', 'MENS', 'UNISEX');

-- CreateEnum
CREATE TYPE "AnnouncementStyle" AS ENUM ('NEUTRAL', 'SALE', 'INFO');

-- CreateEnum
CREATE TYPE "HomeProductPickSection" AS ENUM ('HERO_SECONDARY', 'EDITORIAL_GRID', 'TRENDING');

-- CreateEnum
CREATE TYPE "PromoBannerLayout" AS ENUM ('SPLIT_LEFT_IMAGE', 'SPLIT_RIGHT_IMAGE', 'FULL_WIDTH');

-- AlterTable
ALTER TABLE "products" ADD COLUMN "genderTarget" "GenderTarget" NOT NULL DEFAULT 'UNISEX';

-- CreateIndex
CREATE INDEX "products_genderTarget_idx" ON "products"("genderTarget");

-- CreateTable
CREATE TABLE "storefront_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "announcementEnabled" BOOLEAN NOT NULL DEFAULT false,
    "announcementText" TEXT,
    "announcementHref" TEXT,
    "announcementStyle" "AnnouncementStyle" NOT NULL DEFAULT 'NEUTRAL',
    "homeTitle" TEXT,
    "homeDescription" TEXT,
    "newsletterTitle" TEXT,
    "newsletterSubtitle" TEXT,
    "trustBadgesJson" JSONB,
    "homeSectionOrderJson" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storefront_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_slides" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageDesktop" TEXT NOT NULL,
    "imageMobile" TEXT,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "badgeText" TEXT,
    "primaryCtaLabel" TEXT NOT NULL,
    "primaryCtaHref" TEXT NOT NULL,
    "secondaryCtaLabel" TEXT,
    "secondaryCtaHref" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_category_spotlights" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "titleOverride" TEXT,
    "imageOverride" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_category_spotlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_product_picks" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "section" "HomeProductPickSection" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_product_picks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_promo_banners" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "imageUrl" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "layout" "PromoBannerLayout" NOT NULL DEFAULT 'SPLIT_LEFT_IMAGE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_promo_banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "home_category_spotlights_categoryId_idx" ON "home_category_spotlights"("categoryId");

-- AddForeignKey
ALTER TABLE "home_category_spotlights" ADD CONSTRAINT "home_category_spotlights_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "home_product_picks_productId_idx" ON "home_product_picks"("productId");

-- CreateIndex
CREATE INDEX "home_product_picks_section_idx" ON "home_product_picks"("section");

-- AddForeignKey
ALTER TABLE "home_product_picks" ADD CONSTRAINT "home_product_picks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
