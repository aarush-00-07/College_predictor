import { createServerSupabaseClient } from '@/lib/supabase/server';
import Card, { CardTitle } from '@/components/ui/Card';

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient();

  const [
    { count: collegeCount },
    { count: branchCount },
    { count: examCount },
    { count: cutoffCount },
    { count: studentCount },
    { count: searchCount },
    { count: emailCount },
  ] = await Promise.all([
    supabase.from('colleges').select('*', { count: 'exact', head: true }),
    supabase.from('branches').select('*', { count: 'exact', head: true }),
    supabase.from('exams').select('*', { count: 'exact', head: true }),
    supabase.from('cutoffs').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student'),
    supabase.from('search_history').select('*', { count: 'exact', head: true }),
    supabase.from('email_logs').select('*', { count: 'exact', head: true }),
  ]);

  const stats = [
    { label: 'Colleges', value: collegeCount ?? 0, icon: '🏫' },
    { label: 'Branches', value: branchCount ?? 0, icon: '📚' },
    { label: 'Exams', value: examCount ?? 0, icon: '📝' },
    { label: 'Cutoff Records', value: cutoffCount ?? 0, icon: '📈' },
    { label: 'Students', value: studentCount ?? 0, icon: '👨‍🎓' },
    { label: 'Total Searches', value: searchCount ?? 0, icon: '🔍' },
    { label: 'Emails Sent', value: emailCount ?? 0, icon: '📧' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome to the admin panel
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} padding="md">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
