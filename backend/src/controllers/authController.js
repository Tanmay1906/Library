const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');
const catchAsync = require('../middlewares/errorHandler').catchAsync;
const ApiError = require('../middlewares/errorHandler').ApiError;
const prisma = new PrismaClient();

exports.login = catchAsync(async (req, res) => {
    const { email, password, role } = req.body;
    let user;
    
    // Use enum-safe role checking
    if (role === 'admin' || role === 'owner') {
      user = await prisma.admin.findUnique({ where: { email } });
    } else if (role === 'student') {
      user = await prisma.student.findFirst({ 
        where: { 
          email,
          password: { not: null } // Only allow login for activated accounts
        },
        include: { library: true }
      });
    } else {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid role specified' 
      });
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: role === 'student' ? 'Account not found or not activated. Please activate your account first.' : 'User not found'
      });
    }
    
    if (!user.password) {
      return res.status(401).json({
        success: false,
        error: 'Account not activated. Please activate your account first.'
      });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Direct login without OTP - generate JWT token immediately
    const token = jwt.sign(
      { id: user.id, role: role === 'admin' ? 'LIBRARY_OWNER' : role.toUpperCase() }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: role === 'admin' ? 'LIBRARY_OWNER' : role.toUpperCase(),
      libraryId: user.libraryId,
      phone: user.phone,
      registrationNumber: user.registrationNumber
    };

    res.status(200).json({ 
      success: true, 
      data: {
        token,
        user: userData
      },
      user: userData,
      message: 'Login successful'
    });
});

// Email-based login with OTP
exports.loginWithOTP = catchAsync(async (req, res) => {
    const { email, role } = req.body;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    let user;
    
    // Use enum-safe role checking
    if (role === 'admin' || role === 'owner') {
      user = await prisma.admin.findUnique({ where: { email } });
    } else if (role === 'student') {
      user = await prisma.student.findFirst({ 
        where: { 
          email,
          password: { not: null } // Only allow login for activated accounts
        },
        include: { library: true }
      });
    } else {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid role specified' 
      });
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: role === 'student' ? 'Account not found or not activated. Please activate your account first.' : 'User not found'
      });
    }
    
    if (!user.password) {
      return res.status(401).json({
        success: false,
        error: 'Account not activated. Please activate your account first.'
      });
    }
    
        // Generate and send OTP
    const code = otpService.generateOTP();
    const result = await otpService.sendOTPEmail(email, code);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }
    
    // Store OTP in database for tracking
    await prisma.oTP.create({
      data: {
        phone: email, // Using email field for email OTPs
        code,
        expiresAt: new Date(Date.now() + 1000 * 60 * (process.env.OTP_EXPIRY_MINUTES || 5)),
        role: role === 'admin' ? 'ADMIN' : role === 'owner' ? 'OWNER' : 'STUDENT'
      }
    });
    
    res.status(200).json({ 
      success: true, 
      message: 'OTP sent to your email. Please verify to complete login.',
      email: email,
      // Include preview URL for development/testing
      ...(result.previewURL && { previewURL: result.previewURL })
    });
});

// Complete login after OTP verification
exports.completeLoginWithOTP = catchAsync(async (req, res) => {
    const { email, code, role } = req.body;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Verify OTP first
    const verification = await otpService.verifyOTP(email, code);
    
    if (!verification.success) {
      return res.status(400).json({ 
        success: false,
        message: verification.message 
      });
    }
    
    // OTP verified, now get user and generate token
    let user;
    
    if (role === 'admin' || role === 'owner') {
      user = await prisma.admin.findUnique({ where: { email } });
      // Update last login timestamp
      await prisma.admin.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
    } else if (role === 'student') {
      user = await prisma.student.findFirst({ 
        where: { 
          email,
          password: { not: null }
        },
        include: { library: true }
      });
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found'
      });
    }
    
    // Normalize role for JWT token
    const normalizedRole = role === 'admin' || role === 'owner' ? 'LIBRARY_OWNER' : 'STUDENT';
    
    const token = jwt.sign(
      { id: user.id, role: normalizedRole }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: normalizedRole,
      ...(role === 'student' && { 
        libraryId: user.libraryId,
        registrationNumber: user.registrationNumber 
      }),
      ...(normalizedRole === 'LIBRARY_OWNER' && {
        libraryId: user.libraryId || user.id
      })
    };
    
    res.status(200).json({ 
      success: true,
      data: {
        token, 
        user: userData
      }, 
      user: userData,
      message: 'Login successful'
    });
});

