import type { Prisma } from "@prisma/client";

export const homeProductInclude = {
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  variants: {
    select: {
      id: true,
      name: true,
      value: true,
      stock: true,
    },
  },
  _count: {
    select: {
      reviews: true,
    },
  },
} satisfies Prisma.ProductInclude;
