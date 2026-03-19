const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const router   = express.Router();
const User     = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'geodiscovery_secret';

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ── Auth middleware ───────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'Student' } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed, role });

    const token = generateToken(user);
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, name, email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', detail: err.message });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', detail: err.message });
  }
});

// GET /api/users/profile  (protected)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch profile', detail: err.message });
  }
});

// POST /api/users/save-dataset  (protected)
router.post('/save-dataset', authMiddleware, async (req, res) => {
  try {
    const { datasetId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.savedDatasets.includes(datasetId)) {
      user.savedDatasets.push(datasetId);
      await user.save();
    }
    res.json({ message: 'Dataset saved', savedDatasets: user.savedDatasets });
  } catch (err) {
    res.status(500).json({ error: 'Could not save dataset', detail: err.message });
  }
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;