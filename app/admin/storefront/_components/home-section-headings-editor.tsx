"use client";

import {
  DEFAULT_SECTION_HEADINGS,
  type HomeSectionHeadings,
  type SectionHeadingKey,
} from "@/lib/storefront/section-headings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const HEADING_LABELS: Record<SectionHeadingKey, string> = {
  categories: "Category spotlight",
  editorial: "Editorial grid",
  heroSecondary: "Hero secondary strip",
  newArrivals: "New arrivals",
  sale: "Sale",
  featured: "Featured",
  trending: "Trending",
  testimonials: "Testimonials",
};

type Props = {
  value: HomeSectionHeadings;
  onChange: (next: HomeSectionHeadings) => void;
};

export function HomeSectionHeadingsEditor({ value, onChange }: Props) {
  const keys = Object.keys(DEFAULT_SECTION_HEADINGS) as SectionHeadingKey[];

  const update = (key: SectionHeadingKey, field: "title" | "subtitle", text: string) => {
    const base = value[key] ?? DEFAULT_SECTION_HEADINGS[key];
    onChange({
      ...value,
      [key]: {
        ...base,
        [field]: text,
      },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Customize section titles and subtitles shown on the home page.
      </p>
      <div className="grid gap-4">
        {keys.map((key) => {
          const current = value[key] ?? DEFAULT_SECTION_HEADINGS[key];
          return (
            <div key={key} className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-medium">{HEADING_LABELS[key]}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={current.title}
                    onChange={(e) => update(key, "title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={current.subtitle ?? ""}
                    onChange={(e) => update(key, "subtitle", e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
