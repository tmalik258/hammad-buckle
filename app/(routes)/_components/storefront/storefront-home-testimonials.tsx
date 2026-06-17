"use client";

type ReviewCard = {
  id: string;
  rating: number;
  comment: string | null;
  user: { name: string | null };
  product: { name: string };
};

type Props = {
  title: string;
  subtitle?: string;
  testimonials: ReviewCard[];
};

export function StorefrontHomeTestimonials({ title, subtitle, testimonials }: Props) {
  if (!testimonials.length) return null;

  return (
    <section className="bg-zinc-50 py-14 md:py-20" aria-label="Customer reviews">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">{title}</h2>
          {subtitle ? (
            <p className="mt-2 text-sm text-zinc-600 md:text-base">{subtitle}</p>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/80"
            >
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < r.rating ? "★" : "☆"}</span>
                  ))}
                </div>
              </div>
              {r.comment ? (
                <p className="mt-4 text-sm leading-relaxed text-zinc-700 line-clamp-4">{r.comment}</p>
              ) : null}
              <p className="mt-4 text-sm font-semibold text-zinc-900">
                {r.user.name ?? "Customer"}
              </p>
              <p className="text-xs text-zinc-500">{r.product.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
