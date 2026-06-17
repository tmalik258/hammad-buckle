import Image from "next/image";
import { pillars } from "./about-data";

export function AboutPillarsSection() {
  return (
    <section className="border-y border-zinc-100 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            What We Stand For
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
            The principles that guide how we serve our customers every day.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="flex flex-col items-center gap-3 rounded-2xl bg-zinc-50 p-5 text-center ring-1 ring-zinc-200/80"
            >
              <div className="flex h-20 w-20 items-center justify-center lg:h-24 lg:w-24">
                <Image
                  src={pillar.icon}
                  alt=""
                  width={96}
                  height={96}
                  className="h-full w-full object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900">{pillar.title}</h3>
              <p className="text-sm text-zinc-600 md:text-base">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
