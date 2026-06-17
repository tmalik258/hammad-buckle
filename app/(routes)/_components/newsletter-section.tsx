"use client";

import axios from "axios";
import { Mail, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

interface NewsletterSectionProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

const DEFAULT_TITLE = "Stay in the loop";
const DEFAULT_SUBTITLE =
  "Subscribe for new collections, exclusive offers, and style inspiration.";

function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export default function NewsletterSection({
  className = "",
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
}: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState<"idle" | "success" | "error">("idle");

  const errorMessage = useMemo(() => {
    if (state !== "error") return null;
    return "Please enter a valid email and try again.";
  }, [state]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setState("error");
      return;
    }

    setIsSubmitting(true);
    setState("idle");

    try {
      const res = await axios.post("/api/newsletter/subscribe", { email });
      if (res.data?.ok) {
        setEmail("");
        setState("success");
        return;
      }
      setState("error");
    } catch {
      setState("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`bg-zinc-50 py-14 md:py-20 ${className}`} aria-label="Newsletter subscription">
      <div className="mx-auto max-w-7xl px-4">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/80">
          <div className="grid gap-6 p-6 md:grid-cols-2 md:gap-8 md:p-10 lg:p-12">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-700">
                <Sparkles className="h-3.5 w-3.5" />
                Insider updates
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">{title}</h2>
              <p className="mt-3 max-w-xl text-sm text-zinc-600 md:text-base">{subtitle}</p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-700">
                <li>- Early access to new drops</li>
                <li>- Subscriber-only offers</li>
                <li>- Styling edits from our team</li>
              </ul>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <label htmlFor="newsletter-email" className="text-sm font-medium text-zinc-900">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-3 text-sm focus:border-zinc-900 focus:outline-none"
                    aria-invalid={state === "error"}
                    aria-describedby={errorMessage ? "newsletter-error" : undefined}
                    required
                  />
                </div>
                {errorMessage ? (
                  <p id="newsletter-error" className="text-sm text-red-600">
                    {errorMessage}
                  </p>
                ) : null}
                {state === "success" ? (
                  <p className="text-sm text-emerald-700">You&apos;re subscribed. Welcome to Hammad Buckle.</p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
              <p className="mt-4 text-xs text-zinc-500">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}