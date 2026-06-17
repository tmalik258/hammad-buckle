import { features } from "./about-data";

export function AboutFeaturesSection() {
  return (
    <section className="border-t border-zinc-100 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Why Choose Hammad Buckle?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
            Shopping that is simple, secure, and built around you.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-[#FFF8E7]">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">{feature.title}</h3>
                <p className="text-sm text-zinc-600 md:text-base">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
