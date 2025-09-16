require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});