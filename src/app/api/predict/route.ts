import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { predictionSchema } from '@/lib/validators';
import { calculateProbability, rateLimit } from '@/lib/utils';
import type { PredictionResult } from '@/types';

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`predict:${ip}`, 20, 60_000)) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const validation = predictionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 },
      );
    }

    const input = validation.data;
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Build the cutoff query
    let query = supabase
      .from('cutoffs')
      .select(
        `
        opening_rank,
        closing_rank,
        year,
        colleges!inner(college_name, state, college_type),
        branches!inner(branch_name)
      `,
      )
      .eq('exam_id', input.exam_id)
      .eq('category', input.category)
      .eq('gender', input.gender)
      .gte('closing_rank', input.national_rank)
      .order('closing_rank', { ascending: true });

    // Filter by branch name if provided
    if (input.branch_name) {
      query = query.ilike('branches.branch_name', `%${input.branch_name}%`);
    }

    // Get the most recent year's data
    const { data: cutoffs, error: dbError } = await query.limit(100);

    if (dbError) {
      console.error('Prediction query error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch predictions' },
        { status: 500 },
      );
    }

    // Transform results
    const results: PredictionResult[] = (cutoffs || []).map((cutoff: Record<string, unknown>) => {
      const college = cutoff.colleges as Record<string, string>;
      const branch = cutoff.branches as Record<string, string>;

      return {
        college_name: college.college_name,
        branch_name: branch.branch_name,
        state: college.state,
        college_type: college.college_type as PredictionResult['college_type'],
        opening_rank: cutoff.opening_rank as number,
        closing_rank: cutoff.closing_rank as number,
        probability: calculateProbability(
          input.national_rank,
          cutoff.opening_rank as number,
          cutoff.closing_rank as number,
        ),
        year: cutoff.year as number,
      };
    });

    // Save search history
    await supabase.from('search_history').insert({
      user_id: user.id,
      search_data: input,
      results_count: results.length,
    });

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
