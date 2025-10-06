import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, BookOpen, Eye, EyeOff, Sparkles, Users, BarChart3, User, Building, ArrowLeft, Shield, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

/**
 * OTP-based Login Component
 * Secure email verification for login
 */
const OTPLogin: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loginRole, setLoginRole] = useState<'student' | 'owner'>('owner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  
  const { loginWithOTP } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/auth/login-with-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          role: loginRole === 'owner' ? 'admin' : 'student'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setStep('otp');
        if (data.previewURL) {
          setPreviewURL(data.previewURL);
        }
      } else {
        setError(data.message || data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/auth/complete-login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: otp,
          role: loginRole === 'owner' ? 'admin' : 'student'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        const dashboardPath = loginRole === 'owner' ? '/owner/dashboard' : '/student/dashboard';
        navigate(dashboardPath);
      } else {
        setError(data.message || data.error || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setError('');
    setOtpSent(false);
    setPreviewURL(null);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/auth/login-with-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          role: loginRole === 'owner' ? 'admin' : 'student'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setError('');
        if (data.previewURL) {
          setPreviewURL(data.previewURL);
        }
        // Show success message briefly
        setError('New OTP sent successfully!');
        setTimeout(() => setError(''), 3000);
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-blue-500/10"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-8 xl:px-16">
          <div className="max-w-lg">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="relative">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <Sparkles className="h-4 w-4 text-yellow-800" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Library mate
                </h1>
                <p className="text-slate-500 text-sm">Management System</p>
              </div>
            </div>

            {/* Hero Content */}
            <div className="space-y-6">
              <h2 className="text-4xl xl:text-5xl font-bold text-slate-800 leading-tight">
                Secure Login with
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent block">
                  Email Verification
                </span>
              </h2>
              
              <p className="text-lg text-slate-600 leading-relaxed">
                Enhanced security with one-time password verification. Quick, secure, and passwordless access to your library dashboard.
              </p>

              {/* Security Features */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-slate-700">Enhanced security with OTP</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-slate-700">5-minute OTP validity</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-slate-700">Passwordless authentication</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-6 sm:space-y-8">
            
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Library mate</h1>
            </div>

            {/* Login Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {step === 'email' ? 'Secure Login' : 'Verify Your Email'}
              </h2>
              <p className="text-slate-600">
                {step === 'email' 
                  ? 'Enter your email to receive an OTP' 
                  : `Enter the 4-digit code sent to ${email}`
                }
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
              
              {/* Back Button for OTP Step */}
              {step === 'otp' && (
                <button
                  onClick={handleBackToEmail}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">Back to email</span>
                </button>
              )}

              {step === 'email' ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  {error && (
                    <div className="bg-red-50/80 backdrop-blur border border-red-200/50 text-red-700 px-4 py-3 rounded-2xl text-sm">
                      {error}
                    </div>
                  )}

                  {/* Role Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Login as</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setLoginRole('student')}
                        className={`group p-4 border-2 rounded-2xl text-center transition-all duration-200 ${
                          loginRole === 'student'
                            ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg'
                            : 'border-slate-200/50 hover:border-slate-300 bg-white/40'
                        }`}
                      >
                        <div className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center transition-all ${
                          loginRole === 'student' 
                            ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white' 
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}>
                          <User className="h-5 w-5" />
                        </div>
                        <div className={`text-sm font-medium transition-colors ${
                          loginRole === 'student' ? 'text-indigo-700' : 'text-slate-700'
                        }`}>Student</div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setLoginRole('owner')}
                        className={`group p-4 border-2 rounded-2xl text-center transition-all duration-200 ${
                          loginRole === 'owner'
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                            : 'border-slate-200/50 hover:border-slate-300 bg-white/40'
                        }`}
                      >
                        <div className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center transition-all ${
                          loginRole === 'owner' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}>
                          <Building className="h-5 w-5" />
                        </div>
                        <div className={`text-sm font-medium transition-colors ${
                          loginRole === 'owner' ? 'text-purple-700' : 'text-slate-700'
                        }`}>Library Owner</div>
                      </button>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
                        placeholder="Enter your registered email"
                        required
                      />
                    </div>
                  </div>

                  {/* Send OTP Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <span>Send OTP to Email</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  {error && (
                    <div className={`backdrop-blur border px-4 py-3 rounded-2xl text-sm ${
                      error.includes('success') 
                        ? 'bg-green-50/80 border-green-200/50 text-green-700'
                        : 'bg-red-50/80 border-red-200/50 text-red-700'
                    }`}>
                      {error}
                    </div>
                  )}

                  {/* OTP Success Message */}
                  {otpSent && (
                    <div className="bg-green-50/80 backdrop-blur border border-green-200/50 text-green-700 px-4 py-3 rounded-2xl text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>OTP sent successfully! Check your email.</span>
                      </div>
                      {previewURL && (
                        <div className="mt-2 text-xs">
                          <a 
                            href={previewURL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View test email (Development)
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* OTP Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Verification Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 text-slate-900 placeholder-slate-400 text-center text-2xl font-mono tracking-widest"
                      placeholder="0000"
                      maxLength={4}
                      required
                    />
                    <p className="text-xs text-slate-500 text-center">
                      Enter the 4-digit code sent to your email
                    </p>
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 4}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify & Login</span>
                    )}
                  </button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
                    >
                      Didn't receive code? Resend OTP
                    </button>
                  </div>
                </form>
              )}

              {/* Alternative Login Link */}
              <div className="text-center pt-4 border-t border-slate-200/50">
                <p className="text-sm text-slate-600 mb-2">
                  Prefer traditional login?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Use Password
                  </Link>
                </p>
                <p className="text-xs text-slate-500">
                  New to Library mate?{' '}
                  <Link
                    to="/signup"
                    className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="text-center text-xs text-slate-500 space-y-2">
              <p>🔒 Your email and data are secure with us</p>
              <div className="flex justify-center space-x-4">
                <span className="bg-white/40 px-3 py-1 rounded-full">📧 Email OTP</span>
                <span className="bg-white/40 px-3 py-1 rounded-full">⏱️ 5min validity</span>
                <span className="bg-white/40 px-3 py-1 rounded-full">🔐 Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;