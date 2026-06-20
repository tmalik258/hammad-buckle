"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  User,
  Menu,
  Home,
  Grid3X3,
  Package,
  UserPlus,
  Settings,
  LogOut,
  Info,
  X,
  Search,
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { createClient } from "@/lib/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { UserInitialsAvatar } from "@/components/ui/user-initials-avatar";
import { UserRole } from "@prisma/client";

export function Header() {
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
      logout(true); // Show toast message for explicit logout
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.log("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header
      className={`sticky top-0 z-[1000] w-full transition-all duration-300 bg-transparent ${
        isScrolled
          ? "backdrop-blur supports-[backdrop-filter]:bg-background/5 border-b"
          : "border-transparent"
      }`}
    >
      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[320px] sm:w-[400px] border-r border-border backdrop-blur-xl z-[3000]"
            >
              <div className="flex flex-col h-full">
                {/* Header Section with Logo */}
                <div className="flex items-center mb-6">
                  <Image
                    src="/logo-transparent.png"
                    alt="Hammad Buckle"
                    width={100}
                    height={100}
                    className="h-full w-auto"
                  />
                </div>

                {/* User Profile Section */}
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

                {/* Navigation Links */}
                <nav className="flex-1 px-4 space-y-2">
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-accent/40 border border-transparent transition-all duration-300 group cursor-pointer"
                  >
                    <Home className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="font-medium group-hover:text-foreground transition-colors">
                      Home
                    </span>
                  </Link>

                  <Link
                    href="/products"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-accent/40 border border-transparent transition-all duration-300 group cursor-pointer"
                  >
                    <Package className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="font-medium group-hover:text-foreground transition-colors">
                      Products
                    </span>
                  </Link>

                  <Link
                    href="/about-us"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-accent/40 border border-transparent transition-all duration-300 group cursor-pointer"
                  >
                    <Info className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="font-medium group-hover:text-foreground transition-colors">
                      About Us
                    </span>
                  </Link>

                  {/* Cart Link with Badge */}
                  <Link
                    href="/cart"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-accent/40 border border-transparent transition-all duration-300 group cursor-pointer"
                  >
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

                {/* Bottom Section - Auth Actions */}
                <div className="px-4 py-4 border-t border-border space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/my-account"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-zinc-100 border border-transparent transition-all duration-300 group cursor-pointer"
                      >
                        <Settings className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900 transition-colors" />
                        <span className="font-medium group-hover:text-zinc-900 transition-colors">
                          Profile Settings
                        </span>
                      </Link>

                      {profile?.role === UserRole.ADMIN ? (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-zinc-100 border border-transparent transition-all duration-300 group cursor-pointer"
                        >
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
                      <Link
                        href="/auth/login"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-accent/40 border border-transparent transition-all duration-300 group cursor-pointer"
                      >
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
                        <span className="font-medium transition-colors">
                          Join
                        </span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center cursor-pointer">
            <div className="font-bold text-2xl font-serif text-primary">
              <Image
                src="/logo-transparent.png"
                alt="Hammad Buckle"
                width={100}
                height={100}
                className="w-full h-full"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Products
            </Link>
            <Link
              href="/about-us"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              About Us
            </Link>
            {/* <Link
              href="/track-order"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Track Order
            </Link> */}
            {/* <Link
              href="/contact"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Contact
            </Link> */}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center">
            {isAuthenticated && isInitialized ? (
              <>
                {/* Search Icon */}
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>

                {/* User Account */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer"
                    >
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

                {/* Shopping Cart */}
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
              /* Loading state - show nothing to prevent flickering */
              <div className="h-8 w-36" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
