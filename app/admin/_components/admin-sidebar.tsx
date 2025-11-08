'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  FolderTree,
  Menu,
  X,
  Calendar,
  Tag,
  Ticket,
} from 'lucide-react';
import Image from 'next/image';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'pendingOrders' | 'pendingReviews' | 'lowStockProducts' | 'inactiveCategories' | 'inactiveOccasions' | 'inactiveTypes';
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
    badgeKey: 'lowStockProducts',
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: FolderTree,
    badgeKey: 'inactiveCategories',
  },
  {
    title: 'Occasions',
    href: '/admin/occasions',
    icon: Calendar,
    badgeKey: 'inactiveOccasions',
  },
  {
    title: 'Types',
    href: '/admin/types',
    icon: Tag,
    badgeKey: 'inactiveTypes',
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    badgeKey: 'pendingOrders',
  },
  {
    title: 'Promo Codes',
    href: '/admin/promo-codes',
    icon: Ticket,
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
];

export function AdminSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  // const { data: badgeCounts } = useBadgeCounts();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex h-full min-h-dvh flex-col">
      {/* Logo */}
      <div className="flex h-16 max-md:h-14 items-center border-b px-6 max-md:px-4">
        <Link href="/admin" className="flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="Wizza Admin"
            width={150}
            height={100}
            className='mx-auto max-md:w-[120px] max-md:h-auto'
          />
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 max-md:px-2 py-4 max-md:py-3">
        <nav className="space-y-1 max-md:space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 max-md:px-2 py-2 max-md:py-1.5 text-sm max-md:text-xs font-medium transition-colors hover:bg-violet-100',
                  active
                    ? 'bg-violet-100 text-violet-700 hover:bg-violet-100'
                    : 'text-gray-300 hover:text-gray-900'
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <div className="flex items-center space-x-3 max-md:space-x-2">
                  <Icon className="h-5 w-5 max-md:h-4 max-md:w-4 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </div>
                {/* {item.badgeKey && badgeCounts && badgeCounts[item.badgeKey] > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-1 max-md:px-1.5 max-md:py-0.5 text-xs max-md:text-[10px] font-medium text-red-800 flex-shrink-0">
                    {badgeCounts[item.badgeKey]}
                  </span>
                )} */}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4 max-md:p-3">
        <div className="flex items-center space-x-3 max-md:space-x-2">
          <div className="h-8 w-8 max-md:h-7 max-md:w-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-sm max-md:text-xs font-medium">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm max-md:text-xs font-medium truncate">Admin User</p>
            <p className="text-xs max-md:text-[10px] text-violet-500 truncate">admin@wizza.com</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button - hide when sidebar is open to avoid overlapping the logo */}
      {!isMobileOpen && (
        <div className="fixed top-4 left-4 z-50 lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileOpen(true)}
            className="bg-white shadow-lg border-gray-200 hover:bg-gray-50 h-11 w-11 p-0 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            aria-label="Open navigation menu"
            aria-expanded={isMobileOpen}
            aria-controls="mobile-sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div 
            className="fixed inset-0 bg-opacity-50 transition-opacity" 
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex w-full max-w-xs max-md:max-w-[280px] flex-col bg-white shadow-xl" id="mobile-sidebar" role="navigation" aria-label="Main navigation">
            <div className="absolute top-2 right-2 max-md:top-3 max-md:right-3 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 max-md:h-8 max-md:w-8 max-md:p-0 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5 max-md:h-4 max-md:w-4" />
              </Button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col bg-white border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}