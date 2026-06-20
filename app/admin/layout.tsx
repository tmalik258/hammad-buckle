import { Metadata } from 'next';
import { requireAdmin } from '@/lib/utils/auth';
import { AdminShell } from './_components/admin-shell';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Hammad Buckle',
  description: 'Manage your Hammad Buckle store from the admin dashboard',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return <AdminShell>{children}</AdminShell>;
}
