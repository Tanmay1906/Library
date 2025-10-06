const { PrismaClient } = require('@prisma/client');
const catchAsync = require('../middlewares/errorHandler').catchAsync;
const { AppError } = require('../middlewares/errorHandler');
const prisma = new PrismaClient();

exports.getLibraries = catchAsync(async (req, res) => {
  let libraries;
  
  // Check if user is authenticated
  if (req.user) {
    // Authenticated users get filtered results based on their role
    if (req.user.role === 'admin' || req.user.role === 'ADMIN') {
      libraries = await prisma.library.findMany({
        include: {
          admin: {
            select: { name: true, email: true, phone: true }
          },
          students: true,
          books: true
        }
      });
    } else if (req.user.role === 'LIBRARY_OWNER' || req.user.role === 'owner') {
      libraries = await prisma.library.findMany({
        where: { adminId: req.user.userId },
        include: {
          admin: {
            select: { name: true, email: true, phone: true }
          },
          students: true,
          books: true
        }
      });
    } else if (req.user.role === 'STUDENT' || req.user.role === 'student') {
      // Students can only see basic library info for their library
      libraries = await prisma.library.findMany({
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          description: true
        }
      });
    } else {
      throw new AppError('Unauthorized to view libraries', 403);
    }
  } else {
    // Unauthenticated users get basic public library information for signup
    libraries = await prisma.library.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        description: true,
        phone: true
      }
    });
  }
  
  res.status(200).json({
    success: true,
    data: libraries,
    message: 'Libraries fetched successfully'
  });
});

exports.getLibrary = catchAsync(async (req, res) => {
  const { id } = req.params;
  const library = await prisma.library.findUnique({
    where: { id },
    include: {
      admin: {
        select: { name: true, email: true, phone: true }
      },
      students: true,
      books: true
    }
  });
  
  if (!library) {
    throw new AppError('Library not found', 404);
  }
  
  // Check permissions - library owner can only see their own library
  if (req.user.role === 'LIBRARY_OWNER' && library.adminId !== req.user.userId) {
    throw new AppError('Unauthorized to view this library', 403);
  }
  
  res.status(200).json({
    success: true,
    data: library,
    message: 'Library fetched successfully'
  });
});

exports.createLibrary = catchAsync(async (req, res) => {
  // Only admin can create libraries
  if (req.user.role !== 'ADMIN') {
    throw new AppError('Only admin can create libraries', 403);
  }
  
  const library = await prisma.library.create({
    data: req.body,
    include: {
      admin: {
        select: { name: true, email: true, phone: true }
      }
    }
  });
  
  res.status(201).json({
    success: true,
    data: library,
    message: 'Library created successfully'
  });
});

exports.updateLibrary = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  // Check if library exists first
  const existingLibrary = await prisma.library.findUnique({
    where: { id }
  });
  
  if (!existingLibrary) {
    throw new AppError('Library not found', 404);
  }
  
  // Check permissions - library owner can only update their own library
  if (req.user.role === 'LIBRARY_OWNER' && existingLibrary.adminId !== req.user.userId) {
    throw new AppError('Unauthorized to update this library', 403);
  }
  
  const library = await prisma.library.update({
    where: { id },
    data: req.body,
    include: {
      admin: {
        select: { name: true, email: true, phone: true }
      }
    }
  });
  
  res.status(200).json({
    success: true,
    data: library,
    message: 'Library updated successfully'
  });
});

exports.deleteLibrary = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  // Only admin can delete libraries
  if (req.user.role !== 'ADMIN') {
    throw new AppError('Only admin can delete libraries', 403);
  }
  
  const existingLibrary = await prisma.library.findUnique({
    where: { id }
  });
  
  if (!existingLibrary) {
    throw new AppError('Library not found', 404);
  }
  
  await prisma.library.delete({
    where: { id }
  });
  
  res.status(200).json({
    success: true,
    message: 'Library deleted successfully'
  });
});
