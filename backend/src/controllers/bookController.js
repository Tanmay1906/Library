const { PrismaClient } = require('@prisma/client');
const catchAsync = require('../middlewares/errorHandler').catchAsync;
const ApiError = require('../middlewares/errorHandler').ApiError;
const prisma = new PrismaClient();

exports.getBooks = catchAsync(async (req, res) => {
  const books = await prisma.book.findMany({ 
    include: { 
      library: {
        select: { name: true, id: true }
      }, 
      borrowHistory: {
        include: {
          student: {
            select: { name: true, id: true }
          }
        }
      }
    } 
  });

  res.status(200).json({
    success: true,
    data: books,
    message: 'Books fetched successfully'
  });
});

exports.getBook = catchAsync(async (req, res) => {
  const { id } = req.params;
  const book = await prisma.book.findUnique({
    where: { id },
    include: { 
      library: true, 
      borrowHistory: {
        include: {
          student: {
            select: { name: true, id: true }
          }
        }
      }
    }
  });
  
  if (!book) {
    throw new ApiError(404, 'Book not found');
  }
  
  res.status(200).json({
    success: true,
    data: book,
    message: 'Book fetched successfully'
  });
});

exports.createBook = catchAsync(async (req, res) => {
  const book = await prisma.book.create({
    data: req.body,
    include: {
      library: true
    }
  });
  
  res.status(201).json({
    success: true,
    data: book,
    message: 'Book created successfully'
  });
});

exports.updateBook = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  // Check if book exists first
  const existingBook = await prisma.book.findUnique({
    where: { id }
  });
  
  if (!existingBook) {
    throw new ApiError(404, 'Book not found');
  }
  
  const book = await prisma.book.update({
    where: { id },
    data: req.body,
    include: {
      library: true
    }
  });
  
  res.status(200).json({
    success: true,
    data: book,
    message: 'Book updated successfully'
  });
});

exports.deleteBook = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  // Check if book exists first
  const existingBook = await prisma.book.findUnique({
    where: { id }
  });
  
  if (!existingBook) {
    throw new ApiError(404, 'Book not found');
  }
  
  await prisma.book.delete({
    where: { id }
  });
  
  res.status(200).json({
    success: true,
    message: 'Book deleted successfully'
  });
});
