'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Sidebar, { MobileSidebar } from '@/components/Sidebar';

// Admin layout is a client component to handle mobile sidebar state.
// Auth is enforced by middleware.ts

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* We pass null for user/profile here since Navbar will be re-rendered;
          the middleware already enforces admin auth */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <span className="text-lg font-bold text-gray-900">Admin Panel</span>
            </Link>
          </div>
          <a
            href="/api/auth/signout"
            onClick={async (e) => {
              e.preventDefault();
              const { createClient } = await import('@/lib/supabase/client');
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign Out
          </a>
        </div>
      </div>

      <div className="flex">
        <Sidebar />
        <MobileSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-6 lg:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
