const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure this path is correct
const { sendWelcomeEmail } = require('../utils/email');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('[AUTH] /register called with', { name, email, pwLen: password && password.length });

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create a new user instance
    user = new User({ name, email, password });

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user to the database
    await user.save();
    console.log('[AUTH] /register saved user id', user.id);

    // Attempt to send welcome email (non-blocking for response reliability)
    let emailSent = false;
    try {
      const result = await sendWelcomeEmail(user.email, user.name);
      emailSent = !!(result && result.success);
    } catch (e) {
      console.error('[AUTH] /register welcome email error:', e);
    }
    
    // Create and return a JWT token for auto-login
    const payload = { user: { id: user.id } };
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    // Use synchronous sign to avoid callback swallowing errors
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ 
      token,
      user: { id: user.id, name: user.name, email: user.email },
      emailSent
    });
  } catch (err) {
    console.error('[AUTH] /register error:', err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[AUTH] /login called with', { email, pwLen: password && password.length });

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and return a JWT token
    const payload = { user: { id: user.id } };
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[AUTH] /login error:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;