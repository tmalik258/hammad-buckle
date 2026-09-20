import { AnnouncementStyle } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AnnouncementSettings = {
  enabled: boolean;
  text: string | null;
  href: string | null;
  style: AnnouncementStyle;
};

export async function getAnnouncementSettings(): Promise<AnnouncementSettings> {
  const settings = await prisma.storefrontSettings.findUnique({
    where: { id: "default" },
    select: {
      announcementEnabled: true,
      announcementText: true,
      announcementHref: true,
      announcementStyle: true,
    },
  });

  return {
    enabled: settings?.announcementEnabled ?? false,
    text: settings?.announcementText ?? null,
    href: settings?.announcementHref ?? null,
    style: settings?.announcementStyle ?? AnnouncementStyle.NEUTRAL,
  };
}
