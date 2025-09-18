require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const requestLogger = require('./middleware/requestLogger');
const { startReminderScheduler } = require('./reminderScheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json({}));
app.use(requestLogger);
app.use(morgan('tiny'));

// --- Connect to MongoDB ---
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not set in environment');
}

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    console.log('✅ MongoDB connected successfully.');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message || err);
  });

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error event:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Mongoose disconnected');
});


// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));

// --- Start the Server ---
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED_REJECTION:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT_EXCEPTION:', err);
});

// Start background schedulers after server bootstrap
try {
  startReminderScheduler();
} catch (e) {
  console.error('Failed to start reminder scheduler:', e);
}