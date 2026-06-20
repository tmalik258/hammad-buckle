'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserInitialsAvatar } from '@/components/ui/user-initials-avatar';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUserStore } from '@/lib/stores/user-store';
import { createClient } from '@/lib/utils/supabase/client';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  FolderTree,
  Menu,
  X,
  Ticket,
  PanelsTopLeft,
  LogOut,
} from 'lucide-react';
import Image from 'next/image';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'pendingOrders' | 'pendingReviews' | 'lowStockProducts' | 'inactiveCategories';
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Storefront',
    href: '/admin/storefront',
    icon: PanelsTopLeft,
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
    title: 'Users',
    href: '/admin/customers',
    icon: Users,
  },
];

export function AdminSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { logout } = useUserStore();
  const { user, profile } = useAuth();

  const displayName = useMemo(() => {
    return (
      profile?.name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      user?.email?.split('@')[0] ||
      'Admin User'
    );
  }, [profile, user]);

  const displayEmail = user?.email || 'admin@hammadbuckle.com';
  const isProfileActive = pathname.startsWith('/admin/profile');

  const handleSignOut = useCallback(async () => {
    try {
      await logout(true);
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  }, [logout, router, supabase.auth]);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex h-full min-h-dvh flex-col">
      <div className="flex h-16 max-md:h-14 items-center border-b border-zinc-200 px-6 max-md:px-4">
        <Link href="/admin" className="flex items-center justify-center">
          <Image
            src="/logo-transparent.png"
            alt="Hammad Buckle Admin"
            width={100}
            height={100}
            className="mx-auto h-auto w-[100px] max-md:w-[80px]"
          />
        </Link>
      </div>

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
                  'flex items-center justify-between rounded-lg px-3 max-md:px-2 py-2 max-md:py-1.5 text-sm max-md:text-xs font-medium transition-colors cursor-pointer',
                  active
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <div className="flex items-center space-x-3 max-md:space-x-2">
                  <Icon className="h-5 w-5 max-md:h-4 max-md:w-4 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-zinc-200 p-4 max-md:p-3 space-y-2">
        <Link
          href="/admin/profile"
          className={cn(
            'flex items-center gap-3 rounded-lg p-2 -m-2 cursor-pointer transition-colors',
            isProfileActive
              ? 'bg-zinc-100 ring-1 ring-zinc-200'
              : 'hover:bg-zinc-100'
          )}
          onClick={() => setIsMobileOpen(false)}
        >
          <UserInitialsAvatar name={displayName} email={displayEmail} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm max-md:text-xs font-medium truncate">{displayName}</p>
            <p className="text-xs max-md:text-[10px] text-muted-foreground truncate">
              {displayEmail}
            </p>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {!isMobileOpen && (
        <div className="fixed top-4 left-4 z-50 lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileOpen(true)}
            className="border-zinc-200 bg-white shadow-lg hover:bg-zinc-50 h-11 w-11 p-0 cursor-pointer"
            aria-label="Open navigation menu"
            aria-expanded={isMobileOpen}
            aria-controls="mobile-sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            className="relative flex w-full max-w-xs max-md:max-w-[280px] flex-col bg-white shadow-xl border-r border-zinc-200"
            id="mobile-sidebar"
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="absolute top-2 right-2 max-md:top-3 max-md:right-3 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 max-md:h-8 max-md:w-8 max-md:p-0 cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5 max-md:h-4 max-md:w-4" />
              </Button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col border-r border-zinc-200 bg-white">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}
