import type { Metadata } from "next";
import { getHomeMetadata } from "@/lib/storefront/get-home-data";
import { StorefrontHome } from "./_components/storefront/storefront-home";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getHomeMetadata();
}

/**
 * Page: Home
 * Rendering: SSR + `unstable_cache` in loaders (tag invalidation from Admin → Storefront). Route is
 * `force-dynamic` so builds succeed without a live DB; cache TTL is set on cached data fetches.
 * Last Updated: 2026-02-11
 */

export default function HomePage() {
  return <StorefrontHome />;
}
