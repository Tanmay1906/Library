const { PrismaClient } = require('@prisma/client');
const catchAsync = require('../middlewares/errorHandler').catchAsync;
const prisma = new PrismaClient();

exports.getReportSummary = catchAsync(async (req, res) => {
    // Get comprehensive statistics
    const bookCount = await prisma.book.count();
    const studentCount = await prisma.student.count();
    const paymentCount = await prisma.payment.count();
    const libraryCount = await prisma.library.count();
    
    // Get payment statistics
    const totalRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'completed' }
    });
    
    const pendingPayments = await prisma.student.count({
      where: { paymentStatus: 'pending' }
    });
    
    const activeStudents = await prisma.student.count({
      where: { paymentStatus: 'paid' }
    });

    // Get recent activities
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: { name: true }
        }
      }
    });

    const recentStudents = await prisma.student.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { name: true, createdAt: true, subscriptionPlan: true }
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          bookCount, 
          studentCount, 
          paymentCount, 
          libraryCount,
          totalRevenue: totalRevenue._sum.amount || 0,
          pendingPayments,
          activeStudents
        },
        recentActivities: {
          payments: recentPayments,
          students: recentStudents
        }
      },
      message: 'Report summary fetched successfully'
    });
});

exports.getStudentReport = catchAsync(async (req, res) => {
    const students = await prisma.student.findMany({
      include: {
        library: {
          select: { name: true }
        },
        payments: true,
        borrowHistory: {
          include: {
            book: {
              select: { title: true }
            }
          }
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: students,
      message: 'Student report fetched successfully'
    });
});

exports.getPaymentReport = catchAsync(async (req, res) => {
    const payments = await prisma.payment.findMany({
      include: {
        student: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json({
      success: true,
      data: payments,
      message: 'Payment report fetched successfully'
    });
});
