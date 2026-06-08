// ============================================================
// Resend Email Client
// ============================================================

import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com';

/**
 * Generate the HTML for a college prediction report email.
 */
export function generateReportEmailHtml(data: {
  studentName: string;
  examName: string;
  rank: number;
  category: string;
  gender: string;
  homeState: string;
  results: Array<{
    college_name: string;
    branch_name: string;
    state: string;
    college_type: string;
    opening_rank: number;
    closing_rank: number;
    probability: string;
  }>;
}): string {
  const now = new Date().toLocaleString('en-IN', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const rows = data.results
    .map(
      (r, i) => `
      <tr style="background-color: ${i % 2 === 0 ? '#f9fafb' : '#ffffff'};">
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${r.college_name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${r.branch_name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${r.state}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${r.college_type}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: center;">${r.opening_rank}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: center;">${r.closing_rank}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: center;">
          <span style="padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;
            background-color: ${r.probability === 'High' ? '#dcfce7' : r.probability === 'Medium' ? '#fef9c3' : '#fee2e2'};
            color: ${r.probability === 'High' ? '#166534' : r.probability === 'Medium' ? '#854d0e' : '#991b1b'};">
            ${r.probability}
          </span>
        </td>
      </tr>`,
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8" /></head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 800px; margin: 0 auto; padding: 32px 16px;">
      <!-- Header -->
      <div style="background-color: #2563eb; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎓 College Predictor Report</h1>
        <p style="color: #dbeafe; margin: 8px 0 0; font-size: 14px;">Generated on ${now}</p>
      </div>

      <!-- Student Info -->
      <div style="background-color: #ffffff; padding: 24px 32px; border-bottom: 1px solid #e5e7eb;">
        <h2 style="margin: 0 0 16px; font-size: 18px; color: #1f2937;">Student Details</h2>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 4px 0; color: #6b7280; font-size: 14px; width: 140px;">Name</td>
            <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.studentName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Examination</td>
            <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.examName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">National Rank</td>
            <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.rank}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Category</td>
            <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.category}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Gender</td>
            <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.gender}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Home State</td>
            <td style="padding: 4px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.homeState}</td>
          </tr>
        </table>
      </div>

      <!-- Results Table -->
      <div style="background-color: #ffffff; padding: 24px 32px; border-radius: 0 0 12px 12px;">
        <h2 style="margin: 0 0 16px; font-size: 18px; color: #1f2937;">Recommended Colleges (${data.results.length})</h2>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #eff6ff;">
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #2563eb; text-transform: uppercase; border-bottom: 2px solid #2563eb;">College</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #2563eb; text-transform: uppercase; border-bottom: 2px solid #2563eb;">Branch</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #2563eb; text-transform: uppercase; border-bottom: 2px solid #2563eb;">State</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #2563eb; text-transform: uppercase; border-bottom: 2px solid #2563eb;">Type</th>
                <th style="padding: 10px 12px; text-align: center; font-size: 12px; font-weight: 600; color: #2563eb; text-transform: uppercase; border-bottom: 2px solid #2563eb;">Open Rank</th>
                <th style="padding: 10px 12px; text-align: center; font-size: 12px; font-weight: 600; color: #2563eb; text-transform: uppercase; border-bottom: 2px solid #2563eb;">Close Rank</th>
                <th style="padding: 10px 12px; text-align: center; font-size: 12px; font-weight: 600; color: #2563eb; text-transform: uppercase; border-bottom: 2px solid #2563eb;">Probability</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
        ${data.results.length === 0 ? '<p style="color: #6b7280; text-align: center; padding: 24px;">No matching colleges found for your criteria.</p>' : ''}
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 24px 0;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          This is an automated report from College Predictor. Results are based on historical cutoff data and do not guarantee admission.
        </p>
      </div>
    </div>
  </body>
  </html>`;
}
