import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "../ui/input";

export function Footer() {
  return (
    <div className="relative h-max flex flex-col">
      <footer className="backdrop-blur supports-[backdrop-filter]:bg-background/5 bg-transparent mt-auto h-full">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div>
                <Image
                  src="/images/logo.png"
                  alt="logo"
                  width={100}
                  height={50}
                />
              </div>
              <p className="text-muted-foreground text-sm">
                Smart finds, curated for you. Experience the future of online
                shopping with personalized recommendations and premium service.
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Facebook className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Twitter className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Instagram className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>
            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Shop</h4>
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Products
                </Link>
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Categories
                </Link>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Contact
                </Link>
              </nav>
            </div>
            {/* Customer Service */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Customer Service</h4>
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/account"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  My Account
                </Link>
                <Link
                  href="/orders"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Order Tracking
                </Link>
                <Link
                  href="/wishlist"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Wishlist
                </Link>
                <Link
                  href="/support"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Help & Support
                </Link>
                <Link
                  href="/returns"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Returns & Exchanges
                </Link>
              </nav>
            </div>
            {/* Newsletter Signup */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">Contact Info</h4>
                <h5 className="font-semibold text-lg">
                  Ready to <span className="text-primary">Transform</span>{" "}
                  Your <span className="text-primary">Shopping</span>?
                </h5>
                <p className="text-sm text-muted-foreground">Stay Updated</p>
              </div>
              <div className="flex space-x-0">
                <Input
                  type="email"
                  placeholder="Your email....."
                  className="flex-1 px-4 py-2 bg-transparent border border-border rounded-none rounded-bl-2xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-none rounded-tr-2xl border-0">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="container mx-auto">
          <hr className="border-border" />
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-center items-center">
              <div className="text-sm text-muted-foreground">
                © 2024 Wizza. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
