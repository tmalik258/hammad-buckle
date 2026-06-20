import { CheckCircle } from "lucide-react";

interface HeroSectionProps {
  orderNumber?: string;
  customerEmail?: string;
}

export function HeroSection({ orderNumber, customerEmail }: HeroSectionProps) {
  return (
    <section className="relative bg-zinc-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100">
            <CheckCircle className="h-14 w-14 text-zinc-900" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
          Thank You! Order Has Been Placed
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-zinc-600 sm:text-2xl">
          We&apos;ve sent your order details to your email.
        </p>

        {orderNumber && (
          <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600">Order Number:</span>
                <span className="font-semibold text-zinc-900">#{orderNumber}</span>
              </div>
              {customerEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">Email:</span>
                  <span className="ml-2 truncate font-medium text-zinc-900">{customerEmail}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
