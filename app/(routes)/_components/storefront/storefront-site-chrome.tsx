"use client";

import { useEffect, useRef, type ReactNode } from "react";

const SITE_CHROME_HEIGHT_VAR = "--site-chrome-height";

type Props = {
  children: ReactNode;
  reserveAnnouncementHeight: boolean;
};

export function StorefrontSiteChrome({
  children,
  reserveAnnouncementHeight,
}: Props) {
  const chromeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = chromeRef.current;
    if (!node) return;

    const updateHeight = () => {
      const height = node.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        SITE_CHROME_HEIGHT_VAR,
        `${height}px`,
      );
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);

    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty(SITE_CHROME_HEIGHT_VAR, "4rem");
    };
  }, [reserveAnnouncementHeight]);

  const initialChromeHeight = reserveAnnouncementHeight
    ? "calc(2.75rem + 4rem)"
    : "4rem";

  return (
    <div
      ref={chromeRef}
      className="fixed inset-x-0 top-0 z-[1000] w-full bg-transparent"
      style={
        {
          [SITE_CHROME_HEIGHT_VAR]: initialChromeHeight,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
