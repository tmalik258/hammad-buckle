"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  User,
  Menu,
  Grid3X3,
  Package,
  UserPlus,
  Settings,
  LogOut,
  Info,
  LayoutDashboard,
  Sparkles,
  Tag,
  Mail,
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { createClient } from "@/lib/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { UserInitialsAvatar } from "@/components/ui/user-initials-avatar";
import { UserRole } from "@prisma/client";
import type { NavCategory } from "@/lib/storefront/get-nav-categories";

type HeaderProps = {
  navCategories?: NavCategory[];
};

const mobileLinkClass =
  "flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-accent/40 border border-transparent transition-all duration-300 group cursor-pointer";

const desktopLinkClass =
  "whitespace-nowrap text-sm font-medium transition-colors hover:text-primary cursor-pointer";

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
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden cursor-pointer">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[320px] sm:w-[400px] border-r border-border backdrop-blur-xl z-[3000]"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-6">
                  <Image
                    src="/logo-transparent.png"
                    alt="Hammad Buckle"
                    width={100}
                    height={100}
                    className="h-full w-auto"
                  />
                </div>

                {isAuthenticated && (
                  <div className="px-4 mb-6">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/20 border border-border">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border">
                        {isLoading ? (
                          <div className="w-full h-full bg-muted animate-pulse rounded-full" />
                        ) : (
                          <UserInitialsAvatar
                            name={profile?.name || user?.user_metadata?.name}
                            email={profile?.email || user?.email}
                            size="md"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {isLoading ? (
                          <div className="h-4 w-24 bg-zinc-200 animate-pulse rounded" />
                        ) : (
                          <p className="text-sm font-medium text-foreground truncate">
                            {profile?.name || user?.email || "User"}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">Welcome back!</p>
                      </div>
                    </div>
                  </div>
                )}

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                  {categoryLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={mobileLinkClass}>
                      <Package className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="font-medium group-hover:text-foreground transition-colors">
                        {link.label}
                      </span>
                    </Link>
                  ))}

                  <Link href="/collections" className={mobileLinkClass}>
                    <Grid3X3 className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="font-medium group-hover:text-foreground transition-colors">
                      Collections
                    </span>
                  </Link>

                  <Link href="/products?isNew=true" className={mobileLinkClass}>
                    <Sparkles className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="font-medium group-hover:text-foreground transition-colors">
                      New Arrivals
                    </span>
                  </Link>

                  <Link href="/products?onSale=true" className={mobileLinkClass}>
                    <Tag className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="font-medium group-hover:text-foreground transition-colors">
                      Sale
                    </span>
                  </Link>

                  <Link href="/about-us" className={mobileLinkClass}>
                    <Info className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="font-medium group-hover:text-foreground transition-colors">
                      About Us
                    </span>
                  </Link>

                  <Link href="/contact" className={mobileLinkClass}>
                    <Mail className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="font-medium group-hover:text-foreground transition-colors">
                      Contact
                    </span>
                  </Link>

                  <Link href="/cart" className={mobileLinkClass}>
                    <div className="relative">
                      <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      {itemCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs !bg-primary !text-primary-foreground border-none">
                          {itemCount}
                        </Badge>
                      )}
                    </div>
                    <span className="font-medium group-hover:text-foreground transition-colors">
                      Shopping Cart
                    </span>
                  </Link>
                </nav>

                <div className="px-4 py-4 border-t border-border space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Link href="/my-account" className={mobileLinkClass}>
                        <Settings className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                        <span className="font-medium group-hover:text-zinc-900 transition-colors">
                          Profile Settings
                        </span>
                      </Link>

                      {profile?.role === UserRole.ADMIN ? (
                        <Link href="/admin" className={mobileLinkClass}>
                          <LayoutDashboard className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                          <span className="font-medium group-hover:text-zinc-900 transition-colors">
                            Admin
                          </span>
                        </Link>
                      ) : null}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-destructive/10 border border-transparent transition-all duration-300 group cursor-pointer"
                      >
                        <LogOut className="h-5 w-5 text-destructive transition-colors" />
                        <span className="font-medium group-hover:text-destructive transition-colors">
                          Sign Out
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" className={mobileLinkClass}>
                        <User className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="font-medium group-hover:text-foreground transition-colors">
                          Account
                        </span>
                      </Link>

                      <Link
                        href="/auth/signup"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-all duration-300 group cursor-pointer"
                      >
                        <UserPlus className="h-5 w-5 transition-colors" />
                        <span className="font-medium transition-colors">Join</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center cursor-pointer">
            <div className="font-bold text-2xl font-serif text-primary">
              <Image
                src="/logo-transparent.png"
                alt="Hammad Buckle"
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
            <Link href="/contact" className={desktopLinkClass}>
              Contact
            </Link>
            <Link href="/about-us" className={desktopLinkClass}>
              About Us
            </Link>
          </nav>

          <div className="flex items-center">
            {isAuthenticated && isInitialized ? (
              <>
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

                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer relative"
                  asChild
                >
                  <Link href="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {itemCount}
                      </Badge>
                    )}
                    <span className="sr-only">Shopping cart</span>
                  </Link>
                </Button>
              </>
            ) : isInitialized ? (
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-none rounded-tr-2xl rounded-bl-2xl cursor-pointer border-zinc-900 bg-transparent px-4 text-zinc-900 shadow-none hover:bg-zinc-900 hover:text-white"
                >
                  <Link href="/auth/login">Account</Link>
                </Button>
                <Link
                  href="/auth/signup"
                  className="text-sm font-medium text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline cursor-pointer"
                >
                  Join
                </Link>
              </div>
            ) : (
              <div className="h-8 w-36" />
            )}
          </div>
      </div>
    </header>
  );
}
