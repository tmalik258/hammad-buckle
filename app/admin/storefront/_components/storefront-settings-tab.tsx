"use client";

import { useMemo, useState, useTransition } from "react";
import { AnnouncementStyle, type StorefrontSettings } from "@prisma/client";
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
import { toast } from "sonner";
import { saveStorefrontSettings } from "@/lib/actions/storefront";
import {
  DEFAULT_HOME_SECTION_ORDER,
} from "@/lib/storefront/constants";
import {
  DEFAULT_SECTION_HEADINGS,
  normalizeSectionOrder,
  parseSectionHeadings,
  type HomeSectionHeadings,
} from "@/lib/storefront/section-headings";
import { HomeSectionOrderEditor } from "./home-section-order-editor";
import { HomeSectionHeadingsEditor } from "./home-section-headings-editor";

type Props = {
  initial: StorefrontSettings | null;
};

export function StorefrontSettingsTab({ initial }: Props) {
  const [pending, startTransition] = useTransition();

  const defaultTrustBadges = useMemo(
    () =>
      JSON.stringify(
        [
          { icon: "truck", label: "Free shipping", sub: "On qualifying orders" },
          { icon: "refresh", label: "Easy returns", sub: "30-day policy" },
          { icon: "shield", label: "Secure checkout", sub: "Encrypted payments" },
        ],
        null,
        2
      ),
    []
  );

  const [form, setForm] = useState(() => ({
    announcementEnabled: initial?.announcementEnabled ?? false,
    announcementText: initial?.announcementText ?? "",
    announcementHref: initial?.announcementHref ?? "",
    announcementStyle: initial?.announcementStyle ?? AnnouncementStyle.NEUTRAL,
    homeTitle: initial?.homeTitle ?? "",
    homeDescription: initial?.homeDescription ?? "",
    newsletterTitle: initial?.newsletterTitle ?? "",
    newsletterSubtitle: initial?.newsletterSubtitle ?? "",
    trustBadgesJsonText:
      initial?.trustBadgesJson != null
        ? JSON.stringify(initial.trustBadgesJson, null, 2)
        : defaultTrustBadges,
    sectionOrder: normalizeSectionOrder(
      initial?.homeSectionOrderJson ?? null,
      DEFAULT_HOME_SECTION_ORDER
    ),
    sectionHeadings: {
      ...DEFAULT_SECTION_HEADINGS,
      ...(parseSectionHeadings(initial?.homeSectionHeadingsJson ?? null) ?? {}),
    } as HomeSectionHeadings,
  }));

  const handleSave = () => {
    let trustParsed: unknown = undefined;
    try {
      trustParsed = JSON.parse(form.trustBadgesJsonText || "null");
    } catch {
      toast.error("Trust badges must be valid JSON");
      return;
    }

    startTransition(async () => {
      const res = await saveStorefrontSettings({
        announcementEnabled: form.announcementEnabled,
        announcementText: form.announcementText || null,
        announcementHref: form.announcementHref || null,
        announcementStyle: form.announcementStyle,
        homeTitle: form.homeTitle || null,
        homeDescription: form.homeDescription || null,
        newsletterTitle: form.newsletterTitle || null,
        newsletterSubtitle: form.newsletterSubtitle || null,
        trustBadgesJson: trustParsed,
        homeSectionOrderJson: form.sectionOrder,
        homeSectionHeadingsJson: form.sectionHeadings,
      });
      if (res.ok) toast.success("Storefront settings saved");
      else toast.error(res.error ?? "Validation failed");
    });
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="font-medium">Announcement bar</p>
          <p className="text-sm text-muted-foreground">Shown above the header on the home page.</p>
        </div>
        <Switch
          checked={form.announcementEnabled}
          onCheckedChange={(v) => setForm((f) => ({ ...f, announcementEnabled: v }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Announcement copy</Label>
          <Input
            value={form.announcementText}
            onChange={(e) => setForm((f) => ({ ...f, announcementText: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Announcement link</Label>
          <Input
            value={form.announcementHref}
            onChange={(e) => setForm((f) => ({ ...f, announcementHref: e.target.value }))}
            placeholder="/products"
          />
        </div>
        <div className="space-y-2">
          <Label>Style</Label>
          <Select
            value={form.announcementStyle}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, announcementStyle: v as AnnouncementStyle }))
            }
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AnnouncementStyle.NEUTRAL}>Neutral</SelectItem>
              <SelectItem value={AnnouncementStyle.SALE}>Sale</SelectItem>
              <SelectItem value={AnnouncementStyle.INFO}>Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Home SEO title</Label>
          <Input
            value={form.homeTitle}
            onChange={(e) => setForm((f) => ({ ...f, homeTitle: e.target.value }))}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Home SEO description</Label>
          <Input
            value={form.homeDescription}
            onChange={(e) => setForm((f) => ({ ...f, homeDescription: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Newsletter title</Label>
          <Input
            value={form.newsletterTitle}
            onChange={(e) => setForm((f) => ({ ...f, newsletterTitle: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Newsletter subtitle</Label>
          <Input
            value={form.newsletterSubtitle}
            onChange={(e) => setForm((f) => ({ ...f, newsletterSubtitle: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Home section order</Label>
        <HomeSectionOrderEditor
          value={form.sectionOrder}
          onChange={(sectionOrder) => setForm((f) => ({ ...f, sectionOrder }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Section headings</Label>
        <HomeSectionHeadingsEditor
          value={form.sectionHeadings}
          onChange={(sectionHeadings) => setForm((f) => ({ ...f, sectionHeadings }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Trust badges JSON</Label>
        <p className="text-xs text-muted-foreground">
          Icons: truck, refresh/return, shield. Use https URLs or paths starting with / for images
          elsewhere in this panel.
        </p>
        <textarea
          className="min-h-[140px] w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm"
          value={form.trustBadgesJsonText}
          onChange={(e) => setForm((f) => ({ ...f, trustBadgesJsonText: e.target.value }))}
        />
      </div>

      <Button type="button" className="cursor-pointer" disabled={pending} onClick={handleSave}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </div>
  );
}
