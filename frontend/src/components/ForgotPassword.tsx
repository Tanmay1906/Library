import React, { useState } from 'react';
import { X, Mail, Loader2, CheckCircle, XCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { API_CONFIG } from '../config/api';
import { sendPasswordResetEmail } from '../utils/emailService';

declare global {
  interface Window {
    etherealTestAccount?: {
      user: string;
      pass: string;
      web: string;
    };
  }
}

type ForgotPasswordProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Extract token from URL if present
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get('token');
      if (tokenParam) {
        setToken(tokenParam);
        setStep('reset');
      }
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ text: 'Please enter your email address', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      console.log('=== Starting Password Reset Process ===');
      
      // 1. First, check if the email exists in our system
      console.log('1. Checking if email exists in system...');
      const checkResponse = await fetch(`${API_CONFIG.BASE_URL}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const checkData = await checkResponse.json();
      console.log('Email check response:', checkData);
      
      if (!checkResponse.ok) {
        throw new Error(checkData.error || 'Failed to check email');
      }
      
      // For security, we don't reveal if the email exists or not
      const successMessage = 'If an account exists with this email, you will receive password reset instructions shortly.';
      
      if (!checkData.exists) {
        console.log('Email does not exist in system');
        setMessage({ text: successMessage, type: 'success' });
        return;
      }
      
      console.log('2. Email exists, generating reset token...');
      
      // 2. Generate a reset token
      const tokenResponse = await fetch(`${API_CONFIG.BASE_URL}/auth/generate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const tokenData = await tokenResponse.json();
      console.log('Token generation response:', tokenData);
      
      if (!tokenResponse.ok) {
        throw new Error(tokenData.error || 'Failed to generate reset token');
      }
      
      // 3. Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8); // 8-character random string
      console.log('Generated temporary password:', tempPassword);
      
      // 4. Send email using EmailJS with the temporary password
      console.log('4. Sending email via EmailJS...');
      const resetLink = `${window.location.origin}/reset-password?token=${tokenData.token}`;
      console.log('Generated reset link:', resetLink);
      
      // Send email with both reset link and temporary password
      const emailResult = await sendPasswordResetEmail(email, resetLink, tempPassword);
      
      if (emailResult) {
        console.log('4. Email sent successfully');
        setMessage({ 
          text: successMessage, 
          type: 'success' 
        });
      } else {
        console.error('4. Failed to send email');
        throw new Error('Failed to send reset email. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Failed to send reset email. Please try again later.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setMessage({ text: 'Please fill in all fields', type: 'error' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/password/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token || new URLSearchParams(window.location.search).get('token'),
          password: newPassword 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ 
          text: 'Your password has been reset successfully. You can now log in with your new password.', 
          type: 'success' 
        });
        
        // Reset form and close after delay
        setNewPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          onClose();
          // Redirect to login page after successful password reset
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }, 3000);
      } else {
        throw new Error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Failed to reset password. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderEmailStep = () => (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
        <p className="text-gray-600 mt-2">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-start ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium focus:outline-none"
        >
          Back to login
        </button>
      </div>
    </>
  );

  const renderResetStep = () => (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
        <p className="text-gray-600 mt-2">
          Enter your new password below.
        </p>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-start ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password"
              disabled={isLoading}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 8 characters with uppercase, lowercase, number, and special character
          </p>
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm new password"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !newPassword || !confirmPassword}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            setStep('email');
            setMessage(null);
          }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium focus:outline-none"
        >
          Back to email
        </button>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
          disabled={isLoading}
        >
          <X className="h-6 w-6" />
        </button>
        
        {step === 'email' ? renderEmailStep() : renderResetStep()}
      </div>
    </div>
  );
};

export default ForgotPassword;
