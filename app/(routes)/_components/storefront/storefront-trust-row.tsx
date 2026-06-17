import { RefreshCw, Shield, Truck } from "lucide-react";
import type { TrustBadge } from "@/lib/storefront/get-home-data";

const DEFAULT_BADGES: TrustBadge[] = [
  { icon: "truck", label: "Free shipping", sub: "On qualifying orders" },
  { icon: "refresh", label: "Easy returns", sub: "30-day policy" },
  { icon: "shield", label: "Secure checkout", sub: "Encrypted payments" },
];

function IconFor({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes("shield")) return <Shield className="h-6 w-6" />;
  if (n.includes("refresh") || n.includes("return")) return <RefreshCw className="h-6 w-6" />;
  return <Truck className="h-6 w-6" />;
}

type Props = {
  badges: TrustBadge[] | null;
};

export function StorefrontTrustRow({ badges }: Props) {
  const rows = badges?.length ? badges : DEFAULT_BADGES;

  return (
    <section className="border-y border-zinc-100 bg-white py-12 md:py-14" aria-label="Store policies">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-3">
        {rows.map((b, i) => (
          <div key={`${b.label}-${i}`} className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-900">
              <IconFor name={b.icon} />
            </div>
            <div>
              <p className="font-semibold text-zinc-900">{b.label}</p>
              <p className="mt-1 text-sm text-zinc-600">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
