import { headers } from "next/headers";

function normalizeSiteUrl(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * Resolves the public site origin for auth redirects.
 * Prefers NEXT_PUBLIC_SITE_URL, then Vercel, then the incoming request host.
 */
export async function getSiteUrl(): Promise<string | null> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return normalizeSiteUrl(fromEnv);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return normalizeSiteUrl(`https://${vercelUrl}`);
  }

  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    headerList.get("host")?.trim();

  if (!host) {
    return null;
  }

  const forwardedProto = headerList
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();

  const protocol =
    forwardedProto ??
    (host.includes("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return normalizeSiteUrl(`${protocol}://${host}`);
}
