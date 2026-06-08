import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();

    // Get search history with user names
    const { data: searches, error: searchError } = await supabase
      .from('search_history')
      .select('*, profiles(name, email)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (searchError) throw searchError;

    // Get some aggregate stats
    const { count: totalSearches } = await supabase
      .from('search_history')
      .select('*', { count: 'exact', head: true });

    // Get daily counts for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentSearches } = await supabase
      .from('search_history')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString());

    const dailyCounts: Record<string, number> = {};
    (recentSearches || []).forEach((s) => {
      const day = new Date(s.created_at).toLocaleDateString('en-IN');
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        searches,
        totalSearches: totalSearches ?? 0,
        dailyCounts,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
