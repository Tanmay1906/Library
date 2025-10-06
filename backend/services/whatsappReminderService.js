const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const AISENSY_API_URL = 'https://backend.aisensy.com/api/sendCampaign';
const AISENSY_API_KEY = process.env.AISENSY_API_KEY; // Set this in your .env file

// Get students with pending payments
async function getStudentsWithPendingFees() {
  try {
    const students = await prisma.student.findMany({
      where: {
        paymentStatus: 'PENDING' // Using enum value
      },
      include: {
        library: true
      }
    });
    return students;
  } catch (error) {
    console.error('Error fetching students with pending fees:', error);
    return [];
  }
}

// Get students with overdue books
async function getStudentsWithOverdueBooks() {
  try {
    const currentDate = new Date();
    const students = await prisma.student.findMany({
      where: {
        borrowHistory: {
          some: {
            status: 'BORROWED',
            dueDate: {
              lt: currentDate
            }
          }
        }
      },
      include: {
        library: true,
        borrowHistory: {
          where: {
            status: 'BORROWED',
            dueDate: {
              lt: currentDate
            }
          },
          include: {
            book: true
          }
        }
      }
    });
    return students;
  } catch (error) {
    console.error('Error fetching students with overdue books:', error);
    return [];
  }
}

async function sendWhatsAppReminders() {
  try {
    const students = await getStudentsWithPendingFees();
    
    if (!students.length) {
      console.log('No students with pending fees.');
      return;
    }

    console.log(`Found ${students.length} students with pending payments`);

    for (const student of students) {
      const body = {
        campaignName: 'Fee Reminder',
        destination: student.phone,
        userName: student.name,
        templateParams: [student.dueDate]
      };

      try {
        if (!AISENSY_API_KEY) {
          console.log(`Would send WhatsApp reminder to ${student.name} (${student.phone}) - API key not configured`);
          continue;
        }

        const response = await axios.post(AISENSY_API_URL, body, {
          headers: {
            Authorization: `Bearer ${AISENSY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data && response.data.status === 'success') {
          console.log(`WhatsApp reminder sent to ${student.name} (${student.phone})`);
        } else {
          console.error(`Failed to send reminder to ${student.name}:`, response.data);
        }
      } catch (err) {
        console.error(`Error sending WhatsApp reminder to ${student.name}:`, err.response ? err.response.data : err.message);
      }
    }
  } catch (error) {
    console.error('Error in sendWhatsAppReminders:', error);
  }
}

// Send book return reminders
async function sendBookReturnReminders() {
  try {
    const students = await getStudentsWithOverdueBooks();
    
    if (!students.length) {
      console.log('No students with overdue books.');
      return;
    }

    console.log(`Found ${students.length} students with overdue books`);

    for (const student of students) {
      const overdueBooks = student.borrowHistory.map(borrow => borrow.book.title).join(', ');
      
      const body = {
        campaignName: 'Book Return Reminder',
        destination: student.phone,
        userName: student.name,
        templateParams: [overdueBooks]
      };

      try {
        if (!AISENSY_API_KEY) {
          console.log(`Would send book return reminder to ${student.name} (${student.phone}) for books: ${overdueBooks}`);
          continue;
        }

        const response = await axios.post(AISENSY_API_URL, body, {
          headers: {
            Authorization: `Bearer ${AISENSY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data && response.data.status === 'success') {
          console.log(`Book return reminder sent to ${student.name} (${student.phone})`);
        } else {
          console.error(`Failed to send book return reminder to ${student.name}:`, response.data);
        }
      } catch (err) {
        console.error(`Error sending book return reminder to ${student.name}:`, err.response ? err.response.data : err.message);
      }
    }
  } catch (error) {
    console.error('Error in sendBookReturnReminders:', error);
  }
}

module.exports = { 
  sendWhatsAppReminders, 
  sendBookReturnReminders,
  getStudentsWithPendingFees,
  getStudentsWithOverdueBooks 
};
