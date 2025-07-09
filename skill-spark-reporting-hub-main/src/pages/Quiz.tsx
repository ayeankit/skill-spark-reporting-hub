import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockSkillCategories, mockQuestions } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Question, QuestionResult, QuizAttempt } from '@/types';
import { Clock, CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const Quiz = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const categoryId = searchParams.get('category');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<QuizAttempt | null>(null);

  const category = mockSkillCategories.find(c => c.id === categoryId);
  const questions = mockQuestions.filter(q => q.skillCategoryId === categoryId);

  useEffect(() => {
    if (!category || !questions.length) {
      navigate('/dashboard');
      return;
    }
  }, [category, questions, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmit = () => {
    const questionResults: QuestionResult[] = questions.map((question, index) => {
      const selectedAnswer = selectedAnswers[index];
      const isCorrect = selectedAnswer === question.correctAnswer;
      
      return {
        questionId: question.id,
        selectedAnswer: selectedAnswer ?? -1,
        isCorrect,
        timeSpent: Math.floor(Math.random() * 60) + 30 // Mock time spent
      };
    });

    const correctAnswers = questionResults.filter(r => r.isCorrect).length;
    const score = Math.round((correctAnswers / questions.length) * 100);

    const quizResult: QuizAttempt = {
      id: Date.now().toString(),
      userId: user?.id || '',
      skillCategoryId: categoryId || '',
      questions: questionResults,
      score,
      totalQuestions: questions.length,
      completedAt: new Date().toISOString(),
      timeSpent
    };

    setResults(quizResult);
    setIsCompleted(true);

    toast({
      title: 'Quiz Completed!',
      description: `You scored ${score}% (${correctAnswers}/${questions.length})`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!category || !questions.length) {
    return <div>Loading...</div>;
  }

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
              You answered {results.questions.filter(q => q.isCorrect).length} out of {results.totalQuestions} questions correctly
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                  <div className="text-2xl font-bold text-success">
                    {results.questions.filter(q => q.isCorrect).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <div className="text-2xl font-bold text-destructive">
                    {results.questions.filter(q => !q.isCorrect).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {formatTime(results.timeSpent)}
                  </div>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Question Review</h3>
              {questions.map((question, index) => {
                const result = results.questions[index];
                const isCorrect = result.isCorrect;
                
                return (
                  <Card key={question.id} className={`border-l-4 ${
                    isCorrect ? 'border-l-success' : 'border-l-destructive'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium mb-2">{question.question}</p>
                          <div className="space-y-1">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`p-2 rounded text-sm ${
                                  optionIndex === question.correctAnswer
                                    ? 'bg-success/10 text-success border border-success/20'
                                    : optionIndex === result.selectedAnswer && !isCorrect
                                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                    : 'bg-muted/50'
                                }`}
                              >
                                {option}
                                {optionIndex === question.correctAnswer && (
                                  <span className="ml-2 text-xs">(Correct)</span>
                                )}
                                {optionIndex === result.selectedAnswer && optionIndex !== question.correctAnswer && (
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
          <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              currentQuestion.difficulty === 'easy' ? 'bg-success/10 text-success' :
              currentQuestion.difficulty === 'medium' ? 'bg-warning/10 text-warning' :
              'bg-destructive/10 text-destructive'
            }`}>
              {currentQuestion.difficulty}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
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