const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { catchAsync, NotFoundError, ConflictError } = require('../middlewares/errorHandler');

const prisma = new PrismaClient();

exports.getStudents = catchAsync(async (req, res) => {
  // Get the authenticated user from the request (set by auth middleware)
  const userId = req.user.id;
  const userRole = req.user.role;
  
  let students;
  
  if (userRole === 'LIBRARY_OWNER') {
    // For library owners, only show students from their library
    const adminLibrary = await prisma.library.findFirst({
      where: { adminId: userId }
    });
    
    if (!adminLibrary) {
      // No library exists for this admin - return empty list
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        message: 'No library found. Please contact support to set up your library.'
      });
    }
    
    // Get students from this admin's library
    students = await prisma.student.findMany({
      where: {
        libraryId: adminLibrary.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        registrationNumber: true,
        subscriptionPlan: true,
        paymentStatus: true,
        joinDate: true,
        dueDate: true,
        library: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
      }
    });
  } else {
    // For students, they can only see themselves (if needed)
    students = await prisma.student.findMany({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        registrationNumber: true,
        subscriptionPlan: true,
        paymentStatus: true,
        joinDate: true,
        dueDate: true,
        library: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
      }
    });
  }
  
  res.json({
    success: true,
    data: students,
    count: students.length
  });
});

exports.createStudent = catchAsync(async (req, res) => {
  // Whitelist expected fields and log keys for debugging
  console.log('createStudent request body keys:', Object.keys(req.body));
  const { 
    name, 
    email, 
    phone, 
    password, 
    registrationNumber, 
    aadharReference, 
    subscriptionPlan = 'MONTHLY',
    paymentStatus = 'PENDING'
  } = req.body;

  // Get the authenticated user from the request (set by auth middleware)
  const userId = req.user.id;
  const userRole = req.user.role;
  
  if (userRole !== 'LIBRARY_OWNER') {
    return res.status(403).json({
      success: false,
      error: 'Only library owners can create student accounts'
    });
  }

  // Get the library for this admin - must exist
  const adminLibrary = await prisma.library.findFirst({
    where: { adminId: userId }
  });
  
  if (!adminLibrary) {
    return res.status(400).json({
      success: false,
      error: 'You must create a library before adding students. Please contact support to set up your library.'
    });
  }

  // Hash password only if provided (for library owner creation, password is optional)
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  // Check if student already exists with this email
  const existingStudent = await prisma.student.findUnique({
    where: { email },
    include: { library: true }
  });

  let student;

  if (existingStudent) {
    // Student exists, update them to join this library
    if (existingStudent.libraryId && existingStudent.libraryId !== adminLibrary.id) {
      return res.status(400).json({
        success: false,
        message: `Student is already enrolled in another library: ${existingStudent.library?.name || 'Unknown Library'}`
      });
    }

    // Update existing student to join this library
    const updateData = {
      libraryId: adminLibrary.id,
      subscriptionPlan,
      paymentStatus,
      // Update other fields if they're different
      ...(name !== existingStudent.name && { name }),
      ...(phone !== existingStudent.phone && { phone }),
      ...(registrationNumber !== existingStudent.registrationNumber && { registrationNumber }),
      ...(aadharReference !== existingStudent.aadharReference && { aadharReference }),
      // Only update password if provided and student doesn't have one
      ...(hashedPassword && !existingStudent.password && { password: hashedPassword })
    };

    student = await prisma.student.update({
      where: { id: existingStudent.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        registrationNumber: true,
        subscriptionPlan: true,
        paymentStatus: true,
        joinDate: true,
        dueDate: true,
        library: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Student successfully added to your library!',
      data: student
    });
  } else {
    // Student doesn't exist, create new one
    const studentData = {
      name,
      email,
      phone,
      registrationNumber,
      aadharReference,
      libraryId: adminLibrary.id,
      subscriptionPlan,
      paymentStatus
    };

    // Only include password if provided
    if (hashedPassword) {
      studentData.password = hashedPassword;
    }

    student = await prisma.student.create({
      data: studentData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        registrationNumber: true,
        subscriptionPlan: true,
        paymentStatus: true,
        joinDate: true,
        dueDate: true,
        library: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
      }
    });
  }

  res.status(201).json({
    success: true,
    data: student,
    message: 'Student created successfully'
  });
});

