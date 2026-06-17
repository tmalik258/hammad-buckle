"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AnnouncementStyle } from "@prisma/client";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "storefront-announcement-dismissed";

type Props = {
  enabled: boolean;
  text: string | null;
  href: string | null;
  style: AnnouncementStyle;
};

export function StorefrontAnnouncementBar({ enabled, text, href, style }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled || !text?.trim()) return;
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      setVisible(dismissed !== "1");
    } catch {
      setVisible(true);
    }
  }, [enabled, text]);

  if (!enabled || !text?.trim() || !visible) return null;

  const tone =
    style === AnnouncementStyle.SALE
      ? "bg-neutral-900 text-white"
      : style === AnnouncementStyle.INFO
        ? "bg-zinc-100 text-zinc-900 border-b border-zinc-200"
        : "bg-zinc-900 text-white";

  const inner = (
    <p className="text-center text-xs sm:text-sm font-medium tracking-wide px-10 py-2.5">
      {href ? (
        <Link href={href} className="underline underline-offset-4 hover:opacity-90 cursor-pointer">
          {text}
        </Link>
      ) : (
        text
      )}
    </p>
  );

  return (
    <div className={cn("relative z-50", tone)} role="region" aria-label="Announcement">
      {inner}
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1.5 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        aria-label="Dismiss announcement"
        onClick={() => {
          try {
            localStorage.setItem(STORAGE_KEY, "1");
          } catch {
            /* ignore */
          }
          setVisible(false);
        }}
      >
        <X className="h-4 w-4 opacity-80" />
      </button>
    </div>
  );
}
