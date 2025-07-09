import { User, SkillCategory, Question, QuizAttempt, UserPerformance } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@skillportal.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'user',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'user',
    createdAt: '2024-02-01T00:00:00Z'
  }
];

export const mockSkillCategories: SkillCategory[] = [
  {
    id: '1',
    name: 'JavaScript Fundamentals',
    description: 'Basic JavaScript concepts, syntax, and programming principles',
    questionCount: 15
  },
  {
    id: '2',
    name: 'React Development',
    description: 'React components, hooks, state management, and best practices',
    questionCount: 12
  },
  {
    id: '3',
    name: 'Node.js Backend',
    description: 'Server-side JavaScript, APIs, databases, and backend architecture',
    questionCount: 10
  },
  {
    id: '4',
    name: 'Database Design',
    description: 'SQL, NoSQL, database modeling, and optimization techniques',
    questionCount: 8
  }
];

export const mockQuestions: Question[] = [
  // JavaScript Fundamentals
  {
    id: '1',
    skillCategoryId: '1',
    question: 'What is the correct way to declare a variable in JavaScript?',
    options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
    correctAnswer: 0,
    difficulty: 'easy'
  },
  {
    id: '2',
    skillCategoryId: '1',
    question: 'Which method is used to add an element to the end of an array?',
    options: ['append()', 'push()', 'add()', 'insert()'],
    correctAnswer: 1,
    difficulty: 'easy'
  },
  {
    id: '3',
    skillCategoryId: '1',
    question: 'What does "=== " operator do in JavaScript?',
    options: ['Assignment', 'Equality with type conversion', 'Strict equality', 'Not equal'],
    correctAnswer: 2,
    difficulty: 'medium'
  },
  // React Development
  {
    id: '4',
    skillCategoryId: '2',
    question: 'What is the correct way to create a functional component in React?',
    options: [
      'function MyComponent() { return <div>Hello</div>; }',
      'class MyComponent() { return <div>Hello</div>; }',
      'component MyComponent() { return <div>Hello</div>; }',
      'react MyComponent() { return <div>Hello</div>; }'
    ],
    correctAnswer: 0,
    difficulty: 'easy'
  },
  {
    id: '5',
    skillCategoryId: '2',
    question: 'Which hook is used to manage state in functional components?',
    options: ['useEffect', 'useState', 'useContext', 'useReducer'],
    correctAnswer: 1,
    difficulty: 'easy'
  }
];

export const mockQuizAttempts: QuizAttempt[] = [
  {
    id: '1',
    userId: '2',
    skillCategoryId: '1',
    questions: [
      { questionId: '1', selectedAnswer: 0, isCorrect: true, timeSpent: 45 },
      { questionId: '2', selectedAnswer: 1, isCorrect: true, timeSpent: 30 },
      { questionId: '3', selectedAnswer: 1, isCorrect: false, timeSpent: 60 }
    ],
    score: 67,
    totalQuestions: 3,
    completedAt: '2024-03-01T10:00:00Z',
    timeSpent: 135
  },
  {
    id: '2',
    userId: '3',
    skillCategoryId: '2',
    questions: [
      { questionId: '4', selectedAnswer: 0, isCorrect: true, timeSpent: 40 },
      { questionId: '5', selectedAnswer: 1, isCorrect: true, timeSpent: 25 }
    ],
    score: 100,
    totalQuestions: 2,
    completedAt: '2024-03-02T14:30:00Z',
    timeSpent: 65
  }
];

export const mockUserPerformance: UserPerformance[] = [
  {
    userId: '2',
    userName: 'John Doe',
    skillCategory: 'JavaScript Fundamentals',
    averageScore: 67,
    totalAttempts: 1,
    lastAttempt: '2024-03-01T10:00:00Z',
    skillGap: 'medium'
  },
  {
    userId: '3',
    userName: 'Jane Smith',
    skillCategory: 'React Development',
    averageScore: 100,
    totalAttempts: 1,
    lastAttempt: '2024-03-02T14:30:00Z',
    skillGap: 'low'
  }
];