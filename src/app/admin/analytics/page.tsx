'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDateTime } from '@/lib/utils';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

interface AnalyticsData {
  searches: Array<{
    id: string;
    search_data: Record<string, unknown>;
    results_count: number;
    created_at: string;
    profiles: { name: string; email: string } | null;
  }>;
  totalSearches: number;
  dailyCounts: Record<string, number>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    const res = await fetch('/api/admin/analytics');
    const result = await res.json();
    if (result.success) setData(result.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) return <Spinner className="py-20" />;
  if (!data) return <p className="text-gray-500">Failed to load analytics</p>;

  const dailyEntries = Object.entries(data.dailyCounts).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search Analytics</h1>
        <p className="text-sm text-gray-500">
          {data.totalSearches} total searches
        </p>
      </div>

      {/* Daily Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Searches — Last 7 Days</CardTitle>
        </CardHeader>
        {dailyEntries.length === 0 ? (
          <p className="text-sm text-gray-500">No recent search activity.</p>
        ) : (
          <div className="space-y-2">
            {dailyEntries.map(([day, count]) => (
              <div key={day} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-32">{day}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (count / Math.max(...Object.values(data.dailyCounts))) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-10 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Searches */}
      <Card padding="sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Recent Searches
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Results</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.searches.map((search) => {
                const sd = search.search_data as Record<string, string | number>;
                return (
                  <tr key={search.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {search.profiles?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {sd.national_rank ? Number(sd.national_rank).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {String(sd.category || '-')}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-primary-600 font-medium">
                      {search.results_count}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDateTime(search.created_at)}
                    </td>
                  </tr>
                );
              })}
              {data.searches.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                    No search data yet
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
