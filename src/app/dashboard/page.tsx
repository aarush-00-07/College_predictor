'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIES, GENDERS, INDIAN_STATES } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import type { Exam } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [exams, setExams] = useState<Exam[]>([]);
  const [examId, setExamId] = useState('');
  const [branchName, setBranchName] = useState('');
  const [nationalRank, setNationalRank] = useState('');
  const [stateRank, setStateRank] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [homeState, setHomeState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadExams() {
      const { data } = await supabase
        .from('exams')
        .select('*')
        .order('exam_name');
      if (data) setExams(data);
    }
    loadExams();
  }, [supabase]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!examId || !nationalRank || !category || !gender || !homeState) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        exam_id: examId,
        national_rank: nationalRank,
        category,
        gender,
        home_state: homeState,
      });
      if (branchName) params.set('branch_name', branchName);
      if (stateRank) params.set('state_rank', stateRank);

      router.push(`/dashboard/results?${params.toString()}`);
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Predict Colleges</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter your exam details to find eligible colleges
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Examination Details</CardTitle>
          <CardDescription>
            Fill in your rank and other details to get predictions
          </CardDescription>
        </CardHeader>

        <form onSubmit={handlePredict} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <Select
            label="Examination Name *"
            options={exams.map((e) => ({
              value: e.id,
              label: e.exam_name,
            }))}
            placeholder="Select examination"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            id="exam-select"
          />

          <Input
            label="Course / Branch Desired"
            type="text"
            placeholder="e.g. Computer Science (optional)"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            helperText="Leave blank to see all branches"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="National Rank *"
              type="number"
              placeholder="Enter your rank"
              value={nationalRank}
              onChange={(e) => setNationalRank(e.target.value)}
              min="1"
              required
            />

            <Input
              label="State Rank"
              type="number"
              placeholder="Optional"
              value={stateRank}
              onChange={(e) => setStateRank(e.target.value)}
              min="1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category *"
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              placeholder="Select category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              id="category-select"
            />

            <Select
              label="Gender *"
              options={GENDERS.map((g) => ({ value: g, label: g }))}
              placeholder="Select gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              id="gender-select"
            />
          </div>

          <Select
            label="Home State *"
            options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
            placeholder="Select your home state"
            value={homeState}
            onChange={(e) => setHomeState(e.target.value)}
            id="home-state-select"
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            🔍 Predict Colleges
          </Button>
        </form>
      </Card>
    </div>
  );
}
