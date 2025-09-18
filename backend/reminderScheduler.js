const cron = require('node-cron');
const Reminder = require('./models/Reminder');
const User = require('./models/User');
const { sendEmail } = require('./utils/email');
const Notification = require('./models/Notification');

function getCurrentHHMM() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function getCurrentHMMIfSingleDigitHour() {
  const now = new Date();
  const h = now.getHours();
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${mm}`;
}

async function checkAndSendReminders() {
  try {
    const current = getCurrentHHMM();
    const currentHMM = getCurrentHMMIfSingleDigitHour();
    // Daily HH:MM reminders
    const dailyReminders = await Reminder.find({ active: true, type: 'daily', time: { $in: [current, currentHMM] } }).populate('userId', 'email name');
    if (dailyReminders.length) {
      console.log(`[REMINDER_SCHEDULER] Found ${dailyReminders.length} daily reminders for ${current}`);
    }
    for (const reminder of dailyReminders) {
      try {
        const user = reminder.userId;
        const to = user && user.email;
        const subject = 'Expense Tracker Reminder';
        const text = reminder.message || "Don't forget to add today’s spending!";
        const html = `<p>${text}</p>`;
        // Create in-app notification regardless of email result
        try {
          await Notification.create({ userId: user._id, type: 'reminder', title: subject, message: text, reminderId: reminder._id });
        } catch (e) {
          console.error('[REMINDER_SCHEDULER] failed to create in-app notification (daily):', e);
        }
        if (to) {
          const result = await sendEmail({ to, subject, text, html });
          if (!result.success) {
            console.error('[REMINDER_SCHEDULER] sendEmail failed:', result.error);
          } else {
            console.log(`[REMINDER_SCHEDULER] reminder email sent to ${to} at ${current}`);
          }
        }
      } catch (e) {
        console.error('[REMINDER_SCHEDULER] error sending reminder:', e);
      }
    }

    // Date-time one-off reminders within the current minute, not yet sent
    const now = new Date();
    const start = new Date(now);
    start.setSeconds(0, 0);
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + 1);

    const dueReminders = await Reminder.find({
      active: true,
      type: 'custom',
      sent: { $ne: true },
      reminderTime: { $gte: start, $lt: end }
    }).populate('userId', 'email name');

    for (const reminder of dueReminders) {
      try {
        const user = reminder.userId;
        const to = user && user.email;
        const subject = reminder.title || 'Expense Tracker Reminder';
        const text = reminder.description || reminder.message || 'Reminder';
        const html = `<h3>${subject}</h3><p>${text}</p>`;
        // Create in-app notification regardless of email result
        try {
          await Notification.create({ userId: user._id, type: 'reminder', title: subject, message: text, reminderId: reminder._id });
        } catch (e) {
          console.error('[REMINDER_SCHEDULER] failed to create in-app notification (one-off):', e);
        }
        if (to) {
          const result = await sendEmail({ to, subject, text, html });
          if (!result.success) {
            console.error('[REMINDER_SCHEDULER] sendEmail failed (one-off):', result.error);
          } else {
            console.log(`[REMINDER_SCHEDULER] one-off reminder email sent to ${to} for ${reminder.reminderTime}`);
          }
        }
        await Reminder.updateOne({ _id: reminder._id }, { $set: { sent: true } });
      } catch (e) {
        console.error('[REMINDER_SCHEDULER] error sending one-off reminder:', e);
      }
    }
  } catch (err) {
    console.error('[REMINDER_SCHEDULER] check error:', err);
  }
}

function startReminderScheduler() {
  try {
    // Run every minute
    cron.schedule('* * * * *', async () => {
      await checkAndSendReminders();
    });
    console.log('⏰ Reminder scheduler started (every minute).');
  } catch (e) {
    console.error('[REMINDER_SCHEDULER] failed to start:', e);
  }
}

module.exports = { startReminderScheduler };


