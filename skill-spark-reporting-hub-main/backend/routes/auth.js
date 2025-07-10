const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { jwtSecret } = require('../config');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Register
router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password } = req.body;
  try {
    const existingResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingResult.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    // Debug log for registration
    console.log('Registering user:', { name, email, password, hashed });
    await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hashed]);
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const usersResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (usersResult.rows.length === 0) {
      console.log('Login failed: user not found for email', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = usersResult.rows[0];
    // Debug log for login
    console.log('Logging in user:', { email, password, dbPassword: user.password });
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('Login failed: password mismatch for email', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, jwtSecret, { expiresIn: '1d' });
    // Store the token in the user_tokens table
    await pool.query('INSERT INTO user_tokens (user_id, token) VALUES ($1, $2)', [user.id, token]);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// TEMPORARY DEBUG ENDPOINT: List recent users (remove after debugging!)
router.get('/debug-users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users ORDER BY id DESC LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 