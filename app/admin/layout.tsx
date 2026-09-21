import { Metadata } from 'next';
import { requireAdmin } from '@/lib/utils/auth';
import { buildPageMetadata } from '@/lib/site-metadata';
import { AdminShell } from './_components/admin-shell';

export const metadata: Metadata = buildPageMetadata(
  'Admin Dashboard',
  'Manage your Hanara store from the admin dashboard'
);
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return <AdminShell>{children}</AdminShell>;
}
