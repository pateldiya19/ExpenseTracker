const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    type: {
        type: String,
        required: true,
        enum: ['daily', 'custom', 'spending_limit'],
        default: 'daily'
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    message: {
        type: String,
        default: "Don'\''t forget to add today'\''s spending!"
    },
    active: {
        type: Boolean,
        default: true
    },
    sent: {
        type: Boolean,
        default: false
    },
    time: {
        type: String
    },
    reminderTime: {
        type: Date
    },
    amount: {
        type: Number
     },
     deliveryMethod: {
         type: String,
         enum: ['in_app', 'email', 'sms'],
         default: 'in_app'
     },
     phone: {
         type: String
    }
}, {
    timestamps: true,
    validateBeforeSave: true
});

module.exports = mongoose.model('Reminder', ReminderSchema);
