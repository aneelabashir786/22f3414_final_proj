const express = require('express');
const path = require('path');
const app = express();

// Load environment variables first
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
const connectDB = require('./config/db');
connectDB();

// Middleware
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder (go up a level)
app.use(express.static(path.join(__dirname, '../public')));

// View engine setup (optional, only if using EJS views)
app.set('view engine', 'ejs');

// Rate limiting (optional)
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Session middleware (required for cart functionality)
const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Routes - IMPORTANT: Initialize routes before using them
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/authRoutes');
// const bookRoutes = require('./routes/bookRoutes');
// const bookSearchRoutes = require('./routes/bookSearchRoutes');

// Route middlewares
app.use('/', indexRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/search', apiLimiter, bookSearchRoutes);

// Error handling middleware (add at the end)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler (catch-all route)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is already in use. Trying another port...`);
      app.listen(0); // Use any available port
    } else {
      console.error('Server error:', err);
    }
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection at: ${promise}, reason: ${err}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;