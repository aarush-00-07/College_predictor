import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { resend, FROM_EMAIL, generateReportEmailHtml } from '@/lib/resend';
import { rateLimit } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`email:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Try again later.' },
      { status: 429 },
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 },
      );
    }

    const body = await request.json();

    const html = generateReportEmailHtml({
      studentName: profile.name,
      examName: body.exam_name || 'N/A',
      rank: body.national_rank || 0,
      category: body.category || 'N/A',
      gender: body.gender || 'N/A',
      homeState: body.home_state || 'N/A',
      results: body.results || [],
    });

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: profile.email,
      subject: `🎓 Your College Prediction Report — ${body.exam_name || 'Exam'}`,
      html,
    });

    // Log the email
    await supabase.from('email_logs').insert({
      user_id: user.id,
      email_type: 'prediction_report',
      email_status: emailError ? 'failed' : 'sent',
      metadata: {
        exam_name: body.exam_name,
        rank: body.national_rank,
        results_count: body.results?.length || 0,
        error: emailError?.message || null,
      },
    });

    if (emailError) {
      console.error('Email send error:', emailError);
      return NextResponse.json(
        { success: false, error: 'Failed to send email. Please try again.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Report sent to ${profile.email}`,
    });
  } catch (error) {
    console.error('Email route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
