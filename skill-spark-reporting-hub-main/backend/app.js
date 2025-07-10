const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const skillCategoriesRoutes = require('./routes/skillCategories');
const questionsRoutes = require('./routes/questions');
const quizRoutes = require('./routes/quiz');
const reportsRoutes = require('./routes/reports');

const corsOptions = {
  origin: ['https://skill-spark-reporting-hub.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/skill-categories', skillCategoriesRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app; 