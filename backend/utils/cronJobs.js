const cron = require('node-cron');
const { sendWhatsAppReminders } = require('../services/whatsappReminderService');

// Schedule to run every day at 10:00 AM
cron.schedule('0 10 * * *', async () => {
  console.log('Running daily WhatsApp reminder job at 10:00 AM');
  try {
    await sendWhatsAppReminders();
    console.log('WhatsApp reminder job completed successfully');
  } catch (error) {
    console.error('Error in WhatsApp reminder job:', error);
  }
}, {
  timezone: "Asia/Kolkata"
});

console.log('Cron jobs initialized successfully');
