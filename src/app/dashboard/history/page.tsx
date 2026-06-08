'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import type { SearchHistory, PredictionInput } from '@/types';

export default function HistoryPage() {
  const supabase = createClient();
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const { data } = await supabase
        .from('search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setHistory(data);
      setLoading(false);
    }
    loadHistory();
  }, [supabase]);

  const handleDelete = async (id: string) => {
    await supabase.from('search_history').delete().eq('id', id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const handleRerun = (searchData: PredictionInput) => {
    const params = new URLSearchParams({
      exam_id: searchData.exam_id,
      national_rank: String(searchData.national_rank),
      category: searchData.category,
      gender: searchData.gender,
      home_state: searchData.home_state,
    });
    if (searchData.branch_name) params.set('branch_name', searchData.branch_name);
    if (searchData.state_rank) params.set('state_rank', String(searchData.state_rank));
    window.location.href = `/dashboard/results?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Search History</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your recent college predictions
        </p>
      </div>

      {history.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 mb-4">No search history yet.</p>
          <a href="/dashboard">
            <Button variant="primary" size="sm">
              Make Your First Prediction
            </Button>
          </a>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const data = item.search_data as PredictionInput;
            return (
              <Card key={item.id} padding="sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">
                        Rank: {data.national_rank}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {data.category}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {data.gender}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {formatDateTime(item.created_at)}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-primary-600">
                        {item.results_count} results
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRerun(data)}
                    >
                      Re-run
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
