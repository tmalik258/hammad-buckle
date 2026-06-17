import { revalidatePath, updateTag } from "next/cache";
import { HOME_PRODUCTS_CACHE_TAG, STOREFRONT_CACHE_TAG } from "./constants";

export function revalidateStorefrontCaches(): void {
  updateTag(STOREFRONT_CACHE_TAG);
  updateTag(HOME_PRODUCTS_CACHE_TAG);
  revalidatePath("/");
}
