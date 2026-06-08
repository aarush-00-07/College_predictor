import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getUser } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getUser();

  if (!userData) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userData.user} profile={userData.profile} />
      <main className="container-app py-8">{children}</main>
    </div>
  );
}
