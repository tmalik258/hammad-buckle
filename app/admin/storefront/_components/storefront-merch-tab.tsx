"use client";

import type { Category, HomeCategorySpotlight, HomeProductPick, HomePromoBanner, Product } from "@prisma/client";
import { HomeProductPickSection, PromoBannerLayout } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createHomeCategorySpotlight,
  createHomeProductPick,
  createHomePromoBanner,
  deleteHomeCategorySpotlight,
  deleteHomeProductPick,
  deleteHomePromoBanner,
  updateHomeCategorySpotlight,
  updateHomeProductPick,
  updateHomePromoBanner,
} from "@/lib/actions/storefront";
import { StorefrontImageField } from "./storefront-image-field";

type SpotlightRow = HomeCategorySpotlight & { category: Category };
type PickRow = HomeProductPick & { product: Pick<Product, "id" | "name"> };

type Props = {
  spotlights: SpotlightRow[];
  picks: PickRow[];
  promos: HomePromoBanner[];
  categories: Category[];
  products: Pick<Product, "id" | "name">[];
};

export function StorefrontMerchTab({ spotlights, picks, promos, categories, products }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const refresh = () => router.refresh();

  return (
    <div className="space-y-12 max-w-4xl">
      <SpotlightSection
        spotlights={spotlights}
        categories={categories}
        pending={pending}
        startTransition={startTransition}
        onRefresh={refresh}
      />
      <ProductPickSection
        picks={picks}
        products={products}
        pending={pending}
        startTransition={startTransition}
        onRefresh={refresh}
      />
      <PromoSection
        promos={promos}
        pending={pending}
        startTransition={startTransition}
        onRefresh={refresh}
      />
    </div>
  );
}

