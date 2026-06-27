const express = require('express');
const router = express.Router();

const { signup, login } = require('../controllers/authController');
const { getProfile, updateProfile, getSolves, addSolve, getFavorites, toggleFavorite } = require('../controllers/userController');
const { getLeaderboard, getPosts, createPost, likePost, getNotifications } = require('../controllers/communityController');
const { solveCube } = require('../services/cubeSolver');
const { askCoach } = require('../services/aiService');
const prisma = require('../config/db');

const { authenticateToken, authLimiter, apiLimiter, validateBody } = require('../middleware/security');

// ── AUTHENTICATION ROUTES ──
router.post('/auth/signup', authLimiter, validateBody(['email', 'password', 'username']), signup);
router.post('/auth/login', authLimiter, validateBody(['email', 'password']), login);

// ── USER PROFILE ROUTES ──
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateBody(['username', 'avatar']), updateProfile);

// ── SOLVE TRACKER ROUTES ──
router.get('/solves', authenticateToken, getSolves);
router.post('/solves', authenticateToken, validateBody(['time', 'scramble']), addSolve);

// ── FAVORITE ALGORITHMS ROUTES ──
router.get('/favorites', authenticateToken, getFavorites);
router.post('/favorites', authenticateToken, validateBody(['algoName']), toggleFavorite);

// ── SOCIAL FEED & LEADERBOARD ──
router.get('/leaderboard', getLeaderboard);
router.get('/posts', getPosts);
router.post('/posts', authenticateToken, validateBody(['text']), createPost);
router.post('/posts/:id/like', likePost);
router.get('/notifications', authenticateToken, getNotifications);

// ── CUBE SOLVING ENGINE ENDPOINT ──
router.post('/solve-cube', apiLimiter, validateBody(['state']), (req, res) => {
  const result = solveCube(req.body.state);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result);
});

// ── AI GENERATIVE TUTOR CHAT ENDPOINT ──
router.post('/ai/coach', authenticateToken, validateBody(['question']), async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
    const recentSolves = await prisma.solve.findMany({ where: { userId: req.user.id }, take: 10 });
    const response = await askCoach(req.body.question, profile, recentSolves);
    res.json({ answer: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI Coach failed to respond' });
  }
});

module.exports = router;
