import { z } from "zod";
import { AnnouncementStyle, HomeProductPickSection, PromoBannerLayout } from "@prisma/client";
import { DEFAULT_HOME_SECTION_ORDER } from "@/lib/storefront/constants";
import { imagePathSchema, optionalImagePathSchema } from "./image-path";

const sectionHeadingSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
});

const homeSectionHeadingsSchema = z
  .record(z.string(), sectionHeadingSchema)
  .optional();

export const storefrontSettingsSchema = z.object({
  announcementEnabled: z.boolean(),
  announcementText: z.string().nullable().optional(),
  announcementHref: z.string().nullable().optional(),
  announcementStyle: z.nativeEnum(AnnouncementStyle),
  homeTitle: z.string().nullable().optional(),
  homeDescription: z.string().nullable().optional(),
  newsletterTitle: z.string().nullable().optional(),
  newsletterSubtitle: z.string().nullable().optional(),
  trustBadgesJson: z.unknown().optional(),
  homeSectionOrderJson: z
    .array(z.enum(DEFAULT_HOME_SECTION_ORDER))
    .optional(),
  homeSectionHeadingsJson: homeSectionHeadingsSchema,
});

export const heroSlideSchema = z.object({
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  imageDesktop: imagePathSchema,
  imageMobile: optionalImagePathSchema,
  heading: z.string().min(1),
  subheading: z.string().nullable().optional(),
  badgeText: z.string().nullable().optional(),
  primaryCtaLabel: z.string().min(1),
  primaryCtaHref: z.string().min(1),
  secondaryCtaLabel: z.string().nullable().optional(),
  secondaryCtaHref: z.string().nullable().optional(),
});

export const heroSlideUpdateSchema = heroSlideSchema.partial().extend({
  id: z.string().min(1),
});

export const homeCategorySpotlightSchema = z.object({
  categoryId: z.string().min(1),
  sortOrder: z.number().int(),
  titleOverride: z.string().nullable().optional(),
  imageOverride: optionalImagePathSchema,
  isActive: z.boolean(),
});

export const homeCategorySpotlightUpdateSchema = homeCategorySpotlightSchema
  .partial()
  .extend({ id: z.string().min(1) });

export const homeProductPickSchema = z.object({
  productId: z.string().min(1),
  section: z.nativeEnum(HomeProductPickSection),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});

export const homeProductPickUpdateSchema = homeProductPickSchema.partial().extend({
  id: z.string().min(1),
});

export const homePromoBannerSchema = z.object({
  sortOrder: z.number().int(),
  title: z.string().min(1),
  body: z.string().nullable().optional(),
  imageUrl: imagePathSchema,
  href: z.string().min(1),
  layout: z.nativeEnum(PromoBannerLayout),
  isActive: z.boolean(),
});

export const homePromoBannerUpdateSchema = homePromoBannerSchema.partial().extend({
  id: z.string().min(1),
});

export const genderTargetQuerySchema = z.enum(["WOMENS", "MENS", "UNISEX"]).optional();