// Complete standard login after OTP verification (mandatory OTP flow)
exports.completeLogin = catchAsync(async (req, res) => {
    const { email, code, role } = req.body;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Verify OTP first
    const verification = await otpService.verifyOTP(email, code);
    
    if (!verification.success) {
      return res.status(400).json({ 
        success: false,
        message: verification.message 
      });
    }
    
    // OTP verified, now get user and generate token
    let user;
    
    if (role === 'admin' || role === 'owner') {
      user = await prisma.admin.findUnique({ where: { email } });
      // Update last login timestamp
      await prisma.admin.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
    } else if (role === 'student') {
      user = await prisma.student.findFirst({ 
        where: { 
          email,
          password: { not: null }
        },
        include: { library: true }
      });
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found'
      });
    }
    
    // Normalize role for JWT token
    const normalizedRole = role === 'admin' || role === 'owner' ? 'LIBRARY_OWNER' : 'STUDENT';
    
    const token = jwt.sign(
      { id: user.id, role: normalizedRole }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: normalizedRole,
      ...(role === 'student' && { 
        libraryId: user.libraryId,
        registrationNumber: user.registrationNumber 
      }),
      ...(normalizedRole === 'LIBRARY_OWNER' && {
        libraryId: user.libraryId || user.id
      })
    };
    
    res.status(200).json({ 
      success: true,
      data: {
        token, 
        user: userData
      }, 
      user: userData,
      message: 'Login successful'
    });
});

exports.signup = catchAsync(async (req, res) => {
    console.log('Signup request received - req.body keys:', Object.keys(req.body));
    // Whitelist only the fields we accept from the client
    const {
      name,
      email,
      phone,
      password,
      role,
      registrationNumber,
      aadharReference,
      libraryId
    } = req.body;
    console.log('Extracted fields:', { name, email, phone, role, registrationNumber, aadharReference, libraryId });
    const hashed = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    
  if (role === 'admin') {
      console.log('Creating admin account...');
      
      // Check if email already exists
      const existingAdmin = await prisma.admin.findUnique({
        where: { email }
      });
      
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered. Please use a different email or try logging in.'
        });
      }

      // Check if phone number already exists
      const existingAdminPhone = await prisma.admin.findFirst({
        where: { phone }
      });
      
      if (existingAdminPhone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already registered. Please use a different phone number.'
        });
      }
      
      const admin = await prisma.admin.create({ 
        data: { name, email, phone, password: hashed } 
      });

      // Auto-create a library for this admin
      const { libraryName, libraryAddress, libraryDescription } = req.body;
      const createdLibrary = await prisma.library.create({
        data: {
          name: libraryName || `${name}'s Library`,
          address: libraryAddress || '',
          description: libraryDescription || '',
          phone: phone || '',
          adminId: admin.id
        }
      });
      
      // Generate JWT token for immediate login
      const token = jwt.sign(
        { id: admin.id, role: 'LIBRARY_OWNER' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );

      const userData = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: 'LIBRARY_OWNER',
        libraryId: createdLibrary.id
      };

      return res.status(201).json({ 
        success: true, 
        token,
        user: userData,
        message: 'Admin registered successfully!' 
      });
  } else if (role === 'student') {
      console.log('Creating student account...');
      
      // Check if email already exists
      const existingStudent = await prisma.student.findUnique({
        where: { email }
      });
      
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered. Please use a different email or try logging in.'
        });
      }

      // Check if registration number already exists
      const existingRegistration = await prisma.student.findUnique({
        where: { registrationNumber }
      });
      
      if (existingRegistration) {
        return res.status(400).json({
          success: false,
          error: 'Registration number already exists. Please use a different registration number.'
        });
      }

      // Check if phone number already exists
      const existingPhone = await prisma.student.findFirst({
        where: { phone }
      });
      
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already registered. Please use a different phone number.'
        });
      }
      
      // If libraryId is provided, validate it exists
      if (libraryId) {
        const library = await prisma.library.findUnique({
          where: { id: libraryId.toString() }
        });
        
        if (!library) {
          return res.status(400).json({
            success: false,
            error: 'Selected library does not exist'
          });
        }
      }
      
      const studentData = {
        name,
        email,
        phone,
        password: hashed,
        registrationNumber,
        aadharReference,
        subscriptionPlan: 'MONTHLY',
        libraryId: libraryId || null,
        paymentStatus: 'PENDING',
        dueDate: null
      };

      const student = await prisma.student.create({
        data: studentData,
        include: {
          library: true
        }
      });

      // Generate JWT token for immediate login
      const token = jwt.sign(
        { id: student.id, role: 'STUDENT' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );

      const userData = {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        role: 'STUDENT',
        registrationNumber: student.registrationNumber,
        subscriptionPlan: student.subscriptionPlan,
        libraryId: student.libraryId,
        library: student.library
      };

      console.log('About to send response...');
      return res.status(201).json({ 
        success: true, 
        token,
        user: userData,
        message: libraryId ? 'Student registered successfully!' : 'Student registered successfully! You can join a library later.' 
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be either "admin" or "student"'
      });
    }
});

exports.sendOTP = catchAsync(async (req, res) => {
    const { phone, role } = req.body;
    const code = otpService.generateOTP();
    await otpService.sendOTP(phone, code);
    
    await prisma.oTP.create({
      data: {
        phone,
        code,
        expiresAt: new Date(Date.now() + 1000 * 60 * (process.env.OTP_EXPIRY_MINUTES || 5)),
        role: role === 'admin' ? 'ADMIN' : role === 'owner' ? 'OWNER' : 'STUDENT'
      }
    });
    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully' 
    });
});

