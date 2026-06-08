import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { csvCutoffRowSchema } from '@/lib/validators';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 },
      );
    }

    const fileName = file.name.toLowerCase();
    let rows: Record<string, unknown>[] = [];

    // Parse CSV or Excel
    if (fileName.endsWith('.csv')) {
      const text = await file.text();
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim().toLowerCase().replace(/\s+/g, '_'),
      });
      rows = parsed.data as Record<string, unknown>[];
    } else if (
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls')
    ) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(sheet, {
        raw: true,
        defval: '',
      }) as Record<string, unknown>[];
      // Normalize headers
      rows = rows.map((row) => {
        const normalized: Record<string, unknown> = {};
        Object.keys(row).forEach((key) => {
          normalized[key.trim().toLowerCase().replace(/\s+/g, '_')] = row[key];
        });
        return normalized;
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported file format. Use CSV or Excel.' },
        { status: 400 },
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'File is empty' },
        { status: 400 },
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get existing entities for name → ID mapping
    const [
      { data: exams },
      { data: colleges },
      { data: branches },
    ] = await Promise.all([
      supabase.from('exams').select('id, exam_name'),
      supabase.from('colleges').select('id, college_name'),
      supabase.from('branches').select('id, branch_name, college_id'),
    ]);

    const examMap = new Map(
      (exams || []).map((e) => [e.exam_name.toLowerCase(), e.id]),
    );
    const collegeMap = new Map(
      (colleges || []).map((c) => [c.college_name.toLowerCase(), c.id]),
    );

    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    const cutoffsToInsert: Record<string, unknown>[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Header + 1-indexed

      // Validate row
      const validation = csvCutoffRowSchema.safeParse(row);
      if (!validation.success) {
        failed++;
        errors.push(
          `Row ${rowNum}: ${validation.error.errors[0].message}`,
        );
        continue;
      }

      const data = validation.data;

      // Resolve exam
      const examId = examMap.get(data.exam_name.toLowerCase());
      if (!examId) {
        failed++;
        errors.push(`Row ${rowNum}: Exam "${data.exam_name}" not found`);
        continue;
      }

      // Resolve college
      const collegeId = collegeMap.get(data.college_name.toLowerCase());
      if (!collegeId) {
        failed++;
        errors.push(`Row ${rowNum}: College "${data.college_name}" not found`);
        continue;
      }

      // Resolve branch
      const branch = (branches || []).find(
        (b) =>
          b.college_id === collegeId &&
          b.branch_name.toLowerCase() === data.branch_name.toLowerCase(),
      );
      if (!branch) {
        failed++;
        errors.push(
          `Row ${rowNum}: Branch "${data.branch_name}" not found for college "${data.college_name}"`,
        );
        continue;
      }

      cutoffsToInsert.push({
        exam_id: examId,
        college_id: collegeId,
        branch_id: branch.id,
        category: data.category,
        gender: data.gender,
        home_state: data.home_state || null,
        opening_rank: data.opening_rank,
        closing_rank: data.closing_rank,
        year: data.year,
      });
    }

    // Bulk insert in batches of 100
    for (let i = 0; i < cutoffsToInsert.length; i += 100) {
      const batch = cutoffsToInsert.slice(i, i + 100);
      const { error: insertError } = await supabase
        .from('cutoffs')
        .insert(batch);
      if (insertError) {
        failed += batch.length;
        errors.push(`Batch insert error: ${insertError.message}`);
      } else {
        success += batch.length;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: rows.length,
        success,
        failed,
        errors: errors.slice(0, 20), // Limit error messages
      },
    });
  } catch (error) {
    console.error('Import error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
