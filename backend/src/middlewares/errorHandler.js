const { Prisma } = require('@prisma/client');

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Backwards-compatible ApiError wrapper: some controllers call ApiError(statusCode, message)
class ApiError extends AppError {
  constructor(a, b) {
    // Support both (message, statusCode) and (statusCode, message)
    if (typeof a === 'number') {
      // called as ApiError(statusCode, message)
      super(b || 'Error', a || 500);
    } else {
      // called as ApiError(message, statusCode)
      super(a || 'Error', b || 500);
    }
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

// Handle Prisma errors
const handlePrismaError = (error) => {
  // Log full Prisma error server-side for debugging (will not be sent to clients in production)
  try {
    console.error('Prisma error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
  } catch (logErr) {
    // If logging fails, at least print the original error
    console.error('Failed to serialize Prisma error for logging', logErr);
    console.error(error);
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint failed
        const field = error.meta?.target?.[0] || 'field';
        return new ConflictError(`${field} already exists`);
      
      case 'P2025':
        // Record not found
        return new NotFoundError('Record not found');
      
      case 'P2003':
        // Foreign key constraint failed
        return new ValidationError('Invalid reference to related record');
      
      case 'P2014':
        // Required relation missing
        return new ValidationError('Required relation is missing');
      
      default:
        // For unknown Prisma errors, log the code and return a generic message
        return new AppError('Database operation failed', 500);
    }
  }
  
  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError('Invalid data provided');
  }
  
  return error;
};

// Handle JWT errors
const handleJWTError = () =>
  new AuthenticationError('Invalid token. Please log in again.');

const handleJWTExpiredError = () =>
  new AuthenticationError('Your token has expired. Please log in again.');

// Send error response in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Send error response in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (err instanceof Prisma.PrismaClientKnownRequestError || err instanceof Prisma.PrismaClientValidationError) {
      error = handlePrismaError(err);
    }

    sendErrorProd(error, res);
  }
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  // Backwards-compatible alias: some controllers expect ApiError
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  globalErrorHandler,
  catchAsync
};
