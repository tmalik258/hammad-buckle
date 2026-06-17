/**
 * Page: About Us
 * Rendering: SSG (static marketing content)
 * Reason: Brand story and team information with no user-specific data
 */

import { AboutFeaturesSection } from "./_components/about-features-section";
import { AboutPillarsSection } from "./_components/about-pillars-section";
import { AboutStorySection } from "./_components/about-story-section";
import { AboutTeamSection } from "./_components/about-team-section";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 md:pb-20 md:pt-12">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl lg:text-6xl">
            About Us
          </h1>
          <p className="mt-4 text-lg text-zinc-600 md:text-xl">
            Modern apparel and footwear with a focus on trust, quality, and customer care.
          </p>
        </header>
      </div>

      <AboutStorySection />
      <AboutPillarsSection />
      <AboutTeamSection />
      <AboutFeaturesSection />
    </div>
  );
}
