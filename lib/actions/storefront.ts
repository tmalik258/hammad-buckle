"use server";

import { prisma } from "@/lib/prisma";
import { DEFAULT_HOME_SECTION_ORDER } from "@/lib/storefront/constants";
import { normalizeSectionOrder } from "@/lib/storefront/section-headings";
import { revalidateStorefrontCaches } from "@/lib/storefront/revalidate-storefront";
import {
  heroSlideSchema,
  heroSlideUpdateSchema,
  homeCategorySpotlightSchema,
  homeCategorySpotlightUpdateSchema,
  homeProductPickSchema,
  homeProductPickUpdateSchema,
  homePromoBannerSchema,
  homePromoBannerUpdateSchema,
  storefrontSettingsSchema,
} from "@/lib/validations/storefront-schema";
import { formatZodError } from "@/lib/validations/zod-errors";
import type { Prisma } from "@prisma/client";

function jsonOrUndefined(v: unknown): Prisma.InputJsonValue | undefined {
  if (v === undefined || v === null) return undefined;
  return v as Prisma.InputJsonValue;
}

export async function saveStorefrontSettings(input: unknown) {
  const parsed = storefrontSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: formatZodError(parsed.error) };
  }
  const d = parsed.data;
  const sectionOrder = d.homeSectionOrderJson
    ? normalizeSectionOrder(d.homeSectionOrderJson, DEFAULT_HOME_SECTION_ORDER)
    : undefined;

  await prisma.storefrontSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      announcementEnabled: d.announcementEnabled,
      announcementText: d.announcementText ?? null,
      announcementHref: d.announcementHref ?? null,
      announcementStyle: d.announcementStyle,
      homeTitle: d.homeTitle ?? null,
      homeDescription: d.homeDescription ?? null,
      newsletterTitle: d.newsletterTitle ?? null,
      newsletterSubtitle: d.newsletterSubtitle ?? null,
      trustBadgesJson: jsonOrUndefined(d.trustBadgesJson) ?? undefined,
      homeSectionOrderJson: jsonOrUndefined(sectionOrder) ?? undefined,
      homeSectionHeadingsJson: jsonOrUndefined(d.homeSectionHeadingsJson) ?? undefined,
    },
    update: {
      announcementEnabled: d.announcementEnabled,
      announcementText: d.announcementText ?? null,
      announcementHref: d.announcementHref ?? null,
      announcementStyle: d.announcementStyle,
      homeTitle: d.homeTitle ?? null,
      homeDescription: d.homeDescription ?? null,
      newsletterTitle: d.newsletterTitle ?? null,
      newsletterSubtitle: d.newsletterSubtitle ?? null,
      trustBadgesJson: jsonOrUndefined(d.trustBadgesJson) ?? undefined,
      homeSectionOrderJson: jsonOrUndefined(sectionOrder) ?? undefined,
      homeSectionHeadingsJson: jsonOrUndefined(d.homeSectionHeadingsJson) ?? undefined,
    },
  });
  revalidateStorefrontCaches();
  return { ok: true as const };
}

export async function createHeroSlide(input: unknown) {
  const parsed = heroSlideSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: formatZodError(parsed.error) };
  await prisma.heroSlide.create({
    data: {
      ...parsed.data,
      imageMobile: parsed.data.imageMobile ?? null,
    },
  });
  revalidateStorefrontCaches();
  return { ok: true as const };
}

export async function updateHeroSlide(input: unknown) {
  const parsed = heroSlideUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: formatZodError(parsed.error) };
  const { id, ...data } = parsed.data;
  await prisma.heroSlide.update({
    where: { id },
    data: {
      ...data,
      imageMobile: data.imageMobile === undefined ? undefined : data.imageMobile ?? null,
      subheading: data.subheading === undefined ? undefined : data.subheading ?? null,
      badgeText: data.badgeText === undefined ? undefined : data.badgeText ?? null,
      secondaryCtaLabel:
        data.secondaryCtaLabel === undefined ? undefined : data.secondaryCtaLabel ?? null,
      secondaryCtaHref:
        data.secondaryCtaHref === undefined ? undefined : data.secondaryCtaHref ?? null,
    },
  });
  revalidateStorefrontCaches();
  return { ok: true as const };
}

export async function deleteHeroSlide(id: string) {
  await prisma.heroSlide.delete({ where: { id } });
  revalidateStorefrontCaches();
  return { ok: true as const };
}

export async function createHomeCategorySpotlight(input: unknown) {
  const parsed = homeCategorySpotlightSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: formatZodError(parsed.error) };
  await prisma.homeCategorySpotlight.create({
    data: {
      ...parsed.data,
      titleOverride: parsed.data.titleOverride ?? null,
      imageOverride: parsed.data.imageOverride ?? null,
    },
  });
  revalidateStorefrontCaches();
  return { ok: true as const };
}

export async function updateHomeCategorySpotlight(input: unknown) {
  const parsed = homeCategorySpotlightUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: formatZodError(parsed.error) };
  const { id, ...data } = parsed.data;
  await prisma.homeCategorySpotlight.update({
    where: { id },
    data: {
      ...data,
      titleOverride: data.titleOverride === undefined ? undefined : data.titleOverride ?? null,
      imageOverride: data.imageOverride === undefined ? undefined : data.imageOverride ?? null,
    },
  });
  revalidateStorefrontCaches();
  return { ok: true as const };
}

export async function deleteHomeCategorySpotlight(id: string) {
  await prisma.homeCategorySpotlight.delete({ where: { id } });
  revalidateStorefrontCaches();
  return { ok: true as const };
}

export async function createHomeProductPick(input: unknown) {
  const parsed = homeProductPickSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: formatZodError(parsed.error) };
  await prisma.homeProductPick.create({ data: parsed.data });
  revalidateStorefrontCaches();
  return { ok: true as const };
}

export async function updateHomeProductPick(input: unknown) {
  const parsed = homeProductPickUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: formatZodError(parsed.error) };
  const { id, ...data } = parsed.data;
  await prisma.homeProductPick.update({ where: { id }, data });
  revalidateStorefrontCaches();
  return { ok: true as const };
}

export async function deleteHomeProductPick(id: string) {
  await prisma.homeProductPick.delete({ where: { id } });
  revalidateStorefrontCaches();
  return { ok: true as const };
}

export async function createHomePromoBanner(input: unknown) {
  const parsed = homePromoBannerSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: formatZodError(parsed.error) };
  await prisma.homePromoBanner.create({
    data: {
      ...parsed.data,
      body: parsed.data.body ?? null,
    },
  });
  revalidateStorefrontCaches();
  return { ok: true as const };
}

export async function updateHomePromoBanner(input: unknown) {
  const parsed = homePromoBannerUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: formatZodError(parsed.error) };
  const { id, ...data } = parsed.data;
  await prisma.homePromoBanner.update({
    where: { id },
    data: {
      ...data,
      body: data.body === undefined ? undefined : data.body ?? null,
    },
  });
  revalidateStorefrontCaches();
  return { ok: true as const };
}

export async function deleteHomePromoBanner(id: string) {
  await prisma.homePromoBanner.delete({ where: { id } });
  revalidateStorefrontCaches();
  return { ok: true as const };
}
