import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

// Simple bar chart using SVG (no external lib for now)
const BarChart = ({ data, maxScore = 100 }: { data: { label: string, value: number }[], maxScore?: number }) => {
  const barWidth = 40;
  const barGap = 24;
  const chartHeight = 180;
  return (
    <svg width={data.length * (barWidth + barGap)} height={chartHeight + 40}>
      {data.map((d, i) => {
        const barHeight = (d.value / maxScore) * chartHeight;
        return (
          <g key={d.label}>
            <rect
              x={i * (barWidth + barGap)}
              y={chartHeight - barHeight}
              width={barWidth}
              height={barHeight}
              fill="#6366f1"
              rx={6}
            />
            <text
              x={i * (barWidth + barGap) + barWidth / 2}
              y={chartHeight + 18}
              textAnchor="middle"
              fontSize={14}
              fill="#444"
            >
              {d.label}
            </text>
            <text
              x={i * (barWidth + barGap) + barWidth / 2}
              y={chartHeight - barHeight - 8}
              textAnchor="middle"
              fontSize={13}
              fill="#6366f1"
              fontWeight={600}
            >
              {d.value}%
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const Performance: React.FC = () => {
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const [attempts, setAttempts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Time filter state
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch quiz attempts
        const attemptsRes = await fetch(`${API_URL}/quiz/attempts`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const attemptsData = await attemptsRes.json();
        setAttempts(attemptsData.attempts || []);
        // Fetch skill categories
        const catRes = await fetch(`${API_URL}/skill-categories/user`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL, token]);

  // Helper to filter attempts by time
  const filteredAttempts = useMemo(() => {
    if (timeFilter === 'all') return attempts;
    const now = new Date();
    return attempts.filter(a => {
      if (!a.completed_at) return false;
      const date = new Date(a.completed_at);
      if (timeFilter === 'week') {
        // Last 7 days
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo && date <= now;
      } else if (timeFilter === 'month') {
        // This month
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [attempts, timeFilter]);

  // Compute average score per category
  const categoryScores: { [catId: number]: { total: number, count: number } } = {};
  filteredAttempts.forEach(a => {
    if (!categoryScores[a.skill_category_id]) categoryScores[a.skill_category_id] = { total: 0, count: 0 };
    categoryScores[a.skill_category_id].total += a.score;
    categoryScores[a.skill_category_id].count += 1;
  });
  const chartData = categories.map((cat: any) => ({
    label: cat.name.length > 8 ? cat.name.slice(0, 8) + '…' : cat.name,
    value: categoryScores[cat.id]?.count ? Math.round(categoryScores[cat.id].total / categoryScores[cat.id].count * 100 / 100) : 0
  }));

  // Prepare data for line chart: each attempt as a point
  const lineChartData = filteredAttempts.map(a => {
    const cat = categories.find((c: any) => c.id === a.skill_category_id);
    return {
      date: a.completed_at ? new Date(a.completed_at).toLocaleDateString() : '',
      category: cat ? cat.name : 'Unknown',
      score: a.score,
      totalQuestions: a.total_questions || a.totalQuestions || '?',
      user: a.user_name || a.user || '',
      userId: a.user_id || '',
    };
  });

  // Compute average score per category (for skill gap)
  const skillAverages = useMemo(() => {
    const map: { [catId: number]: { total: number, count: number } } = {};
    filteredAttempts.forEach(a => {
      if (!map[a.skill_category_id]) map[a.skill_category_id] = { total: 0, count: 0 };
      map[a.skill_category_id].total += a.score;
      map[a.skill_category_id].count += 1;
    });
    return categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      avg: map[cat.id]?.count ? Math.round(map[cat.id].total / map[cat.id].count) : 0,
    }));
  }, [filteredAttempts, categories]);

  // For admin: user-wise performance (avg score per user)
  const userAverages = useMemo(() => {
    const map: { [userId: string]: { total: number, count: number, name: string } } = {};
    filteredAttempts.forEach(a => {
      const uid = a.user_id || a.user || 'Unknown';
      if (!map[uid]) map[uid] = { total: 0, count: 0, name: a.user_name || a.user || 'Unknown' };
      map[uid].total += a.score;
      map[uid].count += 1;
    });
    return Object.entries(map).map(([id, v]) => ({ id, name: v.name, avg: v.count ? Math.round(v.total / v.count) : 0 }));
  }, [filteredAttempts]);

  // Skill gap: skills with avg < 60
  const skillGaps = skillAverages.filter(s => s.avg < 60);

  // Find strong and weak areas
  const scoredCats = chartData.filter(d => d.value > 0);
  const strong = scoredCats.length ? scoredCats.reduce((a, b) => (a.value > b.value ? a : b)) : null;
  const weak = scoredCats.length ? scoredCats.reduce((a, b) => (a.value < b.value ? a : b)) : null;

  if (loading) return <div className="p-6">Loading performance...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">My Performance</h1>
        <p className="text-muted-foreground">Track your progress and identify areas for improvement</p>
      </div>
      {/* Time filter */}
      <div className="flex gap-2 mb-4">
        <Button variant={timeFilter === 'all' ? 'default' : 'outline'} onClick={() => setTimeFilter('all')}>All</Button>
        <Button variant={timeFilter === 'week' ? 'default' : 'outline'} onClick={() => setTimeFilter('week')}>This Week</Button>
        <Button variant={timeFilter === 'month' ? 'default' : 'outline'} onClick={() => setTimeFilter('month')}>This Month</Button>
      </div>
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Quiz Performance Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lineChartData.length > 0 ? (
            <div className="overflow-x-auto">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">No quiz attempts yet. Take a quiz to see your performance!</div>
          )}
        </CardContent>
      </Card>
      {/* Show every quiz attempt in a table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Quiz Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          {lineChartData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left">Date</th>
                    <th className="px-2 py-1 text-left">Category</th>
                    <th className="px-2 py-1 text-left">Score</th>
                    <th className="px-2 py-1 text-left">Questions</th>
                  </tr>
                </thead>
                <tbody>
                  {lineChartData.map((row, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="px-2 py-1">{row.date}</td>
                      <td className="px-2 py-1">{row.category}</td>
                      <td className="px-2 py-1">{row.score}%</td>
                      <td className="px-2 py-1">{row.totalQuestions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted-foreground py-4 text-center">No quiz attempts yet.</div>
          )}
        </CardContent>
      </Card>
      {/* Admin: user-wise performance */}
      {user?.role === 'admin' && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">User-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {userAverages.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left">User</th>
                      <th className="px-2 py-1 text-left">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAverages.map((row, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="px-2 py-1">{row.name}</td>
                        <td className="px-2 py-1">{row.avg}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-muted-foreground py-4 text-center">No user data for this period.</div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Skill gap identification */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Skill Gap Identification</CardTitle>
        </CardHeader>
        <CardContent>
          {skillAverages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left">Skill</th>
                    <th className="px-2 py-1 text-left">Avg Score</th>
                    {user?.role === 'admin' && <th className="px-2 py-1 text-left">Users Below 60%</th>}
                  </tr>
                </thead>
                <tbody>
                  {skillAverages.map((row, idx) => (
                    <tr key={idx} className={row.avg < 60 ? 'bg-red-50' : ''}>
                      <td className="px-2 py-1">{row.name}</td>
                      <td className="px-2 py-1">{row.avg}%</td>
                      {user?.role === 'admin' && (
                        <td className="px-2 py-1">{
                          filteredAttempts.filter(a => a.skill_category_id === row.id && a.score < 60).length
                        }</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted-foreground py-4 text-center">No skill data for this period.</div>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" /> Strongest Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strong ? (
              <div>
                <div className="text-xl font-bold">{strong.label}</div>
                <div className="text-lg">Avg Score: <span className="font-semibold">{strong.value}%</span></div>
                <div className="text-sm text-muted-foreground mt-2">Keep up the good work in this area!</div>
              </div>
            ) : (
              <div className="text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <TrendingDown className="h-5 w-5" /> Weakest Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weak ? (
              <div>
                <div className="text-xl font-bold">{weak.label}</div>
                <div className="text-lg">Avg Score: <span className="font-semibold">{weak.value}%</span></div>
                <div className="text-sm text-muted-foreground mt-2">Focus on practicing this skill to improve!</div>
              </div>
            ) : (
              <div className="text-muted-foreground">No data yet</div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end">
        <Link to="/quiz">
          <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">Take Another Quiz</Button>
        </Link>
      </div>
    </div>
  );
};

export default Performance; 