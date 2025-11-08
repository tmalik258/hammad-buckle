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
  estimatedDelivery
}: ContentSectionProps) {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white/30 backdrop-blur-sm min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Order Items */}
        <div className="space-y-4 mb-8">
          {orderItems.map((item) => (
            <div key={item.id} className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/30">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 bg-gray-800 rounded-xl overflow-hidden border border-purple-500/20">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg">&quot;{item.name}&quot;</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-300 mt-1">
                    {item.color && <span>Color: {item.color}</span>}
                    {item.quantity && <span>Qty: {item.quantity}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-purple-400 text-lg">KWD {item.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Payment Method */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-white font-semibold mb-3">Payment Method</h3>
            <p className="text-gray-300">{paymentMethod} ..........</p>
          </div>

          {/* Shipping Address */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-white font-semibold mb-3">Shipping Address</h3>
            <p className="text-gray-300">{shippingAddress.street}</p>
          </div>

          {/* Contact Email */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-white font-semibold mb-3">Contact Email</h3>
            <p className="text-gray-300">Sarah@example.com</p>
          </div>

          {/* Estimated Delivery */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-white font-semibold mb-3">Estimated Delivery</h3>
            <p className="text-gray-300">{estimatedDelivery}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold cursor-pointer">
            Track My Order
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold cursor-pointer">
            Continue Shopping
          </Button>
        </div>
      </div>
    </section>
  );
}