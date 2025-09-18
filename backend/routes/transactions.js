// routes/transactions.js

const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth'); // We will create this middleware next

// @route   GET /api/transactions
// @desc    Get all transactions for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // optional ?type=expense|income
    const { type } = req.query;
    const query = { userId: req.user.id };
    if (type && (type === 'expense' || type === 'income')) {
      query.type = type;
    }
    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/transactions
// @desc    Add a new transaction
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { type, amountMinor, category, date, note } = req.body;

        const newTransaction = new Transaction({
            userId: req.user.id,
            type,
            amountMinor,
            category,
            date,
            note
        });

        const transaction = await newTransaction.save();

        // After saving, check spending limit reminders and create DB notification if exceeded
        try {
          // sum this month's expenses
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const expenses = await Transaction.aggregate([
            { $match: { userId: newTransaction.userId, type: 'expense', date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amountMinor' } } }
          ]);
          const totalSpendingMinor = expenses[0]?.total || 0;

          const Reminder = require('../models/Reminder');
          const Notification = require('../models/Notification');
          const activeLimits = await Reminder.find({ userId: req.user.id, type: 'spending_limit', active: true });
          for (const limit of activeLimits) {
            const limitMinor = Math.round((limit.amount || 0) * 100);
            if (limitMinor > 0 && totalSpendingMinor >= limitMinor) {
              const title = 'Spending Limit Exceeded';
              const message = `This month you spent ₹${(totalSpendingMinor/100).toFixed(2)}, exceeding your limit of ₹${(limitMinor/100).toFixed(2)}.`;
              try {
                // Avoid duplicate notifications for the same reminder in the same month
                const monthKey = new Date().toISOString().slice(0,7); // YYYY-MM
                const existing = await Notification.findOne({ userId: req.user.id, type: 'spending_limit', reminderId: limit._id, createdAt: { $gte: new Date(`${monthKey}-01T00:00:00Z`) } });
                if (!existing) {
                  await Notification.create({ userId: req.user.id, type: 'spending_limit', title, message, reminderId: limit._id });
                } else {
                  console.log('[NOTIFICATIONS] spending_limit already created for this reminder this month:', limit._id.toString());
                }
              } catch (e) {
                console.error('[NOTIFICATIONS] create error:', e);
              }
            }
          }
        } catch (e) {
          console.error('[LIMIT_CHECK] error:', e);
        }

        res.status(201).json(transaction);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ msg: 'Transaction not found' });
        }

        // Ensure user owns the transaction
        if (transaction.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Transaction removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;