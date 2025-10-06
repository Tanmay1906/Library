const { PrismaClient } = require('@prisma/client');
const catchAsync = require('../middlewares/errorHandler').catchAsync;

const prisma = new PrismaClient();

// In-memory storage for notifications (starts empty, only stores actually sent notifications)
let notificationStore = [];

// Get notifications with statistics
exports.getNotifications = catchAsync(async (req, res) => {
  // Return notifications sorted by date (newest first)
  const sortedNotifications = [...notificationStore].sort((a, b) => 
    new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime()
  );

  res.status(200).json({
    success: true,
    data: sortedNotifications,
    message: 'Notifications fetched successfully'
  });
});

// Get notification statistics
exports.getNotificationStats = catchAsync(async (req, res) => {
  // Calculate stats from actual notification store (only real sent notifications)
  const totalSent = notificationStore.filter(n => n.status === 'sent').length;
  const totalScheduled = notificationStore.filter(n => n.status === 'scheduled').length;
  const thisMonth = notificationStore.filter(n => {
    const notifDate = new Date(n.sentDate);
    const now = new Date();
    return notifDate.getMonth() === now.getMonth() && 
           notifDate.getFullYear() === now.getFullYear() &&
           n.status === 'sent';
  }).length;

  const stats = {
    sentThisMonth: thisMonth,
    openRate: '0%', // Reset to 0%
    responseRate: '0%' // Reset to 0%
  };

  res.status(200).json({
    success: true,
    data: stats,
    message: 'Notification statistics fetched successfully'
  });
});

// Get notification templates
exports.getNotificationTemplates = catchAsync(async (req, res) => {
  const templates = [
    {
      id: '1',
      name: 'Payment Reminder',
      type: 'email',
      subject: 'Payment Reminder - Your Subscription is Due',
      message: 'Dear [Student Name], This is a friendly reminder that your monthly subscription payment is due. Please make your payment to continue enjoying our library services.'
    },
    {
      id: '2',
      name: 'Welcome Message',
      type: 'email',
      subject: 'Welcome to Our Library!',
      message: 'Dear [Student Name], Welcome to our library! We\'re excited to have you as a member. Here are some important details about your subscription...'
    },
    {
      id: '3',
      name: 'Overdue Notice',
      type: 'whatsapp',
      subject: 'Urgent: Overdue Payment',
      message: 'Hi [Student Name], Your payment is now overdue. Please settle your dues immediately to avoid suspension of services.'
    },
    {
      id: '4',
      name: 'Library Update',
      type: 'email',
      subject: 'Important Library Updates',
      message: 'Dear Students, We have some important updates regarding our library services and timings...'
    },
    {
      id: '5',
      name: 'Book Return Reminder',
      type: 'whatsapp',
      subject: 'Book Return Reminder',
      message: 'Hi [Student Name], This is a reminder that your borrowed book "[Book Title]" is due for return on [Due Date]. Please return it on time to avoid late fees.'
    },
    {
      id: '6',
      name: 'Subscription Expiry',
      type: 'email',
      subject: 'Subscription Expiring Soon',
      message: 'Dear [Student Name], Your library subscription will expire on [Expiry Date]. Please renew your subscription to continue accessing our services.'
    }
  ];
    
  res.status(200).json({
    success: true,
    data: templates,
    message: 'Notification templates fetched successfully'
  });
});

// Send notification
exports.sendNotification = catchAsync(async (req, res) => {
  const { type, recipients, subject, message, scheduleDate } = req.body;
  
  console.log('Sending notification:', { type, recipients, subject, message, scheduleDate });
  
  // Calculate recipient count based on type
  let recipientCount = 0;
  switch (recipients) {
    case 'all':
      recipientCount = 50; // Mock all students
      break;
    case 'pending':
      recipientCount = 15; // Mock pending payment students
      break;
    case 'overdue':
      recipientCount = 8; // Mock overdue students
      break;
    default:
      recipientCount = 10;
  }

  // Create new notification
  const newNotification = {
    id: Date.now().toString(),
    type,
    subject,
    message,
    recipients: recipientCount,
    sentDate: scheduleDate || new Date().toISOString(),
    status: scheduleDate ? 'scheduled' : 'sent'
  };

  // Add to notification store
  notificationStore.unshift(newNotification); // Add to beginning of array

  console.log('Notification saved:', newNotification);

  res.status(200).json({
    success: true,
    message: `Notification ${scheduleDate ? 'scheduled' : 'sent'} successfully to ${recipientCount} recipients`,
    data: { 
      notification: newNotification,
      recipientCount,
      scheduled: !!scheduleDate 
    }
  });
});

// Delete notification
exports.deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  console.log('Deleting notification:', id);
  
  // Find and remove notification from store
  const initialLength = notificationStore.length;
  notificationStore = notificationStore.filter(notification => notification.id !== id);
  
  if (notificationStore.length < initialLength) {
    console.log('Notification deleted successfully');
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }
});