function SpotlightSection({
  spotlights,
  categories,
  pending,
  startTransition,
  onRefresh,
}: {
  spotlights: SpotlightRow[];
  categories: Category[];
  pending: boolean;
  startTransition: (fn: () => void) => void;
  onRefresh: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    categoryId: categories[0]?.id ?? "",
    sortOrder: spotlights.length,
    titleOverride: "",
    imageOverride: "",
    isActive: true,
  });

  const reset = () => {
    setEditingId(null);
    setForm({
      categoryId: categories[0]?.id ?? "",
      sortOrder: spotlights.length,
      titleOverride: "",
      imageOverride: "",
      isActive: true,
    });
  };

  const startEdit = (row: SpotlightRow) => {
    setEditingId(row.id);
    setForm({
      categoryId: row.categoryId,
      sortOrder: row.sortOrder,
      titleOverride: row.titleOverride ?? "",
      imageOverride: row.imageOverride ?? "",
      isActive: row.isActive,
    });
  };

  const save = () => {
    startTransition(async () => {
      const payload = {
        categoryId: form.categoryId,
        sortOrder: form.sortOrder,
        titleOverride: form.titleOverride || undefined,
        imageOverride: form.imageOverride || undefined,
        isActive: form.isActive,
      };
      const res = editingId
        ? await updateHomeCategorySpotlight({ id: editingId, ...payload })
        : await createHomeCategorySpotlight(payload);
      if (res.ok) {
        toast.success(editingId ? "Spotlight updated" : "Spotlight added");
        reset();
        onRefresh();
      } else toast.error(res.error ?? "Could not save spotlight");
    });
  };

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Category spotlight</h3>
      <ul className="divide-y rounded-lg border">
        {spotlights.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-2 p-3 text-sm">
            <span>
              {s.titleOverride || s.category.name}
              {!s.isActive ? " (inactive)" : ""}
            </span>
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
                onClick={() =>
                  startTransition(async () => {
                    await deleteHomeCategorySpotlight(s.id);
                    toast.success("Removed");
                    if (editingId === s.id) reset();
                    onRefresh();
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="space-y-3 rounded-lg border p-4">
        <p className="text-sm font-medium">{editingId ? "Edit spotlight" : "Add spotlight"}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sort order</Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Title override (optional)</Label>
            <Input
              value={form.titleOverride}
              onChange={(e) => setForm((f) => ({ ...f, titleOverride: e.target.value }))}
            />
          </div>
          <StorefrontImageField
            label="Image override (optional)"
            value={form.imageOverride}
            onChange={(imageOverride) => setForm((f) => ({ ...f, imageOverride }))}
            optional
          />
          <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:col-span-2">
            <Label>Active</Label>
            <Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" className="cursor-pointer" disabled={pending || !form.categoryId} onClick={save}>
            {editingId ? "Save" : "Add spotlight"}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" className="cursor-pointer" onClick={reset}>
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ProductPickSection({
  picks,
  products,
  pending,
  startTransition,
  onRefresh,
}: {
  picks: PickRow[];
  products: Pick<Product, "id" | "name">[];
  pending: boolean;
  startTransition: (fn: () => void) => void;
  onRefresh: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    productId: string;
    section: HomeProductPickSection;
    sortOrder: number;
    isActive: boolean;
  }>({
    productId: products[0]?.id ?? "",
    section: HomeProductPickSection.EDITORIAL_GRID,
    sortOrder: 0,
    isActive: true,
  });

  const reset = () => {
    setEditingId(null);
    setForm({
      productId: products[0]?.id ?? "",
      section: HomeProductPickSection.EDITORIAL_GRID,
      sortOrder: 0,
      isActive: true,
    });
  };

  const startEdit = (row: PickRow) => {
    setEditingId(row.id);
    setForm({
      productId: row.productId,
      section: row.section,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    });
  };

  const save = () => {
    startTransition(async () => {
      const payload = { ...form };
      const res = editingId
        ? await updateHomeProductPick({ id: editingId, ...payload })
        : await createHomeProductPick({
            ...payload,
            sortOrder: picks.filter((x) => x.section === form.section).length,
          });
      if (res.ok) {
        toast.success(editingId ? "Pick updated" : "Pick added");
        reset();
        onRefresh();
      } else toast.error(res.error ?? "Could not save pick");
    });
  };

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Product picks</h3>
      <p className="text-xs text-muted-foreground">
        Hero secondary appears under the carousel. Editorial grid and Trending feed their rails.
      </p>
      <ul className="divide-y rounded-lg border">
        {picks.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-2 p-3 text-sm">
            <span>
              {p.product.name} · {p.section}
              {!p.isActive ? " (inactive)" : ""}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={pending}
                onClick={() => startEdit(p)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="cursor-pointer"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteHomeProductPick(p.id);
                    toast.success("Removed");
                    if (editingId === p.id) reset();
                    onRefresh();
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={form.productId} onValueChange={(v) => setForm((f) => ({ ...f, productId: v }))}>
              <SelectTrigger className="w-[240px] cursor-pointer">
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Section</Label>
            <Select
              value={form.section}
              onValueChange={(v) => setForm((f) => ({ ...f, section: v as HomeProductPickSection }))}
            >
              <SelectTrigger className="w-[200px] cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={HomeProductPickSection.HERO_SECONDARY}>Hero secondary</SelectItem>
                <SelectItem value={HomeProductPickSection.EDITORIAL_GRID}>Editorial grid</SelectItem>
                <SelectItem value={HomeProductPickSection.TRENDING}>Trending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {editingId ? (
            <div className="space-y-2">
              <Label>Sort order</Label>
              <Input
                type="number"
                className="w-[100px]"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
              />
            </div>
          ) : null}
          <div className="flex items-center gap-2 pb-1">
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            />
            <Label>Active</Label>
          </div>
          <Button type="button" className="cursor-pointer" disabled={pending || !form.productId} onClick={save}>
            {editingId ? "Save pick" : "Add pick"}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" className="cursor-pointer" onClick={reset}>
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function PromoSection({
  promos,
  pending,
  startTransition,
  onRefresh,
}: {
  promos: HomePromoBanner[];
  pending: boolean;
  startTransition: (fn: () => void) => void;
  onRefresh: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    title: string;
    body: string;
    imageUrl: string;
    href: string;
    layout: PromoBannerLayout;
    sortOrder: number;
    isActive: boolean;
  }>({
    title: "",
    body: "",
    imageUrl: "",
    href: "/products",
    layout: PromoBannerLayout.SPLIT_LEFT_IMAGE,
    sortOrder: promos.length,
    isActive: true,
  });

  const reset = () => {
    setEditingId(null);
    setForm({
      title: "",
      body: "",
      imageUrl: "",
      href: "/products",
      layout: PromoBannerLayout.SPLIT_LEFT_IMAGE,
      sortOrder: promos.length,
      isActive: true,
    });
  };

  const startEdit = (row: HomePromoBanner) => {
    setEditingId(row.id);
    setForm({
      title: row.title,
      body: row.body ?? "",
      imageUrl: row.imageUrl,
      href: row.href,
      layout: row.layout,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    });
  };

  const save = () => {
    startTransition(async () => {
      const payload = {
        title: form.title,
        body: form.body || undefined,
        imageUrl: form.imageUrl,
        href: form.href,
        layout: form.layout,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };
      const res = editingId
        ? await updateHomePromoBanner({ id: editingId, ...payload })
        : await createHomePromoBanner(payload);
      if (res.ok) {
        toast.success(editingId ? "Promo updated" : "Promo added");
        reset();
        onRefresh();
      } else toast.error(res.error ?? "Could not save promo");
    });
  };

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Promo banners</h3>
      <ul className="divide-y rounded-lg border">
        {promos.map((b) => (
          <li key={b.id} className="flex items-center justify-between gap-2 p-3 text-sm">
            <span>
              {b.title}
              {!b.isActive ? " (inactive)" : ""}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={pending}
                onClick={() => startEdit(b)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="cursor-pointer"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteHomePromoBanner(b.id);
                    toast.success("Removed");
                    if (editingId === b.id) reset();
                    onRefresh();
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Body</Label>
          <Input value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
        </div>
        <StorefrontImageField
          label="Promo image"
          value={form.imageUrl}
          onChange={(imageUrl) => setForm((f) => ({ ...f, imageUrl }))}
        />
        <div className="space-y-2">
          <Label>Link href</Label>
          <Input value={form.href} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Sort order</Label>
          <Input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Layout</Label>
          <Select value={form.layout} onValueChange={(v) => setForm((f) => ({ ...f, layout: v as PromoBannerLayout }))}>
            <SelectTrigger className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PromoBannerLayout.SPLIT_LEFT_IMAGE}>Split · image left</SelectItem>
              <SelectItem value={PromoBannerLayout.SPLIT_RIGHT_IMAGE}>Split · image right</SelectItem>
              <SelectItem value={PromoBannerLayout.FULL_WIDTH}>Full width</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:col-span-2">
          <Label>Active</Label>
          <Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <Button
            type="button"
            className="cursor-pointer"
            disabled={pending || !form.title || !form.imageUrl}
            onClick={save}
          >
            {editingId ? "Save promo" : "Add promo banner"}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" className="cursor-pointer" onClick={reset}>
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
