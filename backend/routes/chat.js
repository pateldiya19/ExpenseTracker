const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { OpenAI } = require('openai');
const Transaction = require('../models/Transaction');
const Reminder = require('../models/Reminder');
const cron = require('node-cron');
const { sendEmail } = require('../utils/email'); // Assuming you have an email utility

function buildOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not set. Chatbot will use basic heuristics.');
    return null;
  }
  return new OpenAI({ apiKey });
}

const openai = buildOpenAIClient();

// Fallback parser
function basicParseIntent(message) {
  const lower = (message || '').toLowerCase();
  if (lower.includes('last') && lower.includes('transaction')) return { intent: 'GET_LAST_TRANSACTIONS', limit: 5 };
  if ((lower.includes('how much') || lower.includes('spend')) && lower.includes('today')) return { intent: 'GET_TODAY_SPEND' };
  if (lower.startsWith('set ') && lower.includes('reminder')) {
    // Check for recurring
    if (lower.includes('every day') || lower.includes('daily')) return { intent: 'CREATE_RECURRING_REMINDER', text: message };
    return { intent: 'CREATE_REMINDER', text: message };
  }
  if (lower.includes('upcoming') && lower.includes('reminder')) return { intent: 'GET_REMINDERS' };
  return { intent: 'SMALL_TALK' };
}

async function parseIntentWithOpenAI(message) {
  if (!openai) return basicParseIntent(message);
  try {
    const system = `
      You are an assistant for an expense tracker. Parse the user's message into a strict JSON with fields: 
      intent (one of [GET_TODAY_SPEND, GET_LAST_TRANSACTIONS, GET_REMINDERS, CREATE_REMINDER, CREATE_RECURRING_REMINDER, SMALL_TALK]),
      limit (number, optional),
      date (ISO string, optional),
      reminderTime (ISO string, optional),
      recurrence (string, optional),
      title (string, optional),
      description (string, optional).
      If asking last N transactions, set limit. 
      If asking spend for a day, set date. 
      If creating a reminder, set reminderTime (ISO) and title/description.
      If creating a recurring reminder, set recurrence ('daily', 'weekly', etc.) and time.
      Reply ONLY with JSON.
    `;
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: message }
      ],
      response_format: { type: 'json_object' }
    });
    const content = resp.choices?.[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (err) {
    console.error('[CHAT] OpenAI parse error:', err);
    return basicParseIntent(message);
  }
}

// Schedule daily recurring reminders at specified time
async function scheduleRecurringReminder(reminder) {
  if (!reminder.recurrence || !reminder.time) return;
  // e.g., time = "08:00"
  const [hour, minute] = reminder.time.split(':');
  cron.schedule(`0 ${minute} ${hour} * * *`, async () => {
    try {
      const userEmail = reminder.userEmail; // make sure Reminder has user's email populated
      await sendEmail(userEmail, `Reminder: ${reminder.title}`, reminder.description);
      console.log(`[CHAT] Sent recurring reminder to ${userEmail}: ${reminder.title}`);
    } catch (err) {
      console.error('[CHAT] Error sending recurring reminder:', err);
    }
  });
}

router.post('/', auth, async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') return res.status(400).json({ message: 'message is required' });

    const intentPayload = await parseIntentWithOpenAI(message);
    const userId = req.user.id;

    switch (intentPayload.intent) {
      case 'GET_TODAY_SPEND': {
        const date = intentPayload.date ? new Date(intentPayload.date) : new Date();
        const start = new Date(date); start.setHours(0,0,0,0);
        const end = new Date(date); end.setHours(23,59,59,999);
        const txs = await Transaction.find({ userId, type: 'expense', date: { $gte: start, $lte: end } });
        const totalMinor = txs.reduce((sum, t) => sum + (t.amountMinor || 0), 0);
        const total = (totalMinor / 100).toFixed(2);
        return res.json({ reply: `You spent ₹${total} today.` });
      }
      case 'GET_LAST_TRANSACTIONS': {
        const limit = Math.max(1, Math.min(20, Number(intentPayload.limit) || 5));
        const txs = await Transaction.find({ userId }).sort({ date: -1 }).limit(limit);
        const lines = txs.map(t => `${new Date(t.date).toLocaleString()}: ${t.type} ₹${(t.amountMinor/100).toFixed(2)} - ${t.note || t.category}`);
        return res.json({ reply: `Here are your last ${txs.length} transactions:\n` + lines.join('\n') });
      }
      case 'GET_REMINDERS': {
        const reminders = await Reminder.find({ userId, active: true }).sort({ reminderTime: 1, time: 1 });
        if (reminders.length === 0) return res.json({ reply: 'You have no upcoming reminders.' });
        const lines = reminders.map(r => r.recurrence ? `${r.recurrence} at ${r.time}: ${r.title || r.description}` : `${new Date(r.reminderTime).toLocaleString()}: ${r.title || r.description}`);
        return res.json({ reply: `Upcoming reminders:\n` + lines.join('\n') });
      }
      case 'CREATE_REMINDER': {
        let dt = intentPayload.reminderTime ? new Date(intentPayload.reminderTime) : null;
        if (!dt || isNaN(dt.getTime())) return res.json({ reply: 'I could not understand the reminder time. Please provide a date and time.' });
        const reminder = await Reminder.create({
          userId,
          title: intentPayload.title || 'Reminder',
          description: intentPayload.description || 'Reminder created via chat',
          reminderTime: dt,
          active: true
        });
        return res.json({ reply: `Reminder set for ${dt.toLocaleString()}: ${reminder.title}` });
      }
      case 'CREATE_RECURRING_REMINDER': {
        if (!intentPayload.recurrence || !intentPayload.time) {
          return res.json({ reply: 'Please specify the recurrence (daily, weekly) and time for the reminder.' });
        }
        const reminder = await Reminder.create({
          userId,
          title: intentPayload.title || 'Recurring Reminder',
          description: intentPayload.description || 'Created via chat',
          recurrence: intentPayload.recurrence,
          time: intentPayload.time,
          active: true,
          userEmail: req.user.email // make sure Reminder model has userEmail field
        });
        // Schedule the cron job immediately
        scheduleRecurringReminder(reminder);
        return res.json({ reply: `Recurring reminder set for every ${intentPayload.recurrence} at ${intentPayload.time}: ${reminder.title}` });
      }
      default:
        return res.json({ reply: "I'm here to help with expenses and reminders. Ask 'How much did I spend today?' or 'Set a reminder for tomorrow 5 PM'." });
    }
  } catch (err) {
    console.error('[CHAT] route error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
