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
  LogIn,
  UserPlus,
  Settings,
  LogOut,
  Info,
  X,
  Search
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
import { EnhancedImage } from "@/components/ui/enhanced-image";

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
                    alt="Wizza"
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
                          <EnhancedImage
                            src={profile?.avatar || user?.user_metadata?.avatar_url}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="w-full h-full"
                            fallbackInitial={profile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {isLoading ? (
                          <div className="h-4 w-24 bg-pink-400/20 animate-pulse rounded" />
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
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-500/20 hover:border-pink-400/30 border border-transparent transition-all duration-300 group cursor-pointer"
                      >
                        <Settings className="h-5 w-5 text-pink-400 group-hover:text-pink-300 transition-colors" />
                        <span className="font-medium group-hover:text-pink-300 transition-colors">
                          Profile Settings
                        </span>
                      </Link>

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
                        <LogIn className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="font-medium group-hover:text-foreground transition-colors">
                          Sign In
                        </span>
                      </Link>

                      <Link
                        href="/auth/register"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 group cursor-pointer"
                      >
                        <UserPlus className="h-5 w-5 text-primary-foreground transition-colors" />
                        <span className="font-medium transition-colors">
                          Create Account
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
                alt="Wizza"
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
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {profile?.name || user?.email || "User"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/my-account">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist">Wishlist</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
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
              /* Unauthenticated User - Get Started Link with border */
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center h-9 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none rounded-tr-2xl rounded-bl-2xl cursor-pointer border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            ) : (
              /* Loading state - show nothing to prevent flickering */
              <div className="w-32 h-12" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
