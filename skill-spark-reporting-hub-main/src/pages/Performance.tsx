import React, { useEffect, useState } from 'react';
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

  // Compute average score per category
  const categoryScores: { [catId: number]: { total: number, count: number } } = {};
  attempts.forEach(a => {
    if (!categoryScores[a.skill_category_id]) categoryScores[a.skill_category_id] = { total: 0, count: 0 };
    categoryScores[a.skill_category_id].total += a.score;
    categoryScores[a.skill_category_id].count += 1;
  });
  const chartData = categories.map((cat: any) => ({
    label: cat.name.length > 8 ? cat.name.slice(0, 8) + '…' : cat.name,
    value: categoryScores[cat.id]?.count ? Math.round(categoryScores[cat.id].total / categoryScores[cat.id].count * 100 / 100) : 0
  }));

  // Prepare data for line chart: each attempt as a point
  const lineChartData = attempts.map(a => {
    const cat = categories.find((c: any) => c.id === a.skill_category_id);
    return {
      date: a.completed_at ? new Date(a.completed_at).toLocaleDateString() : '',
      category: cat ? cat.name : 'Unknown',
      score: a.score,
      totalQuestions: a.total_questions || a.totalQuestions || '?',
    };
  });

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