const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Reminder = require('../models/Reminder');

// Validate HH:MM 24h
function isValidTimeFormat(value) {
  // Accept both HH:MM and H:MM formats
  return /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
}

function parseDate(value) {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// POST /api/reminders - create a reminder
router.post('/', auth, async (req, res) => {
  try {
    const { message, time, active, title, description, reminderTime, type, amount, deliveryMethod, phone } = req.body || {};

    let payload = { 
      userId: req.user.id,
      type: type || 'daily'
    };

    // Custom reminder with specific date-time
    if (type === 'custom' && reminderTime) {
      const dt = parseDate(reminderTime);
      if (!dt) {
        return res.status(400).json({ message: 'Invalid reminderTime. Provide a valid ISO datetime.' });
      }
      payload.reminderTime = dt;
    } 
    // Daily reminder with time
    else if (type === 'daily' && time) {
      if (!isValidTimeFormat(time)) {
        return res.status(400).json({ message: 'Invalid time format. Use HH:MM (24h).' });
      }
      // Normalize to HH:MM without defaulting
      const [h,m] = time.split(':');
      payload.time = `${String(parseInt(h,10)).padStart(2,'0')}:${m}`;
    }
    // Spending limit reminder
    else if (type === 'spending_limit' && amount) {
      payload.amount = parseFloat(amount);
    }
    // Invalid configuration
    else {
      return res.status(400).json({ message: 'Invalid reminder configuration. Check type and required fields.' });
    }

    // Common fields
    if (typeof title === 'string') payload.title = title;
    if (typeof description === 'string') payload.description = description;
    if (typeof message === 'string' && message.trim()) payload.message = message.trim();
    if (typeof active === 'boolean') payload.active = active;
    if (typeof deliveryMethod === 'string') payload.deliveryMethod = deliveryMethod;
    if (typeof phone === 'string') payload.phone = phone;

    if (typeof active === 'boolean') payload.active = active;

    const reminder = await Reminder.create(payload);
    return res.status(201).json(reminder);
  } catch (err) {
    console.error('[REMINDERS] create error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/reminders - list reminders for user
router.get('/', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(reminders);
  } catch (err) {
    console.error('[REMINDERS] list error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/reminders/:id - update reminder
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { message, time, active, title, description, reminderTime, sent, deliveryMethod, phone } = req.body || {};

    const update = {};
    if (typeof message === 'string') update.message = message;
    if (typeof title === 'string') update.title = title;
    if (typeof description === 'string') update.description = description;
    if (typeof active === 'boolean') update.active = active;
    if (typeof sent === 'boolean') update.sent = sent;
    if (typeof deliveryMethod === 'string') update.deliveryMethod = deliveryMethod;
    if (typeof phone === 'string') update.phone = phone;
    if (typeof time === 'string') {
      if (!isValidTimeFormat(time)) {
        return res.status(400).json({ message: 'Invalid time format. Use HH:MM (24h)' });
      }
      update.time = time;
    }
    if (typeof reminderTime === 'string' || reminderTime instanceof Date) {
      const dt = parseDate(reminderTime);
      if (!dt) return res.status(400).json({ message: 'Invalid reminderTime. Provide a valid ISO datetime.' });
      update.reminderTime = dt;
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: update },
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    return res.json(reminder);
  } catch (err) {
    console.error('[REMINDERS] update error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/reminders/:id - delete reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    return res.json({ message: 'Reminder removed' });
  } catch (err) {
    console.error('[REMINDERS] delete error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;


