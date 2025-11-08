import Image from "next/image";

export default function TrendingProductsSection() {
  return (
    <section className="py-10 md:py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-left mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Trending Now
          </h2>
          <p className="text-lg text-gray-400">Must have Products!</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-1 p-5 py-10 w-full flex flex-col items-center justify-center gap-3 rounded-[3rem]">
            <div>
              <Image
                src="/images/image-55.png"
                alt="Product 1"
                width={300}
                height={300}
                className="rounded-3xl w-full"
              />
            </div>
            <div className="px-5 text-justify">
              10pcs/box children waterproof band aid cartoon skin patch adhesive
              bandages wound dressing plaster first aid emergency patches.
            </div>
          </div>
          <div className="md:col-span-2 p-10 w-full rounded-[3rem]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <Image
                  src="/images/image-53.png"
                  alt="Product 1"
                  width={300}
                  height={300}
                  className="rounded-[3rem] object-cover w-full z-50"
                />
              </div>
              <div className="md:h-[80%] my-auto">
                <Image
                  src="/images/image-54.png"
                  alt="Product 1"
                  width={300}
                  height={300}
                  className="rounded-[3rem] object-contain w-full h-full z-[1000]"
                />
              </div>
              <div className="md:col-span-2">
                Hand gripper strengthens your grip, wrist, and forearm power for
                better gym performance. Compact and portable, it&apos;s perfect
                for workouts, sports, and rehabilitation.
              </div>
            </div>
          </div>
          <div className="md:col-span-1 flex items-center justify-center p-5 py-10 w-full flex-1 rounded-[3rem]">
            <div>
              <Image
                src="/images/astronaut-product.png"
                alt="Product 1"
                width={300}
                height={300}
                className="rounded-3xl h-full object-contain w-full"
              />
            </div>
            <div></div>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 place-items-center gap-6 p-5 w-full rounded-[3rem]">
            <div className="text-3xl">
              Game harder, pay less! <span className="text-pink-500">20%</span>
              on premium <span className="text-pink-500">joysticks</span>{" "}
              today.”
            </div>
            <div className="grid grid-cols-2 gap-10">
              <div className="grid gap-10">
                {/* Top Left - Blue to Pink Shadow */}
                <div className="bg-black rounded-[2rem] border-1 overflow-hidden h-full">
                  <Image
                    src="/images/controller-1.png"
                    alt="Xbox Controller 1"
                    width={300}
                    height={300}
                    className="rounded-[1.5rem] h-full object-cover"
                  />
                </div>
                {/* Bottom Left - Pink Shadow */}
                <div className="bg-black rounded-[2rem] border-1 overflow-hidden h-full">
                  <Image
                    src="/images/controller-3.png"
                    alt="Xbox Controller 3"
                    width={300}
                    height={300}
                    className="rounded-[1.5rem] h-full object-cover"
                  />
                </div>
              </div>
              <div className="grid gap-10">
                {/* Top Right - Pink Shadow */}
                <div className="bg-black rounded-[2rem] border-1 overflow-hidden h-full">
                  <Image
                    src="/images/controller-2.png"
                    alt="Xbox Controller 2"
                    width={300}
                    height={300}
                    className="rounded-[1.5rem] h-full object-cover"
                  />
                </div>
                {/* Bottom Right - Pink Shadow */}
                <div className="bg-black rounded-[2rem] border-1 overflow-hidden h-full">
                  <Image
                    src="/images/controller-4.png"
                    alt="Xbox Controller 4"
                    width={300}
                    height={300}
                    className="rounded-[1.5rem] h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
