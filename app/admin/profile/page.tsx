import { Metadata } from 'next';
import SimpleAdminProfile from './_components/simple-admin-profile';

export const metadata: Metadata = {
  title: 'Profile | Admin Dashboard',
  description: 'Manage your admin profile information.',
};

export default function AdminProfilePage() {
  return <SimpleAdminProfile />;
}
