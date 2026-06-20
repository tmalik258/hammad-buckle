'use client';

import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-theme min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
