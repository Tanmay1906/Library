const Joi = require('joi');

// Strong password pattern: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Indian phone number pattern
const phonePattern = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;

// Aadhar number pattern (12 digits)
const aadharPattern = /^\d{12}$/;

exports.validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    }),
    role: Joi.string().valid('admin', 'student', 'owner').required().messages({
      'any.only': 'Role must be either admin, student, or owner',
      'any.required': 'Role is required'
    })
  });
  
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      message: error.details[0].message 
    });
  }
  next();
};

exports.validateSignup = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    phone: Joi.string().pattern(phonePattern).required().messages({
      'string.pattern.base': 'Please provide a valid Indian phone number',
      'any.required': 'Phone number is required'
    }),
    password: Joi.string().pattern(passwordPattern).required().messages({
      'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
    role: Joi.string().valid('admin', 'student', 'owner').required().messages({
      'any.only': 'Role must be either admin, student, or owner',
      'any.required': 'Role is required'
    }),
    registrationNumber: Joi.string().when('role', { 
      is: 'student', 
      then: Joi.string().required().messages({
        'any.required': 'Registration number is required for students'
      }),
      otherwise: Joi.string().allow('').optional()
    }),
    aadharReference: Joi.string().when('role', { 
      is: 'student', 
      then: Joi.string().pattern(aadharPattern).required().messages({
        'string.pattern.base': 'Aadhar number must be exactly 12 digits',
        'any.required': 'Aadhar reference is required for students'
      }),
      otherwise: Joi.string().allow('').optional()
    }),
    libraryId: Joi.alternatives().try(
      Joi.string().allow(''),
      Joi.number().integer().positive(),
      Joi.allow(null)
    ).optional().messages({
      'alternatives.match': 'Library ID must be a valid number or string'
    })
  });
  
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    console.log('Signup validation error details:', error.details);
    console.log('Failed field:', error.details[0].path);
    console.log('Failed value:', error.details[0].context?.value);
    console.log('Error message:', error.details[0].message);
    return res.status(400).json({ 
      error: 'Validation error', 
      message: error.details[0].message 
    });
  }
  next();
};

exports.validateOTP = (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string().pattern(phonePattern).required().messages({
      'string.pattern.base': 'Please provide a valid Indian phone number',
      'any.required': 'Phone number is required'
    }),
    code: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
      'any.required': 'OTP code is required'
    })
  });
  
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      message: error.details[0].message 
    });
  }
  next();
};

exports.validateStudent = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required'
    }),
    phone: Joi.string().pattern(phonePattern).required().messages({
      'string.pattern.base': 'Please provide a valid Indian phone number',
      'any.required': 'Phone number is required'
    }),
    password: Joi.string().pattern(passwordPattern).optional().messages({
      'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
    registrationNumber: Joi.string().required().messages({
      'any.required': 'Registration number is required'
    }),
    aadharReference: Joi.string().pattern(aadharPattern).required().messages({
      'string.pattern.base': 'Aadhar number must be exactly 12 digits',
      'any.required': 'Aadhar reference is required'
    }),
    address: Joi.string().min(5).optional().messages({
      'string.min': 'Address must be at least 5 characters long'
    }),
    subscriptionPlan: Joi.string().valid('MONTHLY', 'QUARTERLY', 'YEARLY').default('MONTHLY'),
    paymentStatus: Joi.string().valid('PENDING', 'PAID', 'OVERDUE', 'CANCELLED').default('PENDING')
  });
  
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      message: error.details[0].message 
    });
  }
  next();
};

// Generic validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: errorMessages.join(', '),
        details: errorMessages
      });
    }
    next();
  };
};

// Export both individual validators and generic validate function
module.exports = validate;
module.exports.validateLogin = exports.validateLogin;
module.exports.validateSignup = exports.validateSignup;
module.exports.validateOTP = exports.validateOTP;
module.exports.validateStudent = exports.validateStudent;
