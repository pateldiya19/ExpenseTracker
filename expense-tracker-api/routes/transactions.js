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
    // req.user.id is available because of the 'auth' middleware
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
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