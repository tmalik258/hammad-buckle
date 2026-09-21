import type { Metadata } from "next";

export const SITE_NAME = "Hanara";
export const SITE_DESCRIPTION =
  "Shop curated women's clothing, dresses, and heels at Hanara.";
/** Storefront display currency (prices in DB are plain numbers). */
export const SITE_CURRENCY = "PKR";
/** Transparent mark for UI (header, placeholders). */
export const LOGO_PATH = "/logo_transparent.png";
/** Solid mark for favicons / Open Graph / social previews. */
export const LOGO_SOLID_PATH = "/logo.jpeg";

function getMetadataBase(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      return new URL(configured);
    } catch {
      // Fall through to Vercel / local defaults.
    }
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const host = vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
    return new URL(host);
  }

  return new URL("http://localhost:3000");
}

export const rootMetadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: `${SITE_NAME} — Women's Apparel & Footwear`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: [{ url: LOGO_SOLID_PATH, type: "image/jpeg" }],
    apple: [{ url: LOGO_SOLID_PATH, type: "image/jpeg" }],
    shortcut: LOGO_SOLID_PATH,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Women's Apparel & Footwear`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: LOGO_SOLID_PATH,
        width: 512,
        height: 512,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — Women's Apparel & Footwear`,
    description: SITE_DESCRIPTION,
    images: [LOGO_SOLID_PATH],
  },
};

export function buildPageMetadata(title: string, description?: string): Metadata {
  const desc = description ?? SITE_DESCRIPTION;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: [{ url: LOGO_SOLID_PATH, alt: SITE_NAME }],
    },
    twitter: {
      title,
      description: desc,
      images: [LOGO_SOLID_PATH],
    },
  };
}
