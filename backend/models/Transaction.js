const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amountMinor: { type: Number, required: true }, // Storing amount in minor units (e.g., paisa)
  category: { type: String, required: true },
  date: { type: Date, required: true },
  note: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);