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
  const token = localStorage.getItem('token');

  // Admin stats
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [avgScore, setAvgScore] = useState<number>(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User stats
  const [userAttempts, setUserAttempts] = useState<any[]>([]);
  const [userCategories, setUserCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch users
        const usersRes = await fetch(`${API_URL}/users`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const usersData = await usersRes.json();
        setTotalUsers(usersData.users ? usersData.users.length : 0);

        // Fetch skill categories
        const catRes = await fetch(`${API_URL}/skill-categories`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const catData = await catRes.json();
        setCategories(catData.categories || []);

        // Fetch quiz attempts (admin summary)
        const reportRes = await fetch(`${API_URL}/reports/user-performance`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const reportData = await reportRes.json();
        // Calculate total attempts and avg score
        let attempts = 0;
        let scoreSum = 0;
        let scoreCount = 0;
        if (Array.isArray(reportData)) {
          reportData.forEach((row: any) => {
            attempts += Number(row.total_attempts || 0);
            if (row.avg_score !== null) {
              scoreSum += Number(row.avg_score);
              scoreCount++;
            }
          });
        }
        setTotalAttempts(attempts);
        setAvgScore(scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user's quiz attempts
        const attemptsRes = await fetch(`${API_URL}/quiz/attempts`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const attemptsData = await attemptsRes.json();
        setUserAttempts(attemptsData.attempts || []);

        // Fetch skill categories
        const catRes = await fetch(`${API_URL}/skill-categories`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const catData = await catRes.json();
        setUserCategories(catData.categories || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchAdminStats();
    } else if (user) {
      fetchUserStats();
    }
    // eslint-disable-next-line
  }, [user]);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

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
                Real-time count
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
              <p className="text-xs text-muted-foreground">
                Real-time count
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-elegant transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScore}%</div>
              <p className="text-xs text-muted-foreground">
                Real-time average
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-elegant transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skill Categories</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">
                Active categories
              </p>
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
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-muted-foreground">(Real-time data not implemented)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Quiz completed</p>
                    <p className="text-xs text-muted-foreground">(Real-time data not implemented)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New question added</p>
                    <p className="text-xs text-muted-foreground">(Real-time data not implemented)</p>
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
    ? Math.round(userAttempts.reduce((acc, attempt) => acc + attempt.score, 0) / quizzesTaken)
    : 0;

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
            <div className="text-2xl font-bold">{userCategories.length}</div>
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
            {userCategories.map((category: any) => (
              <div key={category.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                  {/* <p className="text-xs text-muted-foreground mt-1">{category.questionCount} questions</p> */}
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
            {userAttempts.length > 0 ? (
              <div className="space-y-3">
                {userAttempts.slice(-3).reverse().map((attempt: any) => {
                  const category = userCategories.find((c: any) => c.id === attempt.skill_category_id);
                  return (
                    <div key={attempt.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <h4 className="font-medium">{category?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(attempt.completed_at).toLocaleDateString()}
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
                          {attempt.total_questions || attempt.totalQuestions || '?'} questions
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