'use client';

import { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import FileUpload from '@/components/ui/FileUpload';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import type { ImportResult } from '@/types';

interface CutoffRow {
  id: string;
  opening_rank: number;
  closing_rank: number;
  category: string;
  gender: string;
  year: number;
  exams: { exam_name: string };
  colleges: { college_name: string };
  branches: { branch_name: string };
}

export default function AdminCutoffsPage() {
  const [cutoffs, setCutoffs] = useState<CutoffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const fetchCutoffs = useCallback(async () => {
    const res = await fetch('/api/admin/cutoffs');
    const data = await res.json();
    if (data.success) setCutoffs(data.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCutoffs();
  }, [fetchCutoffs]);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/cutoffs/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImportResult(data.data);
        fetchCutoffs();
      } else {
        alert(data.error);
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cutoff record?')) return;
    await fetch(`/api/admin/cutoffs?id=${id}`, { method: 'DELETE' });
    fetchCutoffs();
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cutoff Data</h1>
        <p className="text-sm text-gray-500">{cutoffs.length} records loaded</p>
      </div>

      {/* Import Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bulk Import</CardTitle>
          <CardDescription>
            Upload CSV or Excel file with columns: exam_name, college_name,
            branch_name, category, gender, home_state, opening_rank, closing_rank, year
          </CardDescription>
        </CardHeader>
        <FileUpload
          onFileSelect={handleFileUpload}
          label=""
          helperText="CSV (.csv) or Excel (.xlsx, .xls) files"
        />
        {uploading && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Spinner size="sm" /> Processing file...
          </div>
        )}
        {importResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex items-center gap-4 text-sm">
              <span>Total: <strong>{importResult.total}</strong></span>
              <Badge variant="success">✓ {importResult.success} imported</Badge>
              {importResult.failed > 0 && (
                <Badge variant="danger">✗ {importResult.failed} failed</Badge>
              )}
            </div>
            {importResult.errors.length > 0 && (
              <ul className="mt-2 text-xs text-red-600 space-y-1 max-h-40 overflow-y-auto">
                {importResult.errors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>

      {/* Cutoffs Table */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Exam</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">College</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Branch</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cat.</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Open</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Close</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Year</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cutoffs.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-xs text-gray-700">{c.exams?.exam_name}</td>
                  <td className="px-3 py-2 text-xs text-gray-900 font-medium">{c.colleges?.college_name}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{c.branches?.branch_name}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{c.category}</td>
                  <td className="px-3 py-2 text-xs text-gray-700 text-center">{c.opening_rank.toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs text-gray-700 text-center">{c.closing_rank.toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs text-gray-500 text-center">{c.year}</td>
                  <td className="px-3 py-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}>
                      ✕
                    </Button>
                  </td>
                </tr>
              ))}
              {cutoffs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                    No cutoff data. Upload a CSV/Excel file to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
