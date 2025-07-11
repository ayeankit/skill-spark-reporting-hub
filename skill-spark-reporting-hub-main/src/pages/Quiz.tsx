import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const Quiz = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const categoryId = searchParams.get('category');
  const [category, setCategory] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New: For showing categories if no category is selected
  const [userCategories, setUserCategories] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  // Fetch categories if no category is selected
  useEffect(() => {
    if (!categoryId && user) {
      setCatLoading(true);
      setCatError(null);
      fetch(`${API_URL}/skill-categories/user`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(data => {
          setUserCategories(data.categories || []);
        })
        .catch(err => {
          setCatError('Failed to fetch categories');
        })
        .finally(() => setCatLoading(false));
    }
  }, [categoryId, user, API_URL, token]);

  // Fetch category and questions from backend
  useEffect(() => {
    if (!categoryId) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token provided. Please log in again.');
        setLoading(false);
        return;
      }
      try {
        // Fetch category (user endpoint)
        const catRes = await fetch(`${API_URL}/skill-categories/user/${categoryId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!catRes.ok) throw new Error('Failed to fetch category');
        const catData = await catRes.json();
        setCategory(catData.category);

        // Fetch questions for this category (user endpoint)
        const qRes = await fetch(`${API_URL}/questions/user?skill_category_id=${categoryId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!qRes.ok) throw new Error('Failed to fetch questions');
        const qData = await qRes.json();
        setQuestions(qData.questions || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId, API_URL]);

  useEffect(() => {
    if (!loading && (!category || !questions.length)) {
      navigate('/dashboard');
    }
  }, [category, questions, loading, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (!isCompleted) {
      timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCompleted]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user || !categoryId) return;
    setLoading(true);
    setError(null);
    try {
      // Prepare answers for backend
      const answers = questions.map((q, idx) => ({
        question_id: q.id,
        selected_option: selectedAnswers[idx]
      }));
      const res = await fetch(`${API_URL}/quiz/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          skill_category_id: categoryId,
          answers
        })
      });
      if (!res.ok) {
        let errorMsg = 'Failed to submit quiz';
        try {
          const text = await res.text();
          if (text) {
            const data = JSON.parse(text);
            errorMsg = data.message || JSON.stringify(data);
          }
        } catch {}
        throw new Error(errorMsg);
      }
      const data = await res.json();
      setResults({
        score: Math.round((data.score / data.total) * 100),
        correct: data.score,
        total: data.total,
        results: data.results
      });
      setIsCompleted(true); // This will stop the timer
      toast({
        title: 'Quiz Completed!',
        description: `You scored ${Math.round((data.score / data.total) * 100)}% (${data.score}/${data.total})`,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If no category is selected, show categories card
  if (!categoryId) {
    if (catLoading) return <div className="p-6">Loading categories...</div>;
    if (catError) return <div className="p-6 text-red-500">{catError}</div>;
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Available Skill Categories</h1>
        <p className="text-muted-foreground mb-6">Choose a category to start practicing</p>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Available Skill Categories</CardTitle>
            <CardDescription>Choose a category to start practicing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userCategories.length === 0 && (
              <div className="text-muted-foreground">No categories available.</div>
            )}
            {userCategories.map((category: any) => (
              <div key={category.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <Button asChild size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <a href={`/quiz?category=${category.id}`}>Start Quiz</a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading quiz...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!category || !questions.length) return <div>Loading...</div>;

  if (isCompleted && results) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
            <div className="flex justify-center">
              <div className={`text-6xl font-bold ${
                results.score >= 80 ? 'text-success' :
                results.score >= 60 ? 'text-warning' : 'text-destructive'
              }`}>
                {results.score}%
              </div>
            </div>
            <p className="text-muted-foreground">
              You answered {results.correct} out of {results.total} questions correctly
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                  <div className="text-2xl font-bold text-success">
                    {results.correct}
                  </div>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <div className="text-2xl font-bold text-destructive">
                    {results.total - results.correct}
                  </div>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {formatTime(timeSpent)}
                  </div>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Question Review</h3>
              {questions.map((question, index) => {
                const result = results.results[index];
                const isCorrect = result.is_correct;
                return (
                  <Card key={question.id} className={`border-l-4 ${
                    isCorrect ? 'border-l-success' : 'border-l-destructive'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium mb-2">{question.question_text}</p>
                          <div className="space-y-1">
                            {question.options.map((option: string, optionIndex: number) => (
                              <div
                                key={optionIndex}
                                className={`p-2 rounded text-sm ${
                                  optionIndex === question.correct_option
                                    ? 'bg-success/10 text-success border border-success/20'
                                    : optionIndex === result.selected_option && !isCorrect
                                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                    : 'bg-muted/50'
                                }`}
                              >
                                {option}
                                {optionIndex === question.correct_option && (
                                  <span className="ml-2 text-xs">(Correct)</span>
                                )}
                                {optionIndex === result.selected_option && optionIndex !== question.correct_option && (
                                  <span className="ml-2 text-xs">(Your answer)</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="ml-4">
                          {isCorrect ? (
                            <CheckCircle className="h-6 w-6 text-success" />
                          ) : (
                            <XCircle className="h-6 w-6 text-destructive" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={() => navigate('/dashboard')} className="flex-1">
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="flex-1"
              >
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const selectedAnswer = selectedAnswers[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="text-muted-foreground">{category.description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatTime(timeSpent)}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      {/* Question Card */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question_text}</CardTitle>
          <div className="flex items-center space-x-2">
            {/* Optionally show difficulty if available */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === index
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === index
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {selectedAnswer === index && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-3">
          {currentQuestionIndex === questions.length - 1 ? (
            <Button 
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== questions.length}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={selectedAnswer === undefined}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;