exports.updateStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  // Whitelist allowed update fields to avoid saving unexpected keys
  const allowedFields = ['name', 'phone', 'password', 'registrationNumber', 'subscriptionPlan', 'paymentStatus', 'dueDate', 'address'];
  const updateData = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) updateData[key] = req.body[key];
  }

  // Hash password if it's being updated
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const student = await prisma.student.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      registrationNumber: true,
      subscriptionPlan: true,
      paymentStatus: true,
      joinDate: true,
      dueDate: true,
      library: {
        select: {
          id: true,
          name: true,
          description: true
        }
      },
      // Exclude password from response
    }
  });

  if (!student) {
    throw new NotFoundError('Student not found');
  }

  res.json({
    success: true,
    data: student,
    message: 'Student updated successfully'
  });
});

exports.deleteStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    throw new NotFoundError('Student not found');
  }

  await prisma.student.delete({ where: { id } });
  
  res.json({
    success: true,
    message: 'Student deleted successfully'
  });
});

// Get books available to student
exports.getStudentBooks = catchAsync(async (req, res) => {
  const studentId = req.user.userId || req.user.id;
  
  // For development mode, show all books without reading progress for new student
  if (process.env.NODE_ENV === 'development' && studentId === 'dev-user-1') {
    // Get the first library for development
    const library = await prisma.library.findFirst();
    const libraryId = library ? library.id : null;
    
    if (!libraryId) {
      return res.json({
        success: true,
        data: [],
        message: 'No library found'
      });
    }
    
    // Get all books from the library without any borrow history
    const books = await prisma.book.findMany({
      where: { libraryId },
      include: {
        library: {
          select: { name: true, id: true }
        }
      }
    });
    
    // Return books without any reading progress (new student hasn't borrowed anything)
    const booksForNewStudent = books.map(book => ({
      ...book,
      isCompleted: false,
      isCurrentlyReading: false,
      readingProgress: 0,
      borrowDate: null,
      dueDate: null,
      returnDate: null,
      isWishlisted: false
    }));
    
    return res.json({
      success: true,
      data: booksForNewStudent,
      message: 'Books available for new student'
    });
  }
  
  // For real students, get their library and borrow history
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { libraryId: true }
  });
  
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student account not found. You may need to register with a library first.',
      error: 'Student not found'
    });
  }
  
  // Get books from student's library
  const books = await prisma.book.findMany({
    where: { libraryId: student.libraryId },
    include: {
      library: {
        select: { name: true, id: true }
      },
      borrowHistory: {
        where: { studentId },
        orderBy: { borrowDate: 'desc' },
        take: 1,
        select: {
          status: true,
          borrowDate: true,
          returnDate: true,
          dueDate: true
        }
      }
    }
  });
  
  // Add reading progress and status based on borrow history
  const booksWithProgress = books.map(book => {
    const latestBorrow = book.borrowHistory[0];
    
    return {
      ...book,
      isCompleted: latestBorrow?.status === 'RETURNED',
      isCurrentlyReading: latestBorrow?.status === 'BORROWED',
      readingProgress: latestBorrow?.status === 'BORROWED' ? Math.floor(Math.random() * 80) + 20 : 
                      latestBorrow?.status === 'RETURNED' ? 100 : 0,
      borrowDate: latestBorrow?.borrowDate,
      dueDate: latestBorrow?.dueDate,
      returnDate: latestBorrow?.returnDate,
      isWishlisted: false // This could be implemented with a separate wishlist table
    };
  });
  
  res.json({
    success: true,
    data: booksWithProgress,
    message: 'Student books fetched successfully'
  });
});

