"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Package,
  Users,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import CustomerFormModal from "../customers/_components/customer-form-modal";
import ProductFormModal from "../products/_components/product-form-modal";
import OrderFormModal from "../orders/_components/order-form-modal";
import { GlobalSearch } from "./global-search";

export function AdminHeader() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-200 bg-white/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="lg:hidden w-12 flex-shrink-0" />

      <div className="flex-1" />

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="hidden md:block md:w-[480px] lg:w-[560px] xl:w-[640px]">
          <GlobalSearch />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setIsAddProductOpen(true)}>
              <Package className="h-4 w-4 mr-2" />
              Add Product
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAddUserOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Add User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAddOrderOpen(true)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Create Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CustomerFormModal
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
      />
      <ProductFormModal
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        mode="create"
      />
      <OrderFormModal
        open={isAddOrderOpen}
        onOpenChange={setIsAddOrderOpen}
        mode="create"
      />
    </header>
  );
}
