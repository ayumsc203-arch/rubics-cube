require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 8000;

// ── SECURITY & PLUGINS MIDDLEWARE ──
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"]
    }
  }
}));
app.use(cors());
app.use(express.json());

// ── SERVE STATIC UI WEBSITE ──
app.use(express.static(path.join(__dirname, '../public')));

// ── API ROUTES ──
app.use('/api', apiRouter);

// Fallback routing for SPA history api calls
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── SERVER LISTEN ──
app.listen(PORT, () => {
  console.log(`🚀 Solve Rubiks Cube Platform running on: http://localhost:${PORT}`);
});