// Get dashboard data for student
exports.getDashboardData = catchAsync(async (req, res) => {
  const studentId = req.user.id;
  const userRole = req.user.role;
  
  // Only students can access their dashboard
  if (userRole !== 'STUDENT') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only students can access dashboard data.',
      error: 'Forbidden'
    });
  }
  
  return exports.getDashboardDataForStudent(req, res, studentId);
});

// Helper function to get dashboard data for a specific student
exports.getDashboardDataForStudent = catchAsync(async (req, res, studentId) => {
  // Get student info with library details
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      library: {
        select: {
          id: true,
          name: true,
          description: true,
          address: true,
          phone: true
        }
      }
    }
  });
  
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student account not found. You may need to register with a library first.',
      error: 'Student not found'
    });
  }

  // If student exists but has no library, return "no library joined" state
  if (!student.library) {
    return res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          registrationNumber: student.registrationNumber,
          subscriptionPlan: null,
          paymentStatus: 'PENDING',
          joinDate: student.joinDate,
          dueDate: null
        },
        library: null, // No library joined
        stats: {
          totalBooks: 0,
          completedBooks: 0,
          currentlyReading: 0,
          wishlistedBooks: 0
        },
        currentBorrows: [],
        completedBooks: []
      },
      message: 'Student account found but no library joined'
    });
  }

  // Student has a library - fetch full dashboard data
  // Get borrow statistics
  const borrowStats = await prisma.borrowHistory.groupBy({
    by: ['status'],
    where: { studentId },
    _count: { status: true }
  });
  
  // Get total books in student's library
  const totalBooksInLibrary = await prisma.book.count({
    where: { libraryId: student.libraryId }
  });
  
  // Get current borrows
  const currentBorrows = await prisma.borrowHistory.findMany({
    where: { 
      studentId,
      status: 'BORROWED'
    },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          author: true,
          coverUrl: true
        }
      }
    }
  });
  
  // Get completed books
  const completedBooks = await prisma.borrowHistory.findMany({
    where: { 
      studentId,
      status: 'RETURNED'
    },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          author: true,
          coverUrl: true
        }
      }
    }
  });
  
  // Calculate statistics
  const stats = {
    totalBooks: totalBooksInLibrary,
    completedBooks: completedBooks.length,
    currentlyReading: currentBorrows.length,
    wishlistedBooks: 0 // TODO: Implement wishlist functionality
  };
  
  res.json({
    success: true,
    data: {
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        registrationNumber: student.registrationNumber,
        subscriptionPlan: student.subscriptionPlan,
        paymentStatus: student.paymentStatus,
        joinDate: student.joinDate,
        dueDate: student.dueDate
      },
      library: student.library,
      stats,
      currentBorrows,
      completedBooks: completedBooks.slice(0, 5) // Latest 5 completed books
    },
    message: 'Dashboard data fetched successfully'
  });
});

// Get recent activity for student
exports.getRecentActivity = catchAsync(async (req, res) => {
  const studentId = req.user.userId || req.user.id;
  
  // For development mode, return empty activity for new student
  if (process.env.NODE_ENV === 'development' && studentId === 'new-student-dev') {
    return res.json({
      success: true,
      data: [],
      message: 'No reading activity yet - start exploring books!'
    });
  }
  
  // For real students, get actual activity
  let actualStudentId = studentId;
  
  const recentActivity = await prisma.borrowHistory.findMany({
    where: { studentId: actualStudentId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      book: {
        select: {
          title: true,
          author: true,
          coverUrl: true
        }
      }
    }
  });
  
  // Format activity data
  const formattedActivity = recentActivity.map(activity => ({
    id: activity.id,
    action: activity.status === 'BORROWED' ? 'Started reading' : 'Completed',
    book: activity.book.title,
    author: activity.book.author,
    time: activity.status === 'BORROWED' ? activity.borrowDate : activity.returnDate,
    timeAgo: getTimeAgo(activity.status === 'BORROWED' ? activity.borrowDate : activity.returnDate)
  }));
  
  res.json({
    success: true,
    data: formattedActivity,
    message: 'Recent activity fetched successfully'
  });
});

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMins < 60) {
    return `${diffInMins} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else {
    return `${diffInDays} days ago`;
  }
}