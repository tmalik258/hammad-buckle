"use client";

import type { HeroSlide } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  createHeroSlide,
  deleteHeroSlide,
  updateHeroSlide,
} from "@/lib/actions/storefront";
import { StorefrontImageField } from "./storefront-image-field";

type Props = {
  slides: HeroSlide[];
};

const emptyDraft = {
  sortOrder: 0,
  heading: "",
  subheading: "",
  badgeText: "",
  imageDesktop: "",
  imageMobile: "",
  primaryCtaLabel: "Shop now",
  primaryCtaHref: "/products",
  secondaryCtaLabel: "",
  secondaryCtaHref: "",
  isActive: true,
};

export function StorefrontHeroTab({ slides }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ ...emptyDraft, sortOrder: slides.length });

  const refresh = () => router.refresh();

  const startEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setDraft({
      sortOrder: slide.sortOrder,
      heading: slide.heading,
      subheading: slide.subheading ?? "",
      badgeText: slide.badgeText ?? "",
      imageDesktop: slide.imageDesktop,
      imageMobile: slide.imageMobile ?? "",
      primaryCtaLabel: slide.primaryCtaLabel,
      primaryCtaHref: slide.primaryCtaHref,
      secondaryCtaLabel: slide.secondaryCtaLabel ?? "",
      secondaryCtaHref: slide.secondaryCtaHref ?? "",
      isActive: slide.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ ...emptyDraft, sortOrder: slides.length });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      await deleteHeroSlide(id);
      toast.success("Slide removed");
      if (editingId === id) cancelEdit();
      refresh();
    });
  };

  const save = () => {
    startTransition(async () => {
      const payload = {
        sortOrder: draft.sortOrder,
        isActive: draft.isActive,
        imageDesktop: draft.imageDesktop,
        imageMobile: draft.imageMobile || undefined,
        heading: draft.heading,
        subheading: draft.subheading || undefined,
        badgeText: draft.badgeText || undefined,
        primaryCtaLabel: draft.primaryCtaLabel,
        primaryCtaHref: draft.primaryCtaHref,
        secondaryCtaLabel: draft.secondaryCtaLabel || undefined,
        secondaryCtaHref: draft.secondaryCtaHref || undefined,
      };

      const res = editingId
        ? await updateHeroSlide({ id: editingId, ...payload })
        : await createHeroSlide(payload);

      if (res.ok) {
        toast.success(editingId ? "Slide updated" : "Slide added");
        cancelEdit();
        refresh();
      } else {
        toast.error(res.error ?? "Invalid slide data");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Current slides</h3>
        <ul className="divide-y rounded-lg border">
          {slides.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
              <div>
                <p className="font-medium">{s.heading}</p>
                <p className="text-muted-foreground">
                  Order {s.sortOrder} · {s.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  disabled={pending}
                  onClick={() => startEdit(s)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="cursor-pointer"
                  disabled={pending}
                  onClick={() => remove(s.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
          {!slides.length ? (
            <li className="p-4 text-muted-foreground">No slides yet. Add one below.</li>
          ) : null}
        </ul>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">{editingId ? "Edit slide" : "Add slide"}</h3>
        <p className="text-xs text-muted-foreground">
          Upload an image or paste a URL (https link or path starting with /).
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Sort order</Label>
            <Input
              type="number"
              value={draft.sortOrder}
              onChange={(e) =>
                setDraft((d) => ({ ...d, sortOrder: Number(e.target.value) || 0 }))
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:col-span-2">
            <Label htmlFor="slide-active">Active on home page</Label>
            <Switch
              id="slide-active"
              checked={draft.isActive}
              onCheckedChange={(v) => setDraft((d) => ({ ...d, isActive: v }))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Heading</Label>
            <Input
              value={draft.heading}
              onChange={(e) => setDraft((d) => ({ ...d, heading: e.target.value }))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Subheading</Label>
            <Input
              value={draft.subheading}
              onChange={(e) => setDraft((d) => ({ ...d, subheading: e.target.value }))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Badge text</Label>
            <Input
              value={draft.badgeText}
              onChange={(e) => setDraft((d) => ({ ...d, badgeText: e.target.value }))}
            />
          </div>
          <StorefrontImageField
            label="Desktop image"
            value={draft.imageDesktop}
            onChange={(imageDesktop) => setDraft((d) => ({ ...d, imageDesktop }))}
          />
          <StorefrontImageField
            label="Mobile image (optional)"
            value={draft.imageMobile}
            onChange={(imageMobile) => setDraft((d) => ({ ...d, imageMobile }))}
            optional
          />
          <div className="space-y-2">
            <Label>Primary CTA label</Label>
            <Input
              value={draft.primaryCtaLabel}
              onChange={(e) => setDraft((d) => ({ ...d, primaryCtaLabel: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Primary CTA href</Label>
            <Input
              value={draft.primaryCtaHref}
              onChange={(e) => setDraft((d) => ({ ...d, primaryCtaHref: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Secondary CTA label</Label>
            <Input
              value={draft.secondaryCtaLabel}
              onChange={(e) => setDraft((d) => ({ ...d, secondaryCtaLabel: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Secondary CTA href</Label>
            <Input
              value={draft.secondaryCtaHref}
              onChange={(e) => setDraft((d) => ({ ...d, secondaryCtaHref: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="cursor-pointer" disabled={pending} onClick={save}>
            {editingId ? "Save changes" : "Add slide"}
          </Button>
          {editingId ? (
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={pending}
              onClick={cancelEdit}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
