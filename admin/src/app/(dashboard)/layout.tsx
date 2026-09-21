import { redirect } from 'next/navigation';
import { getServerToken } from '@/lib/auth/server-token';
import { getMe } from '@/lib/api/auth.api';
import { AdminAuthProvider } from '@/lib/auth/AdminAuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const admin = await getMe(token).catch(() => null);
  if (!admin) redirect('/login');

  return (
    <AdminAuthProvider admin={admin}>
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <div className="flex-1">
          <Topbar admin={admin} />
          <main className="p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-24">{children}</main>
        </div>
      </div>
    </AdminAuthProvider>
  );
}
