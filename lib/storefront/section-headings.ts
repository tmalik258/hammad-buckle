import type { HomeSectionKey } from "./constants";

export type SectionHeadingKey =
  | "categories"
  | "editorial"
  | "heroSecondary"
  | "newArrivals"
  | "sale"
  | "featured"
  | "trending"
  | "testimonials";

export type SectionHeading = { title: string; subtitle?: string };

export type HomeSectionHeadings = Partial<Record<SectionHeadingKey, SectionHeading>>;

export const DEFAULT_SECTION_HEADINGS: Record<SectionHeadingKey, SectionHeading> = {
  categories: {
    title: "Shop by category",
    subtitle: "Explore curated drops across apparel, footwear, and everyday staples.",
  },
  editorial: {
    title: "Editor's picks",
    subtitle: "Curated pieces our team is wearing now.",
  },
  heroSecondary: {
    title: "Featured now",
    subtitle: "Hand-picked highlights from this season.",
  },
  newArrivals: {
    title: "New arrivals",
    subtitle: "Fresh drops added to the catalog.",
  },
  sale: { title: "Sale", subtitle: "Limited-time markdowns." },
  featured: {
    title: "Featured",
    subtitle: "Standout styles worth a closer look.",
  },
  trending: {
    title: "Trending now",
    subtitle: "Popular picks from our community.",
  },
  testimonials: {
    title: "Loved by shoppers",
    subtitle: "Recent verified feedback from real orders.",
  },
};

export function parseSectionHeadings(json: unknown): HomeSectionHeadings | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  const out: HomeSectionHeadings = {};
  for (const key of Object.keys(DEFAULT_SECTION_HEADINGS) as SectionHeadingKey[]) {
    const raw = (json as Record<string, unknown>)[key];
    if (!raw || typeof raw !== "object") continue;
    const title = (raw as { title?: unknown }).title;
    if (typeof title !== "string" || !title.trim()) continue;
    const subtitle = (raw as { subtitle?: unknown }).subtitle;
    out[key] = {
      title: title.trim(),
      subtitle: typeof subtitle === "string" && subtitle.trim() ? subtitle.trim() : undefined,
    };
  }
  return Object.keys(out).length ? out : null;
}

export function resolveHeading(
  headings: HomeSectionHeadings | null,
  key: SectionHeadingKey
): SectionHeading {
  return headings?.[key] ?? DEFAULT_SECTION_HEADINGS[key];
}

export function normalizeSectionOrder(
  input: unknown,
  defaultOrder: readonly HomeSectionKey[]
): HomeSectionKey[] {
  if (!Array.isArray(input)) return [...defaultOrder];
  const allowed = new Set<string>(defaultOrder);
  const seen = new Set<string>();
  const out: HomeSectionKey[] = [];
  for (const x of input) {
    if (typeof x !== "string" || !allowed.has(x) || seen.has(x)) continue;
    seen.add(x);
    out.push(x as HomeSectionKey);
  }
  if (!out.length) return [...defaultOrder];
  for (const key of defaultOrder) {
    if (!seen.has(key)) out.push(key);
  }
  return out;
}
