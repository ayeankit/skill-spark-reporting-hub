const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// List skill categories with pagination and filtering (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;
  try {
    const [categories] = await pool.query(
      'SELECT * FROM skill_categories WHERE name LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [`%${search}%`, Number(limit), Number(offset)]
    );
    const [countRows] = await pool.query(
      'SELECT COUNT(*) as count FROM skill_categories WHERE name LIKE ?',
      [`%${search}%`]
    );
    res.json({ categories, total: countRows[0].count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get skill category by ID (admin only)
router.get('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM skill_categories WHERE id = ?', [req.params.id]);
    if (categories.length === 0) return res.status(404).json({ message: 'Skill category not found' });
    res.json(categories[0]);
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
    await pool.query('INSERT INTO skill_categories (name, description) VALUES (?, ?)', [name, description]);
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
    const [categories] = await pool.query('SELECT id FROM skill_categories WHERE id = ?', [req.params.id]);
    if (categories.length === 0) return res.status(404).json({ message: 'Skill category not found' });
    await pool.query('UPDATE skill_categories SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?', [name, description, req.params.id]);
    res.json({ message: 'Skill category updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete skill category (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT id FROM skill_categories WHERE id = ?', [req.params.id]);
    if (categories.length === 0) return res.status(404).json({ message: 'Skill category not found' });
    await pool.query('DELETE FROM skill_categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Skill category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 