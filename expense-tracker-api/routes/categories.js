const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET /api/categories
// @desc    Get all transaction categories
// @access  Private
router.get('/', auth, (req, res) => {
  try {
    // For now, we return a hardcoded list.
    // Later, you could move this to your database.
    const categories = [
      { id: 'cat_1', name: 'Salary', type: 'income' },
      { id: 'cat_2', name: 'Freelance', type: 'income' },
      { id: 'cat_3', name: 'Food', type: 'expense' },
      { id: 'cat_4', name: 'Transport', type: 'expense' },
      { id: 'cat_5', name: 'Utilities', type: 'expense' },
      { id: 'cat_6', name: 'Shopping', type: 'expense' },
      { id: 'cat_7', name: 'Health', type: 'expense' },
      { id: 'cat_8', name: 'Rent', type: 'expense' },
    ];
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;