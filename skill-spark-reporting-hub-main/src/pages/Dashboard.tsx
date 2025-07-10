import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Trophy,
  TrendingUp,
  Clock,
  Users,
  Target,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  // Shared state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin state
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [skillCategoriesCount, setSkillCategoriesCount] = useState(0);

  // User state
  const [userAttempts, setUserAttempts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        // Fetch users
        const usersRes = await fetch(`${API_URL}/users?limit=1`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const usersData = await usersRes.json();
        setTotalUsers(Number(usersData.total) || 0);
        // Fetch quiz attempts
        const attemptsRes = await fetch(`${API_URL}/quiz/attempts?limit=1`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const attemptsData = await attemptsRes.json();
        setTotalAttempts(Number(attemptsData.total) || 0);
        // Fetch skill categories
        const catRes = await fetch(`${API_URL}/skill-categories?limit=1`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const catData = await catRes.json();
        setSkillCategoriesCount(Number(catData.total) || (catData.categories?.length || 0));
        // Fetch user-performance report for avg score
        const reportRes = await fetch(`${API_URL}/reports/user-performance`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const reportData = await reportRes.json();
        // Calculate overall average score
        if (Array.isArray(reportData) && reportData.length > 0) {
          const scores = reportData.map((u: any) => Number(u.avg_score) || 0).filter((n: number) => !isNaN(n));
          setAvgScore(scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : null);
        } else {
          setAvgScore(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        // Fetch user's quiz attempts
        const attemptsRes = await fetch(`${API_URL}/quiz/attempts?limit=100`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const attemptsData = await attemptsRes.json();
        setUserAttempts(attemptsData.attempts || []);
        // Fetch skill categories
        const catRes = await fetch(`${API_URL}/skill-categories?limit=100`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchAdminData();
    } else if (user) {
      fetchUserData();
    }
  }, [user, API_URL]);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  // Admin Dashboard
  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your skill assessment platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-soft hover:shadow-elegant transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {/* Placeholder for growth, could be calculated if needed */}
                &nbsp;
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-elegant transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quiz Attempts</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttempts}</div>
              <p className="text-xs text-muted-foreground">&nbsp;</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-elegant transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScore !== null ? `${avgScore.toFixed(2)}%` : 'N/A'}</div>
              <p className="text-xs text-muted-foreground">&nbsp;</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-elegant transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skill Categories</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{skillCategoriesCount}</div>
              <p className="text-xs text-muted-foreground">Active categories</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your platform efficiently</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/questions">
                <Button className="w-full justify-start bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Questions
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  User Management
                </Button>
              </Link>
              <Link to="/admin/reports">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* You can enhance this by fetching recent users/attempts if needed */}
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-muted-foreground">&nbsp;</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Quiz completed</p>
                    <p className="text-xs text-muted-foreground">&nbsp;</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New question added</p>
                    <p className="text-xs text-muted-foreground">&nbsp;</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // User Dashboard
  const quizzesTaken = userAttempts.length;
  const averageScore = quizzesTaken > 0
    ? Math.round(userAttempts.reduce((acc, attempt) => acc + (attempt.score || 0), 0) / quizzesTaken)
    : 0;
  const recentAttempts = userAttempts.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">Ready to improve your skills today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-soft hover:shadow-elegant transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizzesTaken}</div>
            <p className="text-xs text-muted-foreground">
              Keep practicing!
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-elegant transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              {averageScore >= 80 ? 'Excellent!' : averageScore >= 60 ? 'Good progress' : 'Keep improving'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-elegant transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skill Areas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Available to practice
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Available Skill Categories</CardTitle>
            <CardDescription>Choose a category to start practicing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((category: any) => (
              <div key={category.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                  {/* If you want to show question count, you may need to fetch it separately */}
                </div>
                <Link to={`/quiz?category=${category.id}`}>
                  <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    Start Quiz
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Recent Quiz Results</CardTitle>
            <CardDescription>Your latest performance</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAttempts.length > 0 ? (
              <div className="space-y-3">
                {recentAttempts.map((attempt) => {
                  const category = categories.find((c: any) => c.id === attempt.skill_category_id);
                  return (
                    <div key={attempt.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <h4 className="font-medium">{category?.name || 'Unknown Category'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          attempt.score >= 80 ? 'text-success' :
                          attempt.score >= 60 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {attempt.score}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {attempt.totalQuestions || attempt.total_questions || '?'} questions
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No quiz attempts yet</p>
                <p className="text-sm text-muted-foreground">Start taking quizzes to see your progress here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;