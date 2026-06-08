'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import type { Profile } from '@/types';

interface NavbarProps {
  user?: { id: string; email: string } | null;
  profile?: Profile | null;
}

export default function Navbar({ user, profile }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-lg font-bold text-gray-900">
              College Predictor
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {profile?.role === 'admin' ? (
                  <Link
                    href="/admin"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Admin Panel
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/history"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      History
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-700 font-medium">
                    {profile?.name}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4">
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <span className="text-sm text-gray-500 px-2">
                    Signed in as {profile?.name}
                  </span>
                  {profile?.role === 'admin' ? (
                    <Link
                      href="/admin"
                      className="text-sm text-gray-700 hover:bg-gray-50 px-2 py-2 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/dashboard"
                        className="text-sm text-gray-700 hover:bg-gray-50 px-2 py-2 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/history"
                        className="text-sm text-gray-700 hover:bg-gray-50 px-2 py-2 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        History
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-red-600 hover:bg-red-50 px-2 py-2 rounded-md text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm text-gray-700 hover:bg-gray-50 px-2 py-2 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm text-primary-600 font-medium hover:bg-primary-50 px-2 py-2 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
