import Image from "next/image";
import { teamMembers } from "./about-data";

export function AboutTeamSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            The People Behind Hammad Buckle
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
            A small team focused on quality products and dependable service.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
          {teamMembers.map((member) => (
            <div key={member.name} className="text-center">
              <div className="relative mx-auto mb-5 h-32 w-32 overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-zinc-200 lg:h-36 lg:w-36">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={144}
                  height={144}
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900">{member.name}</h3>
              <p className="mt-1 text-sm text-zinc-600 md:text-base">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
