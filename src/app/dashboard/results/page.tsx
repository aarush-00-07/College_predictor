'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Badge, { ProbabilityBadge } from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import type { PredictionResult } from '@/types';

function ResultsContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [results, setResults] = useState<PredictionResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [examName, setExamName] = useState('');

  // Filters
  const [filterState, setFilterState] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterType, setFilterType] = useState('');

  // Email sending
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const body = {
        exam_id: searchParams.get('exam_id'),
        national_rank: Number(searchParams.get('national_rank')),
        category: searchParams.get('category'),
        gender: searchParams.get('gender'),
        home_state: searchParams.get('home_state'),
        branch_name: searchParams.get('branch_name') || undefined,
        state_rank: searchParams.get('state_rank')
          ? Number(searchParams.get('state_rank'))
          : undefined,
      };

      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to get predictions');
        return;
      }

      setResults(data.data);
      setFilteredResults(data.data);

      // Get exam name
      if (body.exam_id) {
        const { data: exam } = await supabase
          .from('exams')
          .select('exam_name')
          .eq('id', body.exam_id)
          .single();
        if (exam) setExamName(exam.exam_name);
      }
    } catch {
      setError('Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  }, [searchParams, supabase]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  // Apply filters
  useEffect(() => {
    let filtered = [...results];
    if (filterState) filtered = filtered.filter((r) => r.state === filterState);
    if (filterBranch)
      filtered = filtered.filter((r) => r.branch_name === filterBranch);
    if (filterType)
      filtered = filtered.filter((r) => r.college_type === filterType);
    setFilteredResults(filtered);
  }, [results, filterState, filterBranch, filterType]);

  // Unique values for filters
  const states = [...new Set(results.map((r) => r.state))].sort();
  const branches = [...new Set(results.map((r) => r.branch_name))].sort();
  const types = [...new Set(results.map((r) => r.college_type))].sort();

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await fetch('/api/email/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_name: examName,
          national_rank: Number(searchParams.get('national_rank')),
          category: searchParams.get('category'),
          gender: searchParams.get('gender'),
          home_state: searchParams.get('home_state'),
          results: filteredResults,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailSent(true);
      } else {
        alert(data.error || 'Failed to send email');
      }
    } catch {
      alert('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDownloadPDF = () => {
    // Open PDF in new window using the browser's print-to-PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rows = filteredResults
      .map(
        (r) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${r.college_name}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${r.branch_name}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${r.state}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${r.college_type}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb; text-align:center;">${r.opening_rank}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb; text-align:center;">${r.closing_rank}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb; text-align:center;">${r.probability}</td>
        </tr>`,
      )
      .join('');

    printWindow.document.write(`
      <html>
      <head><title>College Predictor Report</title></head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #2563eb;">🎓 College Predictor Report</h1>
        <p><strong>Exam:</strong> ${examName}</p>
        <p><strong>Rank:</strong> ${searchParams.get('national_rank')}</p>
        <p><strong>Category:</strong> ${searchParams.get('category')}</p>
        <p><strong>Gender:</strong> ${searchParams.get('gender')}</p>
        <p><strong>Home State:</strong> ${searchParams.get('home_state')}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString('en-IN')}</p>
        <hr style="margin: 16px 0; border-color: #e5e7eb;" />
        <h2>Recommended Colleges (${filteredResults.length})</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #eff6ff;">
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align:left;">College</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align:left;">Branch</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align:left;">State</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align:left;">Type</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align:center;">Open Rank</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align:center;">Close Rank</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align:center;">Probability</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="color: #999; font-size: 11px; margin-top: 24px;">
          Results are based on historical data and do not guarantee admission.
        </p>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500 mt-4">
          Finding colleges for you...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/dashboard">
          <Button variant="outline">Go Back</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prediction Results</h1>
          <p className="text-sm text-gray-500 mt-1">
            {examName} • Rank {searchParams.get('national_rank')} •{' '}
            {filteredResults.length} colleges found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              ← New Search
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
            📄 PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSendEmail}
            loading={sendingEmail}
            disabled={emailSent}
          >
            {emailSent ? '✓ Sent' : '📧 Email'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6" padding="sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            options={states.map((s) => ({ value: s, label: s }))}
            placeholder="All States"
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            id="filter-state"
          />
          <Select
            options={branches.map((b) => ({ value: b, label: b }))}
            placeholder="All Branches"
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            id="filter-branch"
          />
          <Select
            options={types.map((t) => ({ value: t, label: t }))}
            placeholder="All Types"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            id="filter-type"
          />
        </div>
      </Card>

      {/* Results Table */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  College
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">
                  State
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">
                  Type
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Open
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Close
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Chance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredResults.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    No colleges found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredResults.map((result, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {result.college_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {result.branch_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                      {result.state}
                    </td>
                    <td className="px-4 py-3 text-sm hidden md:table-cell">
                      <Badge variant="info">{result.college_type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700">
                      {result.opening_rank.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700">
                      {result.closing_rank.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ProbabilityBadge probability={result.probability} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
