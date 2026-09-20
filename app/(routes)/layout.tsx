import { Footer } from "@/components/layout/footer";

import { Header } from "@/components/layout/header";

import { StorefrontAnnouncementBar } from "@/app/(routes)/_components/storefront/storefront-announcement-bar";

import { StorefrontSiteChrome } from "@/app/(routes)/_components/storefront/storefront-site-chrome";

import { getAnnouncementSettings } from "@/lib/storefront/get-announcement-settings";

import { getNavCategories } from "@/lib/storefront/get-nav-categories";

import { ReactNode } from "react";



const Layout = async ({ children }: { children: ReactNode }) => {

  const [announcement, navCategories] = await Promise.all([

    getAnnouncementSettings(),

    getNavCategories(),

  ]);

  const showAnnouncement =

    announcement.enabled && Boolean(announcement.text?.trim());



  return (
    <div className="min-h-screen flex flex-col mx-auto">
      <StorefrontSiteChrome reserveAnnouncementHeight={showAnnouncement}>
        <StorefrontAnnouncementBar
          enabled={announcement.enabled}
          text={announcement.text}
          href={announcement.href}
          style={announcement.style}
        />
        <Header navCategories={navCategories} />
      </StorefrontSiteChrome>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};


export default Layout;

