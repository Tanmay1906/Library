const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../services/emailService');
const prisma = new PrismaClient();

// Generate a secure reset token with expiration
const generateResetToken = () => ({
  token: uuidv4(),
  expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
});

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    console.log('Sending password reset email to:', email);
    console.log('Reset link:', resetLink);
    
    const emailResult = await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <p>
            <a href="${resetLink}" 
              style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p style="color: #6b7280; font-size: 0.9em;">
            This is an automated message, please do not reply directly to this email.
          </p>
        </div>
      `
    });
    
    console.log('Email sending result:', {
      messageId: emailResult.messageId,
      previewUrl: nodemailer.getTestMessageUrl(emailResult),
      accepted: emailResult.accepted,
      rejected: emailResult.rejected
    });
    
    return emailResult;
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error);
    throw error;
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Check if user exists
    const user = await prisma.student.findUnique({ where: { email } }) || 
                 await prisma.admin.findUnique({ where: { email } });

    if (!user) {
      // For security, don't reveal if email exists or not
      return res.json({ success: true, message: 'If an account exists with this email, you will receive a password reset link.' });
    }

    // Generate and save reset token
    const { token, expiresAt } = generateResetToken();
    
    await prisma.passwordReset.upsert({
      where: { email },
      update: { token, expiresAt },
      create: { email, token, expiresAt }
    });

    // Send reset email
    await sendPasswordResetEmail(email, token);

    // In development, include the Ethereal test account info
    const response = { 
      success: true, 
      message: 'If an account exists with this email, you will receive a password reset link.' 
    };

    if (process.env.NODE_ENV === 'development') {
      // Get the test account info from the transporter
      const { transporter } = require('../services/emailService');
      if (transporter && transporter.options && transporter.options.auth) {
        response.etherealTestAccount = {
          user: transporter.options.auth.user,
          pass: transporter.options.auth.pass,
          web: 'https://ethereal.email/login'
        };
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ success: false, error: 'Failed to process password reset request' });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token and new password are required' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character'
      });
    }

    // Find valid reset token
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
        used: false
      }
    });

    if (!resetRequest) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    const user = await prisma.student.updateMany({
      where: { email: resetRequest.email },
      data: { password: hashedPassword }
    });

    if (user.count === 0) {
      await prisma.admin.updateMany({
        where: { email: resetRequest.email },
        data: { password: hashedPassword }
      });
    }

    // Mark token as used
    await prisma.passwordReset.update({
      where: { email: resetRequest.email },
      data: { used: true }
    });

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword
};
