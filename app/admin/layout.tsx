import { Metadata } from 'next';
import { AdminSidebar } from './_components/admin-sidebar';
import { AdminHeader } from './_components/admin-header';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Hammad Buckle',
  description: 'Manage your Hammad Buckle store from the admin dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <AdminHeader />
        
        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}