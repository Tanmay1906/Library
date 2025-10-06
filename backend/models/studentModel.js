const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// Fetch students with pending fees and due_date exactly 2 days from today
async function getStudentsWithPendingFees() {
  try {
    const today = new Date();
    // Get the date 2 days from now (the due date)
    const targetDueDate = new Date(today);
    targetDueDate.setDate(today.getDate() + 2);
    // Format as YYYY-MM-DD
    const yyyy = targetDueDate.getFullYear();
    const mm = String(targetDueDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDueDate.getDate()).padStart(2, '0');
    const dueDateStr = `${yyyy}-${mm}-${dd}`;
    const students = await prisma.students.findMany({
      where: {
        fees_due: true,
        due_date: dueDateStr
      },
      select: {
        id: true,
        name: true,
        phone_number: true,
        due_date: true
      }
    });
    return students;
  } catch (error) {
    console.error('Error fetching students with pending fees:', error);
    throw error;
  }
}

module.exports = { getStudentsWithPendingFees };