exports.verifyOTP = catchAsync(async (req, res) => {
    const { phone, code } = req.body;
    
    // Use OTP service for verification
    const verification = await otpService.verifyOTP(phone, code);
    
    if (!verification.success) {
      return res.status(400).json({ 
        success: false,
        message: verification.message 
      });
    }
    
    res.status(200).json({ 
      success: true,
      data: null,
      message: verification.message 
    });
});

// Email-based OTP endpoints
exports.sendOTPEmail = catchAsync(async (req, res) => {
    const { email, role } = req.body;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Check if user exists with this email
    let userExists = false;
    if (role === 'student') {
      const student = await prisma.student.findUnique({ where: { email } });
      userExists = !!student;
    } else if (role === 'admin' || role === 'owner') {
      const admin = await prisma.admin.findUnique({ where: { email } });
      userExists = !!admin;
    }
    
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }
    
    const code = otpService.generateOTP();
    const result = await otpService.sendOTPEmail(email, code);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message
      });
    }
    
    // Store OTP in database for tracking
    await prisma.oTP.create({
      data: {
        phone: email, // Using email field for email OTPs
        code,
        expiresAt: new Date(Date.now() + 1000 * 60 * (process.env.OTP_EXPIRY_MINUTES || 5)),
        role: role === 'admin' ? 'ADMIN' : role === 'owner' ? 'OWNER' : 'STUDENT'
      }
    });
    
    res.status(200).json({ 
      success: true, 
      message: 'OTP sent to your email successfully',
      // Include preview URL for development/testing
      ...(result.previewURL && { previewURL: result.previewURL })
    });
});

exports.verifyOTPEmail = catchAsync(async (req, res) => {
    const { email, code } = req.body;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Use OTP service for verification
    const verification = await otpService.verifyOTP(email, code);
    
    if (!verification.success) {
      return res.status(400).json({ 
        success: false,
        message: verification.message 
      });
    }
    
    res.status(200).json({ 
      success: true,
      data: null,
      message: verification.message 
    });
});

// Token verification endpoint
exports.verify = catchAsync(async (req, res) => {
    // Token is already verified in middleware, just return user info
    const userId = req.user.id;
    const role = req.user.role;
    
    let user;
    if (role === 'admin' || role === 'owner') {
      user = await prisma.admin.findUnique({ 
        where: { id: userId },
        select: { id: true, name: true, email: true, phone: true }
      });
    } else {
      user = await prisma.student.findUnique({ 
        where: { id: userId },
        select: { id: true, name: true, email: true, phone: true, libraryId: true, registrationNumber: true }
      });
    }
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    res.status(200).json({ 
      success: true,
      data: { ...user, role },
      message: 'Token verified successfully'
    });
});

// Complete signup after OTP verification
exports.completeSignup = catchAsync(async (req, res) => {
    // Whitelist fields from request body
    const {
      name,
      email,
      phone,
      password,
      role,
      registrationNumber,
      aadharReference,
      libraryId
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let newUser;
    
    if (role === 'admin' || role === 'owner') {
      newUser = await prisma.admin.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword
        }
      });
    } else {
      newUser = await prisma.student.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          registrationNumber,
          aadharReference,
          libraryId,
          subscriptionPlan: 'MONTHLY',
          paymentStatus: 'PENDING'
        }
      });
    }
    
    const token = jwt.sign(
      { id: newUser.id, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role
        }
      },
      message: 'Signup completed successfully'
    });
});

// Student account activation - verify details and set password
exports.activateStudent = catchAsync(async (req, res) => {
  const { email, name, registrationNumber, aadharReference, password } = req.body;
  
  // Find student with matching details but no password (inactive account)
  const student = await prisma.student.findFirst({
    where: {
      email,
      name,
      registrationNumber,
      aadharReference,
      password: null // Only inactive accounts
    },
    include: { library: true }
  });
  
  if (!student) {
    return res.status(404).json({
      success: false,
      error: 'No matching student record found or account already activated. Please verify your details match exactly what the library owner provided.'
    });
  }
  
  // Hash the new password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Activate the account by setting the password
  const activatedStudent = await prisma.student.update({
    where: { id: student.id },
    data: { password: hashedPassword },
    select: {
      id: true,
      name: true,
      email: true,
      registrationNumber: true,
      joinDate: true,
      library: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  
  // Generate JWT token
  const token = jwt.sign(
    { 
      id: activatedStudent.id, 
      role: 'STUDENT'
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: activatedStudent.id,
        name: activatedStudent.name,
        email: activatedStudent.email,
        role: 'STUDENT',
        libraryId: activatedStudent.library?.id,
        registrationNumber: activatedStudent.registrationNumber
      }
    },
    message: 'Student account activated successfully'
  });
});
