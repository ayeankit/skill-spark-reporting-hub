const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// List questions with pagination and filtering (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { page = 1, limit = 10, search = '', skill_category_id } = req.query;
  const offset = (page - 1) * limit;
  let where = 'WHERE question_text ILIKE $1';
  let params = [`%${search}%`];
  let paramIdx = 2;
  if (skill_category_id) {
    where += ` AND skill_category_id = $${paramIdx}`;
    params.push(skill_category_id);
    paramIdx++;
  }
  try {
    const questionsResult = await pool.query(
      `SELECT * FROM questions ${where} ORDER BY created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, Number(limit), Number(offset)]
    );
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM questions ${where}`,
      params
    );
    res.json({ questions: questionsResult.rows, total: countResult.rows[0].count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get question by ID (admin only)
router.get('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const questionsResult = await pool.query('SELECT * FROM questions WHERE id = $1', [req.params.id]);
    if (questionsResult.rows.length === 0) return res.status(404).json({ message: 'Question not found' });
    res.json(questionsResult.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create question (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), [
  body('skill_category_id').isInt(),
  body('question_text').notEmpty(),
  body('options').isArray({ min: 2 }),
  body('correct_option').isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { skill_category_id, question_text, options, correct_option } = req.body;
  try {
    await pool.query(
      'INSERT INTO questions (skill_category_id, question_text, options, correct_option) VALUES ($1, $2, $3, $4)',
      [skill_category_id, question_text, JSON.stringify(options), correct_option]
    );
    res.status(201).json({ message: 'Question created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update question (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), [
  body('skill_category_id').optional().isInt(),
  body('question_text').optional().notEmpty(),
  body('options').optional().isArray({ min: 2 }),
  body('correct_option').optional().isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { skill_category_id, question_text, options, correct_option } = req.body;
  try {
    const questionsResult = await pool.query('SELECT id FROM questions WHERE id = $1', [req.params.id]);
    if (questionsResult.rows.length === 0) return res.status(404).json({ message: 'Question not found' });
    await pool.query(
      'UPDATE questions SET skill_category_id = COALESCE($1, skill_category_id), question_text = COALESCE($2, question_text), options = COALESCE($3, options), correct_option = COALESCE($4, correct_option) WHERE id = $5',
      [skill_category_id, question_text, options ? JSON.stringify(options) : undefined, correct_option, req.params.id]
    );
    res.json({ message: 'Question updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete question (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const questionsResult = await pool.query('SELECT id FROM questions WHERE id = $1', [req.params.id]);
    if (questionsResult.rows.length === 0) return res.status(404).json({ message: 'Question not found' });
    await pool.query('DELETE FROM questions WHERE id = $1', [req.params.id]);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// User-accessible: Get questions for a skill category
router.get('/user', authenticateToken, async (req, res) => {
  const { skill_category_id } = req.query;
  if (!skill_category_id) {
    return res.status(400).json({ message: 'Missing skill_category_id' });
  }
  try {
    const questionsResult = await pool.query(
      'SELECT * FROM questions WHERE skill_category_id = $1 ORDER BY created_at DESC',
      [skill_category_id]
    );
    res.json({ questions: questionsResult.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 