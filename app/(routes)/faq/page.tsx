/**
 * Page: FAQ
 * Rendering: SSG (static help content)
 * Reason: Standalone FAQ page linked from footer
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

const faqSections = [
  {
    title: "Orders",
    items: [
      {
        question: "How can I track my order?",
        answer:
          "Sign in and open My Account or Orders to view order status and tracking details for recent purchases.",
      },
      {
        question: "Can I modify or cancel my order?",
        answer:
          "Orders can be modified or cancelled within 1 hour of placement. Contact us immediately if you need to make changes.",
      },
    ],
  },
  {
    title: "Shipping",
    items: [
      {
        question: "What are your shipping options?",
        answer:
          "We offer standard shipping (5-7 business days), express shipping (2-3 business days), and overnight shipping within Pakistan.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "International shipping is available to select destinations. Delivery times vary by location.",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept major credit and debit cards, bank transfers, and other secure payment options at checkout.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Yes. We use industry-standard encryption and secure payment processing to protect your information.",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        question: "How do I create an account?",
        answer:
          "Click Join in the navigation and complete the registration form with your details.",
      },
      {
        question: "I forgot my password. What should I do?",
        answer:
          "Use Forgot Password on the login page and we will email you a reset link.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-[var(--site-chrome-height,4rem)]">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-zinc-600">
            Quick answers about orders, shipping, payments, and your account.
          </p>
        </header>

        <div className="mx-auto max-w-3xl space-y-8">
          {faqSections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-4 text-xl font-semibold text-zinc-900">{section.title}</h2>
              <div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200/80">
                {section.items.map((item) => (
                  <details
                    key={item.question}
                    className="group border-b border-zinc-200 last:border-b-0"
                  >
                    <summary className="cursor-pointer list-none px-4 py-4 font-medium text-zinc-900 marker:content-none [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-4">
                        {item.question}
                        <span className="text-zinc-400 transition group-open:rotate-45">+</span>
                      </span>
                    </summary>
                    <p className="px-4 pb-4 text-sm leading-relaxed text-zinc-600">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-xl rounded-2xl bg-white p-8 text-center ring-1 ring-zinc-200/80">
          <h2 className="text-xl font-semibold text-zinc-900">Still need help?</h2>
          <p className="mt-2 text-zinc-600">
            Our team is happy to answer anything not covered here.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="cursor-pointer">
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button asChild variant="outline" className="cursor-pointer">
              <Link href="/orders">Track Order</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
