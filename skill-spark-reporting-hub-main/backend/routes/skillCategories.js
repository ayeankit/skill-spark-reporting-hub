const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// User-accessible: List all skill categories
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const categoriesResult = await pool.query('SELECT * FROM skill_categories ORDER BY created_at DESC');
    res.json({ categories: categoriesResult.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// User-accessible: Get skill category by ID
router.get('/user/:id', authenticateToken, async (req, res) => {
  try {
    const categoriesResult = await pool.query('SELECT * FROM skill_categories WHERE id = $1', [req.params.id]);
    if (categoriesResult.rows.length === 0) return res.status(404).json({ message: 'Skill category not found' });
    res.json({ category: categoriesResult.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin-only: List skill categories with pagination and filtering
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;
  try {
    const categoriesResult = await pool.query(
      'SELECT * FROM skill_categories WHERE name ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [`%${search}%`, Number(limit), Number(offset)]
    );
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM skill_categories WHERE name ILIKE $1',
      [`%${search}%`]
    );
    res.json({ categories: categoriesResult.rows, total: countResult.rows[0].count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin-only: Get skill category by ID
router.get('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const categoriesResult = await pool.query('SELECT * FROM skill_categories WHERE id = $1', [req.params.id]);
    if (categoriesResult.rows.length === 0) return res.status(404).json({ message: 'Skill category not found' });
    res.json(categoriesResult.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create skill category (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), [
  body('name').notEmpty(),
  body('description').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, description } = req.body;
  try {
    await pool.query('INSERT INTO skill_categories (name, description) VALUES ($1, $2)', [name, description]);
    res.status(201).json({ message: 'Skill category created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update skill category (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), [
  body('name').optional().notEmpty(),
  body('description').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, description } = req.body;
  try {
    const categoriesResult = await pool.query('SELECT id FROM skill_categories WHERE id = $1', [req.params.id]);
    if (categoriesResult.rows.length === 0) return res.status(404).json({ message: 'Skill category not found' });
    await pool.query('UPDATE skill_categories SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3', [name, description, req.params.id]);
    res.json({ message: 'Skill category updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete skill category (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const categoriesResult = await pool.query('SELECT id FROM skill_categories WHERE id = $1', [req.params.id]);
    if (categoriesResult.rows.length === 0) return res.status(404).json({ message: 'Skill category not found' });
    await pool.query('DELETE FROM skill_categories WHERE id = $1', [req.params.id]);
    res.json({ message: 'Skill category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 