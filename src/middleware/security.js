const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const JWT_SECRET = process.env.JWT_SECRET || 'ayu-rubiks-super-secure-jwt-secret-key';

// ── JWT AUTHENTICATION MIDDLEWARE ──
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied: Token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Access denied: Token invalid or expired' });
    }
    req.user = user;
    next();
  });
}

// ── RATE LIMITER MIDDLEWARE ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: { error: 'Too many requests. Please slow down.' }
});

// ── SCHEMATIC REQUEST VALIDATOR ──
function validateBody(schemaKeys) {
  return (req, res, next) => {
    const missing = [];
    schemaKeys.forEach(k => {
      if (req.body[k] === undefined || req.body[k] === null || req.body[k] === '') {
        missing.push(k);
      }
    });
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authLimiter,
  apiLimiter,
  validateBody
};
