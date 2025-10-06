const { PrismaClient } = require('@prisma/client');
const catchAsync = require('../middlewares/errorHandler').catchAsync;
const { AppError } = require('../middlewares/errorHandler');
const prisma = new PrismaClient();

exports.getPaymentHistory = catchAsync(async (req, res) => {
  const { id: userId, role } = req.user; // From auth middleware
  
  // If user is LIBRARY_OWNER, get payments for students in their library only
  // If user is STUDENT, get only their payments
  // If user is ADMIN, get all payments (super admin access)
  let payments;
  
  if (role === 'LIBRARY_OWNER') {
    // First, find the library owned by this user
    const library = await prisma.library.findFirst({
      where: { adminId: userId }
    });
    
    if (!library) {
      // Library owner doesn't have a library - return empty
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No library found for this owner'
      });
    }
    
    // Get payments only for students in this library owner's library
    payments = await prisma.payment.findMany({
      where: {
        student: {
          libraryId: library.id
        }
      },
      include: { 
        student: {
          select: { id: true, name: true, email: true, libraryId: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } else if (role === 'ADMIN') {
    // Admin can see all payments across all libraries
    payments = await prisma.payment.findMany({
      include: { 
        student: {
          select: { id: true, name: true, email: true, libraryId: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } else if (role === 'STUDENT') {
    // First, check if this student actually exists and is enrolled in a library
    const student = await prisma.student.findUnique({
      where: { id: userId },
      include: { library: true }
    });
    
    if (!student) {
      // Student doesn't exist in database - return empty
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Student not found or not enrolled in any library'
      });
    }
    
    if (!student.library) {
      // Student exists but not enrolled in any library - return empty
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Student not enrolled in any library'
      });
    }
    
    // Get payments only for this specific student
    payments = await prisma.payment.findMany({
      where: { studentId: userId },
      include: { 
        student: {
          select: { id: true, name: true, email: true, libraryId: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } else {
    throw new AppError('Unauthorized to view payment history', 403);
  }
  
  res.status(200).json({
    success: true,
    data: payments,
    message: 'Payment history fetched successfully'
  });
});

exports.createPayment = catchAsync(async (req, res) => {
  const { amount, studentId, subscriptionId } = req.body;
  
  // Verify student exists
  const student = await prisma.student.findUnique({
    where: { id: studentId }
  });
  
  if (!student) {
    throw new AppError('Student not found', 404);
  }
  
  const payment = await prisma.payment.create({
    data: {
      amount: parseFloat(amount),
      studentId,
      subscriptionId,
      status: 'PENDING',
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
    include: {
      student: {
        select: { id: true, name: true, email: true }
      }
    }
  });
  
  res.status(201).json({
    success: true,
    data: payment,
    message: 'Payment created successfully'
  });
});

exports.updatePaymentStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Valid statuses are: ${validStatuses.join(', ')}`, 400);
  }
  
  const existingPayment = await prisma.payment.findUnique({
    where: { id }
  });
  
  if (!existingPayment) {
    throw new AppError('Payment not found', 404);
  }
  
  const payment = await prisma.payment.update({
    where: { id },
    data: { status },
    include: {
      student: {
        select: { id: true, name: true, email: true }
      }
    }
  });
  
  res.status(200).json({
    success: true,
    data: payment,
    message: 'Payment status updated successfully'
  });
});

exports.downloadInvoice = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;
  
  // Find the payment
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      student: {
        select: { id: true, name: true, email: true, registrationNumber: true }
      }
    }
  });
  
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }
  
  // Check access permissions
  if (role === 'STUDENT' && payment.studentId !== userId) {
    throw new AppError('You can only download invoices for your own payments', 403);
  }
  
  // Only allow invoice download for paid payments
  if (payment.status !== 'PAID') {
    throw new AppError('Invoice can only be downloaded for paid payments', 400);
  }
  
  // Generate invoice data
  const invoiceData = {
    invoiceNumber: `INV-${payment.id.slice(-8).toUpperCase()}`,
    date: payment.date,
    paymentId: payment.id,
    amount: payment.amount,
    plan: payment.plan,
    method: payment.method,
    status: payment.status,
    student: payment.student,
    issueDate: new Date().toISOString().split('T')[0]
  };
  
  // In a real implementation, you would generate a PDF here
  // For now, we'll return the invoice data as JSON that can be used to generate PDF on frontend
  res.status(200).json({
    success: true,
    data: invoiceData,
    message: 'Invoice data retrieved successfully'
  });
});
