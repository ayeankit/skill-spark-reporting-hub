const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Submit quiz attempt (user)
router.post('/attempt', authenticateToken, [
  body('skill_category_id').isInt(),
  body('answers').isArray({ min: 1 }) // [{question_id, selected_option}]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { skill_category_id, answers } = req.body;
  const user_id = req.user.id;
  const started_at = new Date();
  let score = 0;
  try {
    // Fetch correct answers
    const questionIds = answers.map(a => a.question_id);
    const [questions] = await pool.query(
      `SELECT id, correct_option FROM questions WHERE id IN (${questionIds.map(() => '?').join(',')})`,
      questionIds
    );
    // Calculate score and correctness
    const answerMap = {};
    questions.forEach(q => { answerMap[q.id] = q.correct_option; });
    const results = answers.map(a => ({
      ...a,
      is_correct: answerMap[a.question_id] === a.selected_option
    }));
    score = results.filter(r => r.is_correct).length;
    // Insert attempt
    const [attemptResult] = await pool.query(
      'INSERT INTO quiz_attempts (user_id, skill_category_id, score, started_at, completed_at) VALUES (?, ?, ?, ?, ?)',
      [user_id, skill_category_id, score, started_at, new Date()]
    );
    const attempt_id = attemptResult.insertId;
    // Insert answers
    for (const r of results) {
      await pool.query(
        'INSERT INTO quiz_answers (attempt_id, question_id, selected_option, is_correct, answered_at) VALUES (?, ?, ?, ?, ?)',
        [attempt_id, r.question_id, r.selected_option, r.is_correct, new Date()]
      );
    }
    res.status(201).json({ attempt_id, score, total: results.length, results });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// List quiz attempts (user: own, admin: all) with pagination
router.get('/attempts', authenticateToken, async (req, res) => {
  const { page = 1, limit = 10, user_id, skill_category_id } = req.query;
  const offset = (page - 1) * limit;
  let where = '';
  let params = [];
  if (req.user.role === 'user') {
    where = 'WHERE user_id = ?';
    params.push(req.user.id);
  } else if (user_id) {
    where = 'WHERE user_id = ?';
    params.push(user_id);
  }
  if (skill_category_id) {
    where += (where ? ' AND ' : 'WHERE ') + 'skill_category_id = ?';
    params.push(skill_category_id);
  }
  try {
    const [attempts] = await pool.query(
      `SELECT * FROM quiz_attempts ${where} ORDER BY started_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as count FROM quiz_attempts ${where}`,
      params
    );
    res.json({ attempts, total: countRows[0].count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get answers for an attempt (user: own, admin: any)
router.get('/attempt/:id/answers', authenticateToken, async (req, res) => {
  const attempt_id = req.params.id;
  try {
    const [attempts] = await pool.query('SELECT * FROM quiz_attempts WHERE id = ?', [attempt_id]);
    if (attempts.length === 0) return res.status(404).json({ message: 'Attempt not found' });
    const attempt = attempts[0];
    if (req.user.role !== 'admin' && attempt.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const [answers] = await pool.query('SELECT * FROM quiz_answers WHERE attempt_id = ?', [attempt_id]);
    res.json({ attempt, answers });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 