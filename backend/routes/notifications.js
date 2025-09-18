const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// GET /api/notifications - list user's notifications
router.get('/', auth, async (req, res) => {
  try {
    const items = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    return res.json(items.map(item => ({
      id: item._id,
      userId: item.userId,
      type: item.type,
      title: item.title,
      message: item.message,
      read: item.read,
      createdAt: item.createdAt
    })));
  } catch (err) {
    console.error('[NOTIFICATIONS] list error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/notifications/mark-read - mark multiple notifications as read
router.post('/mark-read', auth, async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Provide an array of notification ids to mark read' });
    }

    await Notification.updateMany({ _id: { $in: ids }, userId: req.user.id }, { $set: { read: true } });
    return res.json({ success: true });
  } catch (err) {
    console.error('[NOTIFICATIONS] mark-read error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/notifications/:id/read - mark as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Notification.findOneAndUpdate({ _id: id, userId: req.user.id }, { $set: { read: true } }, { new: true });
    if (!item) return res.status(404).json({ message: 'Notification not found' });
    return res.json(item);
  } catch (err) {
    console.error('[NOTIFICATIONS] mark read error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/notifications/:id - delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Notification.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!item) return res.status(404).json({ message: 'Notification not found' });
    return res.json({ message: 'Notification removed' });
  } catch (err) {
    console.error('[NOTIFICATIONS] delete error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;


