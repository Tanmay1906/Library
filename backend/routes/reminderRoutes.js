const express = require('express');
const router = express.Router();
const { sendWhatsAppReminders } = require('../services/whatsappReminderService');

router.post('/send-reminders', async (req, res) => {
  try {
    await sendWhatsAppReminders();
    res.status(200).json({ message: 'Reminders sent successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reminders.' });
  }
});

module.exports = router;
