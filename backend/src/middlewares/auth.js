const jwt = require('jsonwebtoken');

// Define permissions for each role
const permissions = {
  LIBRARY_OWNER: [
    'read:students', 'write:students', 'delete:students',
    'read:library', 'write:library', 'delete:library',
    'read:books', 'write:books', 'delete:books',
    'read:payments', 'write:payments',
    'read:reports', 'write:reports',
    'read:notifications', 'write:notifications'
  ],
  ADMIN: [
    'read:students', 'write:students', 'delete:students',
    'read:library', 'write:library', 'delete:library',
    'read:books', 'write:books', 'delete:books',
    'read:payments', 'write:payments',
    'read:reports', 'write:reports',
    'read:notifications', 'write:notifications'
  ],
  STUDENT: [
    'read:books', 'read:profile', 'write:profile',
    'read:payments:own', 'write:payments:own',
    'read:borrowings:own', 'write:borrowings:own'
  ]
};

exports.authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied', 
      message: 'No token provided. Please log in to access this resource.' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Map role to uppercase for consistency
    const role = decoded.role?.toUpperCase();
    if (role === 'ADMIN' || role === 'OWNER') {
      decoded.role = 'LIBRARY_OWNER';
    } else if (role === 'STUDENT') {
      decoded.role = 'STUDENT';
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired', 
        message: 'Your session has expired. Please log in again.' 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token', 
        message: 'Invalid authentication token. Please log in again.' 
      });
    } else {
      return res.status(401).json({ 
        error: 'Authentication failed', 
        message: 'Token verification failed. Please log in again.' 
      });
    }
  }
};

// Optional authentication - doesn't fail if no token provided
exports.optionalAuthenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    // No token provided, continue without user
    req.user = null;
    return next();
  }
  
  // Development mode: accept mock tokens
  if (process.env.NODE_ENV === 'development' && token === 'mock-jwt-token-for-development') {
    req.user = {
      id: 'dev-user-1',
      role: 'admin',
      email: 'admin@library.com',
      name: 'Development User'
    };
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Invalid token, continue without user
    req.user = null;
    next();
  }
};

exports.authorize = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: `Access denied. Required roles: ${roles.join(', ')}` 
    });
  }
  
  next();
};

exports.requirePermission = (permission) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const userPermissions = permissions[req.user.role] || [];
  
  if (!userPermissions.includes(permission)) {
    return res.status(403).json({ 
      error: 'Insufficient permissions', 
      message: `Required permission: ${permission}` 
    });
  }
  
  next();
};

// Check if user owns the resource (for student-specific resources)
exports.checkOwnership = (resourceField = 'studentId') => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Library owners can access all resources
  if (req.user.role === 'LIBRARY_OWNER') {
    return next();
  }
  
  // Students can only access their own resources
  const resourceId = req.params[resourceField] || req.body[resourceField];
  if (req.user.role === 'STUDENT' && req.user.id !== resourceId) {
    return res.status(403).json({ 
      error: 'Access denied', 
      message: 'You can only access your own resources' 
    });
  }
  
  next();
};
