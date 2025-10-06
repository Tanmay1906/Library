import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, BookOpen, Building, Sparkles, Users, BarChart3, CreditCard } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

interface Library {
  id: number;
  name: string;
  address: string;
  description: string;
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'owner' | 'student',
    aadharReference: '',
    registrationNumber: '',
    libraryName: '',
    libraryDescription: '',
    libraryId: ''
  });
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (formData.role === 'student') {
      fetchLibraries();
      if (!formData.registrationNumber) {
        const currentYear = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 9000) + 1000;
        const suggestedRegNum = `STU${currentYear}${randomNum}`;
        setFormData(prev => ({ ...prev, registrationNumber: suggestedRegNum }));
      }
    }
  }, [formData.role]);

  const fetchLibraries = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/library');
      if (response.ok) {
        const data = await response.json();
        setLibraries(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching libraries:', error);
    }
  };

  const validateForm = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[a-z]/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter');
      return false;
    }
    if (!/\d/.test(formData.password)) {
      setError('Password must contain at least one number');
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setError('Password must contain at least one special character (!@#$%^&* etc.)');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6-9');
      return false;
    }
    
    if (formData.role === 'student' && (!formData.aadharReference || formData.aadharReference.length !== 12)) {
      setError('Valid 12-digit Aadhar number is required for students');
      return false;
    }
    if (formData.role === 'student' && !formData.registrationNumber) {
      setError('Registration number is required for students');
      return false;
    }
    if (formData.role === 'owner' && !formData.libraryName) {
      setError('Library name is required for library owners');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const success = await signup(formData);
      if (success) {
        setTimeout(() => {
          if (isAuthenticated) {
            const dashboardPath = formData.role === 'owner' ? '/owner/dashboard' : '/student/dashboard';
            navigate(dashboardPath);
          } else {
            navigate('/login');
          }
        }, 100);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during registration. Please try again.');
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
                
                <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
                <p className="text-xl text-blue-100 mb-8">
                  Create your account and start your digital library journey
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
                  <h3 className="text-3xl font-bold text-gray-900">Create Account</h3>
                  <p className="text-gray-600 mt-2">
                    Enter your details to create your account
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
                      Register As
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, role: 'owner' }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.role === 'owner'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Building className="h-5 w-5 mx-auto mb-1" />
                        <span className="text-sm font-medium">Library Owner</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.role === 'student'
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
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                        required
                      />
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
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your phone number"
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
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>

                  {formData.role === 'student' && (
                    <>
                      <div>
                        <label htmlFor="aadharReference" className="block text-sm font-medium text-gray-700 mb-2">
                          Aadhar Number
                        </label>
                        <input
                          id="aadharReference"
                          type="text"
                          value={formData.aadharReference}
                          onChange={(e) => setFormData(prev => ({ ...prev, aadharReference: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter 12-digit Aadhar number"
                          maxLength={12}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Registration Number
                        </label>
                        <input
                          id="registrationNumber"
                          type="text"
                          value={formData.registrationNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Student registration number"
                          required
                        />
                      </div>
                      {libraries.length > 0 && (
                        <div>
                          <label htmlFor="libraryId" className="block text-sm font-medium text-gray-700 mb-2">
                            Select Library (Optional)
                          </label>
                          <select
                            id="libraryId"
                            value={formData.libraryId}
                            onChange={(e) => setFormData(prev => ({ ...prev, libraryId: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Choose a library</option>
                            {libraries.map((library) => (
                              <option key={library.id} value={library.id.toString()}>
                                {library.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}

                  {formData.role === 'owner' && (
                    <>
                      <div>
                        <label htmlFor="libraryName" className="block text-sm font-medium text-gray-700 mb-2">
                          Library Name
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            id="libraryName"
                            type="text"
                            value={formData.libraryName}
                            onChange={(e) => setFormData(prev => ({ ...prev, libraryName: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter library name"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="libraryDescription" className="block text-sm font-medium text-gray-700 mb-2">
                          Library Description
                        </label>
                        <textarea
                          id="libraryDescription"
                          value={formData.libraryDescription}
                          onChange={(e) => setFormData(prev => ({ ...prev, libraryDescription: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Describe your library"
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Sparkles className="h-5 w-5 mr-2" />
                        Create Account
                      </div>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
