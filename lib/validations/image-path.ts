import { z } from "zod";

/** Accepts absolute URLs or site-relative paths (e.g. /images/hero.jpg). */
export const imagePathSchema = z
  .string()
  .min(1, "Image path is required")
  .refine((v) => v.startsWith("/") || /^https?:\/\//i.test(v), {
    message: "Use a relative path (/…) or http(s) URL",
  });

export const optionalImagePathSchema = z.preprocess(
  (v) => (typeof v === "string" && !v.trim() ? null : v),
  imagePathSchema.nullable().optional()
);
