import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, BookOpen, Eye, EyeOff, Sparkles, Users, BarChart3, User, Building, CreditCard } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [aadharReference, setAadharReference] = useState('');
  const [loginRole, setLoginRole] = useState<'student' | 'owner'>('owner');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password, loginRole);
      
      if (success) {
        const dashboardPath = loginRole === 'owner' ? '/owner/dashboard' : '/student/dashboard';
        navigate(dashboardPath);
      } else {
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Login error:', err);
      }
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center mb-8">
                  <BookOpen className="h-12 w-12 mr-4" />
                  <h1 className="text-4xl font-bold">LibraryMate</h1>
                </div>
                
                <h2 className="text-3xl font-bold mb-6">Welcome Back</h2>
                <p className="text-xl text-blue-100 mb-8">
                  Access your digital library management system
                </p>

                <div className="space-y-6">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 mr-4 text-blue-200" />
                    <span className="text-lg">Student Management</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-6 w-6 mr-4 text-blue-200" />
                    <span className="text-lg">Digital Library Access</span>
                  </div>
                  <div className="flex items-center">
                    <BarChart3 className="h-6 w-6 mr-4 text-blue-200" />
                    <span className="text-lg">Analytics & Reports</span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="h-6 w-6 mr-4 text-blue-200" />
                    <span className="text-lg">Payment Management</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            </div>

            <div className="lg:w-1/2 p-12">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900">Sign In</h3>
                  <p className="text-gray-600 mt-2">
                    Enter your credentials to access your account
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Login As
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setLoginRole('owner')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          loginRole === 'owner'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Building className="h-5 w-5 mx-auto mb-1" />
                        <span className="text-sm font-medium">Library Owner</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginRole('student')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          loginRole === 'student'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <User className="h-5 w-5 mx-auto mb-1" />
                        <span className="text-sm font-medium">Student</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {loginRole === 'student' && (
                    <div>
                      <label htmlFor="aadharReference" className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhar Reference (Optional)
                      </label>
                      <input
                        id="aadharReference"
                        type="text"
                        value={aadharReference}
                        onChange={(e) => setAadharReference(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter Aadhar reference"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Signing In...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Sparkles className="h-5 w-5 mr-2" />
                        Sign In
                      </div>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                      Sign up here
                    </Link>
                  </p>
                  {loginRole === 'student' && (
                    <p className="text-gray-600 mt-2">
                      Need to activate your account?{' '}
                      <Link to="/activate-student" className="text-blue-600 hover:text-blue-700 font-medium">
                        Activate here
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
