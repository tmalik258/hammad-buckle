import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface ContentSectionProps {
  orderItems: OrderItem[];
  shippingAddress: Address;
  paymentMethod: string;
  estimatedDelivery: string;
}

export function ContentSection({
  orderItems,
  shippingAddress,
  paymentMethod,
  estimatedDelivery,
}: ContentSectionProps) {
  return (
    <section className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 space-y-4">
          {orderItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900">&quot;{item.name}&quot;</h3>
                  <div className="mt-1 flex items-center gap-4 text-sm text-zinc-600">
                    {item.color && <span>Color: {item.color}</span>}
                    {item.quantity && <span>Qty: {item.quantity}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-zinc-900">
                    KWD {item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 font-semibold text-zinc-900">Payment Method</h3>
            <p className="text-zinc-600">{paymentMethod} ..........</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 font-semibold text-zinc-900">Shipping Address</h3>
            <p className="text-zinc-600">{shippingAddress.street}</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 font-semibold text-zinc-900">Contact Email</h3>
            <p className="text-zinc-600">Sarah@example.com</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 font-semibold text-zinc-900">Estimated Delivery</h3>
            <p className="text-zinc-600">{estimatedDelivery}</p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button className="cursor-pointer rounded-none rounded-tr-2xl rounded-bl-2xl bg-zinc-900 px-8 py-3 font-semibold text-white hover:bg-zinc-800">
            Track My Order
          </Button>
          <Button
            variant="outline"
            className="cursor-pointer rounded-none rounded-tr-2xl rounded-bl-2xl border-zinc-900 px-8 py-3 font-semibold text-zinc-900 hover:bg-zinc-900 hover:text-white"
            asChild
          >
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
