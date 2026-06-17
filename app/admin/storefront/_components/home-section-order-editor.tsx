"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";
import { DEFAULT_HOME_SECTION_ORDER, type HomeSectionKey } from "@/lib/storefront/constants";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const SECTION_LABELS: Record<HomeSectionKey, string> = {
  announcement: "Announcement bar",
  hero: "Hero carousel",
  categories: "Category spotlight",
  editorial: "Editorial grid",
  promos: "Promo banners",
  newArrivals: "New arrivals rail",
  sale: "Sale rail",
  featured: "Featured rail",
  trending: "Trending rail",
  testimonials: "Testimonials",
  newsletter: "Newsletter",
  trust: "Trust badges",
};

type Props = {
  value: HomeSectionKey[];
  onChange: (order: HomeSectionKey[]) => void;
};

export function HomeSectionOrderEditor({ value, onChange }: Props) {
  const enabledSet = new Set(value);
  const disabled = DEFAULT_HOME_SECTION_ORDER.filter((k) => !enabledSet.has(k));
  const ordered = [...value, ...disabled];

  const toggle = (key: HomeSectionKey, on: boolean) => {
    if (on) {
      if (enabledSet.has(key)) return;
      onChange([...value, key]);
      return;
    }
    onChange(value.filter((k) => k !== key));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= ordered.length || from === to) return;
    const next = [...ordered];
    const [item] = next.splice(from, 1);
    if (!item) return;
    next.splice(to, 0, item);
    onChange(next.filter((k) => enabledSet.has(k)));
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Drag to reorder. Toggle sections on or off. Disabled sections are hidden from the home page.
      </p>
      <ul className="divide-y rounded-lg border">
        {ordered.map((key, index) => (
          <SectionRow
            key={key}
            label={SECTION_LABELS[key]}
            enabled={enabledSet.has(key)}
            index={index}
            onToggle={(on) => toggle(key, on)}
            onMove={move}
          />
        ))}
      </ul>
    </div>
  );
}

function SectionRow({
  label,
  enabled,
  index,
  onToggle,
  onMove,
}: {
  label: string;
  enabled: boolean;
  index: number;
  onToggle: (on: boolean) => void;
  onMove: (from: number, to: number) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (!enabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const from = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isNaN(from)) return;
    onMove(from, index);
  };

  return (
    <li
      draggable={enabled}
      onDragStart={handleDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "flex items-center gap-3 p-3 text-sm transition-colors",
        !enabled && "bg-muted/40 opacity-70",
        dragOver && "bg-muted"
      )}
    >
      <GripVertical
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground",
          enabled ? "cursor-grab" : "opacity-30"
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{label}</p>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} aria-label={`Toggle ${label}`} />
    </li>
  );
}
