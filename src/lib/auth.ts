// ============================================================
// Auth Helper Functions
// ============================================================

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Profile } from '@/types';

/**
 * Get the current authenticated user and their profile.
 * Returns null if not authenticated.
 */
export async function getUser(): Promise<{
  user: { id: string; email: string };
  profile: Profile;
} | null> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return {
    user: { id: user.id, email: user.email! },
    profile: profile as Profile,
  };
}

/**
 * Require authentication. Throws if not authenticated.
 */
export async function requireAuth() {
  const result = await getUser();
  if (!result) {
    throw new Error('Authentication required');
  }
  return result;
}

/**
 * Require admin role. Throws if not admin.
 */
export async function requireAdmin() {
  const result = await requireAuth();
  if (result.profile.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return result;
}
