const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

const router = express.Router();

// 1. User-wise performance report
router.get('/user-performance', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id as user_id, u.name, u.email, u.role,
        COUNT(qa.id) as total_attempts,
        AVG(qa.score) as avg_score
      FROM users u
      LEFT JOIN quiz_attempts qa ON qa.user_id = u.id
      GROUP BY u.id
      ORDER BY avg_score DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 2. Skill gap report (average score per skill)
router.get('/skill-gap', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sc.id as skill_category_id, sc.name as skill_name,
        COUNT(qa.id) as total_attempts,
        AVG(qa.score) as avg_score
      FROM skill_categories sc
      LEFT JOIN quiz_attempts qa ON qa.skill_category_id = sc.id
      GROUP BY sc.id
      ORDER BY avg_score ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 3. Time-based performance (week/month filter)
router.get('/time-performance', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { period = 'week' } = req.query; // 'week' or 'month'
  let groupBy, dateFormat;
  if (period === 'month') {
    groupBy = `DATE_TRUNC('month', qa.completed_at)`;
    dateFormat = 'YYYY-MM';
  } else {
    groupBy = `DATE_TRUNC('week', qa.completed_at)`;
    dateFormat = 'IYYY-IW'; // ISO week
  }
  try {
    const result = await pool.query(`
      SELECT TO_CHAR(${groupBy}, $1) as period,
        COUNT(qa.id) as total_attempts,
        AVG(qa.score) as avg_score
      FROM quiz_attempts qa
      WHERE qa.completed_at IS NOT NULL
      GROUP BY ${groupBy}
      ORDER BY period DESC
    `, [dateFormat]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/', (req, res) => {
  res.json({
    message: 'Available report endpoints',
    endpoints: [
      '/api/reports/user-performance',
      '/api/reports/skill-gap',
      '/api/reports/time-performance'
    ]
  });
});

module.exports = router; 