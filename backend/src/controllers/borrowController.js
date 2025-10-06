const { PrismaClient } = require('@prisma/client');
const catchAsync = require('../middlewares/errorHandler').catchAsync;
const ApiError = require('../middlewares/errorHandler').ApiError;
const prisma = new PrismaClient();

exports.getBorrowStatus = catchAsync(async (req, res) => {
  const { userId, role } = req.user;
  
  let borrows;
  
  if (role === 'STUDENT') {
    // Students can only see their own borrow history
    borrows = await prisma.borrowHistory.findMany({
      where: { studentId: userId },
      include: { 
        student: {
          select: { name: true, id: true }
        }, 
        book: {
          select: { title: true, author: true, id: true }
        }
      },
      orderBy: { borrowDate: 'desc' }
    });
  } else if (role === 'LIBRARY_OWNER') {
    // Library owners see borrows for their library's books
    borrows = await prisma.borrowHistory.findMany({
      include: { 
        student: {
          select: { name: true, id: true, email: true }
        }, 
        book: {
          include: { library: true }
        }
      },
      orderBy: { borrowDate: 'desc' }
    });
  } else if (role === 'ADMIN') {
    // Admin can see all borrows
    borrows = await prisma.borrowHistory.findMany({
      include: { 
        student: {
          select: { name: true, id: true, email: true }
        }, 
        book: {
          include: { library: true }
        }
      },
      orderBy: { borrowDate: 'desc' }
    });
  } else {
    throw new ApiError(403, 'Unauthorized to view borrow status');
  }
  
  res.status(200).json({
    success: true,
    data: borrows,
    message: 'Borrow status fetched successfully'
  });
});

exports.borrowBook = catchAsync(async (req, res) => {
  const { bookId } = req.body;
  const { userId, role } = req.user;
  
  // Only students can borrow books
  if (role !== 'STUDENT') {
    throw new ApiError(403, 'Only students can borrow books');
  }
  
  // Check if book exists and is available
  const book = await prisma.book.findUnique({
    where: { id: bookId }
  });
  
  if (!book) {
    throw new ApiError(404, 'Book not found');
  }
  
  if (book.availableCopies <= 0) {
    throw new ApiError(400, 'Book is not available for borrowing');
  }
  
  // Check if student already has this book borrowed
  const existingBorrow = await prisma.borrowHistory.findFirst({
    where: {
      studentId: userId,
      bookId: bookId,
      returnDate: null // Not returned yet
    }
  });
  
  if (existingBorrow) {
    throw new ApiError(400, 'You have already borrowed this book');
  }
  
  // Create borrow record and update book availability
  const borrow = await prisma.$transaction(async (prisma) => {
    // Create borrow record
    const borrowRecord = await prisma.borrowHistory.create({
      data: {
        studentId: userId,
        bookId: bookId,
        borrowDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      },
      include: {
        student: {
          select: { name: true, id: true }
        },
        book: {
          select: { title: true, author: true, id: true }
        }
      }
    });
    
    // Update book availability
    await prisma.book.update({
      where: { id: bookId },
      data: {
        availableCopies: {
          decrement: 1
        }
      }
    });
    
    return borrowRecord;
  });
  
  res.status(201).json({
    success: true,
    data: borrow,
    message: 'Book borrowed successfully'
  });
});

exports.returnBook = catchAsync(async (req, res) => {
  const { borrowId } = req.params;
  const { userId, role } = req.user;
  
  // Find the borrow record
  const borrow = await prisma.borrowHistory.findUnique({
    where: { id: borrowId },
    include: { book: true, student: true }
  });
  
  if (!borrow) {
    throw new ApiError(404, 'Borrow record not found');
  }
  
  // Check if already returned
  if (borrow.returnDate) {
    throw new ApiError(400, 'Book has already been returned');
  }
  
  // Check permissions - student can only return their own books
  if (role === 'STUDENT' && borrow.studentId !== userId) {
    throw new ApiError(403, 'You can only return your own books');
  }
  
  // Update borrow record and book availability
  const updatedBorrow = await prisma.$transaction(async (prisma) => {
    // Update borrow record
    const borrowRecord = await prisma.borrowHistory.update({
      where: { id: borrowId },
      data: {
        returnDate: new Date()
      },
      include: {
        student: {
          select: { name: true, id: true }
        },
        book: {
          select: { title: true, author: true, id: true }
        }
      }
    });
    
    // Update book availability
    await prisma.book.update({
      where: { id: borrow.bookId },
      data: {
        availableCopies: {
          increment: 1
        }
      }
    });
    
    return borrowRecord;
  });
  
  res.status(200).json({
    success: true,
    data: updatedBorrow,
    message: 'Book returned successfully'
  });
});
