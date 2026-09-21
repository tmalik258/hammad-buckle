"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  User,
  Menu,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/stores/cart-store";
import { useUserStore } from "@/lib/stores/user-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { createClient } from "@/lib/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { UserInitialsAvatar } from "@/components/ui/user-initials-avatar";
import { UserRole } from "@prisma/client";
import type { NavCategory } from "@/lib/storefront/get-nav-categories";
import { LOGO_PATH, SITE_NAME } from "@/lib/site-metadata";
import { cn } from "@/lib/utils";

type HeaderProps = {
  navCategories?: NavCategory[];
};

const desktopLinkClass =
  "whitespace-nowrap text-sm font-medium transition-colors hover:text-primary cursor-pointer";

const shopLinkClass =
  "group relative block cursor-pointer py-3.5 font-serif text-xl tracking-tight text-foreground transition-colors duration-300 hover:text-foreground/70";

const utilityLinkClass =
  "flex cursor-pointer items-center gap-3 py-2.5 text-sm text-foreground/70 transition-colors duration-300 hover:text-foreground";

const shopStaggerClass =
  "animate-in fade-in fill-mode-both duration-500";

export function Header({ navCategories = [] }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount } = useCartStore();
  const { logout } = useUserStore();
  const { isAuthenticated, user, profile, isLoading, isInitialized } =
    useAuth();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout(true);
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.log("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categoryLinks = navCategories.map((category) => ({
    href: `/products?category=${category.id}`,
    label: category.name,
  }));

  return (
    <header className="w-full bg-transparent px-3 pb-2 pt-2 sm:px-4 md:px-6">
      <div
        className={`mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-2xl border px-3 transition-all duration-300 sm:h-16 sm:px-4 ${
          isScrolled
            ? "border-white/40 bg-white/35 shadow-lg shadow-zinc-900/5 backdrop-blur-2xl"
            : "border-white/30 bg-white/20 shadow-md shadow-zinc-900/5 backdrop-blur-2xl"
        }`}
      >
          <Link href="/" className="flex shrink-0 items-center cursor-pointer">
            <div className="font-bold text-2xl font-serif text-primary">
              <Image
                src={LOGO_PATH}
                alt={SITE_NAME}
                width={100}
                height={100}
                className="h-10 w-auto sm:h-12"
              />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-4 xl:gap-5">
            {categoryLinks.map((link) => (
              <Link key={link.href} href={link.href} className={desktopLinkClass}>
                {link.label}
              </Link>
            ))}
            <Link href="/collections" className={desktopLinkClass}>
              Collections
            </Link>
            <Link href="/products?isNew=true" className={desktopLinkClass}>
              New Arrivals
            </Link>
            <Link href="/products?onSale=true" className={desktopLinkClass}>
              Sale
            </Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {isAuthenticated && isInitialized ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="cursor-pointer">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-48 rounded-xl border-zinc-200 bg-white p-1 text-zinc-900 shadow-md"
                >
                  <DropdownMenuLabel className="font-medium text-zinc-900">
                    {profile?.name || user?.email || "User"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-200" />
                  <DropdownMenuItem asChild className="cursor-pointer text-zinc-700 focus:bg-zinc-100 focus:text-zinc-900">
                    <Link href="/my-account">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer text-zinc-700 focus:bg-zinc-100 focus:text-zinc-900">
                    <Link href="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  {profile?.role === UserRole.ADMIN ? (
                    <DropdownMenuItem asChild className="cursor-pointer text-zinc-700 focus:bg-zinc-100 focus:text-zinc-900">
                      <Link href="/admin">
                        <LayoutDashboard className="mr-2 inline h-4 w-4" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator className="bg-zinc-200" />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isInitialized ? (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="cursor-pointer border-zinc-900/80 bg-transparent px-3.5 text-zinc-900 shadow-none hover:bg-zinc-900 hover:text-white"
              >
                <Link href="/auth/login">Sign in</Link>
              </Button>
            ) : (
              <div className="h-8 w-20" />
            )}

            {isInitialized ? (
              <Button
                variant="ghost"
                size="icon"
                className="relative cursor-pointer"
                asChild
              >
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                      {itemCount}
                    </Badge>
                  )}
                  <span className="sr-only">Shopping cart</span>
                </Link>
              </Button>
            ) : null}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden cursor-pointer">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="z-[3000] w-[min(100vw,22rem)] gap-0 overflow-hidden border-l border-black/10 bg-white p-0 sm:max-w-[22rem]"
              >
                <SheetTitle className="sr-only">Main menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Site navigation and account links
                </SheetDescription>
                <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 pb-6 pt-8">
                  <div className="mb-10 shrink-0 animate-in fade-in duration-500">
                    <Link href="/" className="inline-flex cursor-pointer flex-col items-start gap-2">
                      <Image
                        src={LOGO_PATH}
                        alt={SITE_NAME}
                        width={120}
                        height={120}
                        className="h-16 w-auto"
                      />
                      <span className="font-serif text-[0.65rem] font-semibold tracking-[0.28em] text-foreground/55 uppercase">
                        Clothing Brand
                      </span>
                    </Link>
                  </div>

                  {isAuthenticated ? (
                    <div className="mb-8 flex shrink-0 items-center gap-3 animate-in fade-in duration-500 delay-75">
                      <div className="h-9 w-9 overflow-hidden rounded-full">
                        {isLoading ? (
                          <div className="h-full w-full animate-pulse rounded-full bg-black/10" />
                        ) : (
                          <UserInitialsAvatar
                            name={profile?.name || user?.user_metadata?.name}
                            email={profile?.email || user?.email}
                            size="md"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {isLoading ? (
                          <div className="h-4 w-24 animate-pulse rounded bg-black/10" />
                        ) : (
                          <p className="truncate text-sm text-foreground">
                            {profile?.name || user?.email || "User"}
                          </p>
                        )}
                        <p className="text-xs text-foreground/45">Welcome back</p>
                      </div>
                    </div>
                  ) : null}

                  <nav className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
                    <p className="mb-3 font-serif text-[0.65rem] font-semibold tracking-[0.28em] text-foreground/45 uppercase">
                      Shop
                    </p>
                    <div className="flex flex-col border-t border-black/10">
                      {categoryLinks.map((link, index) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(shopLinkClass, shopStaggerClass)}
                          style={{ animationDelay: `${100 + index * 60}ms` }}
                        >
                          <span className="relative inline-block">
                            {link.label}
                            <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-foreground transition-transform duration-300 group-hover:scale-x-100" />
                          </span>
                        </Link>
                      ))}
                      {[
                        { href: "/collections", label: "Collections" },
                        { href: "/products?isNew=true", label: "New Arrivals" },
                        { href: "/products?onSale=true", label: "Sale" },
                      ].map((link, index) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(shopLinkClass, shopStaggerClass)}
                          style={{
                            animationDelay: `${100 + (categoryLinks.length + index) * 60}ms`,
                          }}
                        >
                          <span className="relative inline-block">
                            {link.label}
                            <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-foreground transition-transform duration-300 group-hover:scale-x-100" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </nav>

                  <div className="mt-auto shrink-0 space-y-1 border-t border-black/10 pt-5 animate-in fade-in duration-500 delay-300">
                    <Link href="/cart" className={utilityLinkClass}>
                      <ShoppingCart className="h-4 w-4" />
                      <span>
                        Cart{itemCount > 0 ? ` (${itemCount})` : ""}
                      </span>
                    </Link>

                    {isAuthenticated ? (
                      <>
                        <Link href="/my-account" className={utilityLinkClass}>
                          <Settings className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>

                        {profile?.role === UserRole.ADMIN ? (
                          <Link href="/admin" className={utilityLinkClass}>
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Admin</span>
                          </Link>
                        ) : null}

                        <button
                          type="button"
                          onClick={handleLogout}
                          className={cn(
                            utilityLinkClass,
                            "w-full text-destructive hover:text-destructive"
                          )}
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign out</span>
                        </button>
                      </>
                    ) : (
                      <Link href="/auth/login" className={utilityLinkClass}>
                        <User className="h-4 w-4" />
                        <span>Sign in</span>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
      </div>
    </header>
  );
}
