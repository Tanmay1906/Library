const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Check if we have real email credentials configured
      const hasRealEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
      
      if (hasRealEmailConfig) {
        // Use real email service (Gmail, Outlook, etc.)
        this.transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
        console.log('📧 Real email service initialized with', process.env.EMAIL_SERVICE || 'gmail');
      } else {
        // Development configuration using Ethereal Email (test emails)
        try {
          // Create test account for development
          const testAccount = await nodemailer.createTestAccount();
          this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass
            }
          });
          console.log('📧 Development email service initialized with Ethereal Email');
          console.log('⚠️  Note: Ethereal emails are for testing only and won\'t reach real inboxes');
          console.log('💡 To send real emails, set EMAIL_USER and EMAIL_PASSWORD environment variables');
        } catch (error) {
          console.log('⚠️ Failed to create test account, using fallback config');
          // Fallback configuration
          this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: 'ethereal.user@ethereal.email',
              pass: 'ethereal.password'
            }
          });
        }
      }

      // Verify transporter configuration
      if (this.transporter) {
        this.transporter.verify((error, success) => {
          if (error) {
            console.log('Email transporter verification failed:', error.message);
          } else {
            console.log('✅ Email service is ready to send messages');
          }
        });
      }

    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendOTPEmail(email, otp) {
    try {
      // Ensure transporter is ready
      if (!this.transporter) {
        console.log('📧 Transporter not ready, initializing...');
        await this.initializeTransporter();
        // Give it a moment to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || '"LibraryMate" <noreply@librarymate.com>',
        to: email,
        subject: 'LibraryMate - Your OTP Code',
        html: this.generateOTPEmailTemplate(otp),
        text: `Your LibraryMate OTP code is: ${otp}. This code will expire in 5 minutes.`
      };

      console.log('📧 Attempting to send OTP email to:', email);
      console.log('📧 Using email service:', process.env.EMAIL_SERVICE || 'ethereal');
      
      const info = await this.transporter.sendMail(mailOptions);
      
      const previewURL = nodemailer.getTestMessageUrl(info);
      
      console.log('✅ OTP email sent successfully:', {
        messageId: info.messageId,
        email: email,
        previewURL: previewURL || 'Not available (real email sent)'
      });

      if (previewURL) {
        console.log('🔗 Test email preview: ' + previewURL);
        console.log('⚠️  This is a test email. To send real emails, configure EMAIL_USER and EMAIL_PASSWORD in .env file');
      } else {
        console.log('📫 Real email sent to: ' + email);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewURL: previewURL
      };

    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateOTPEmailTemplate(otp) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LibraryMate OTP</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e9ecef;
          }
          .otp-code {
            background: #fff;
            border: 2px dashed #667eea;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📚 LibraryMate</h1>
          <p>Your OTP Verification Code</p>
        </div>
        
        <div class="content">
          <h2>Hello!</h2>
          <p>We received a request to verify your email address for LibraryMate. Use the following OTP code to complete your verification:</p>
          
          <div class="otp-code">
            ${otp}
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This code will expire in <strong>5 minutes</strong></li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this code, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you're having trouble, please contact our support team.</p>
          
          <p>Best regards,<br>The LibraryMate Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(email, name) {
    try {
      // Ensure transporter is ready
      if (!this.transporter) {
        await this.initializeTransporter();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || '"LibraryMate" <noreply@librarymate.com>',
        to: email,
        subject: 'Welcome to LibraryMate!',
        html: this.generateWelcomeEmailTemplate(name),
        text: `Welcome to LibraryMate, ${name}! Your account has been successfully verified.`
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('Welcome email sent successfully:', {
        messageId: info.messageId,
        email: email
      });

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateWelcomeEmailTemplate(name) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to LibraryMate</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e9ecef;
          }
          .welcome-message {
            background: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📚 LibraryMate</h1>
          <p>Welcome to our community!</p>
        </div>
        
        <div class="content">
          <h2>Hello ${name}!</h2>
          
          <div class="welcome-message">
            <strong>🎉 Congratulations!</strong> Your LibraryMate account has been successfully verified and activated.
          </div>
          
          <p>You can now enjoy all the features of LibraryMate:</p>
          <ul>
            <li>📖 Browse and borrow books</li>
            <li>🔔 Receive reminders for due dates</li>
            <li>📊 Track your reading history</li>
            <li>💬 And much more!</li>
          </ul>
          
          <p>Thank you for joining LibraryMate. We're excited to have you as part of our community!</p>
          
          <p>Happy reading!<br>The LibraryMate Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
  }
}

const emailService = new EmailService();

// Export the transporter for development use
if (process.env.NODE_ENV === 'development') {
  module.exports.transporter = emailService.transporter;
}

module.exports = emailService;