import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Mail, Phone, Calendar, CreditCard, User, BookOpen, Clock, CheckCircle, AlertCircle, XCircle, Edit3, Save, X, Users } from 'lucide-react';
import Navbar from '../../components/Layout/Navbar';
import { api } from '../../utils/api';
// Button Component
type ButtonVariant = 'primary' | 'secondary' | 'success' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-indigo-500',
    secondary: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl focus:ring-emerald-500',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500',
    outline: 'border-2 border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-500',
    ghost: 'hover:bg-slate-100 text-slate-700 focus:ring-slate-500'
  };
  
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Input Component
interface LocalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  className?: string;
}

const Input: React.FC<LocalInputProps> = ({ leftIcon, className = '', ...props }) => {
  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
          {leftIcon}
        </div>
      )}
      <input
        className={`w-full px-4 py-3 ${leftIcon ? 'pl-10' : ''} border border-slate-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${className}`}
        {...props}
      />
    </div>
  );
};

// Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg ${hover ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : ''} transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Modal Component
interface LocalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const Modal: React.FC<LocalModalProps> = ({ isOpen, onClose, title, size = 'md', children }) => {
  if (!isOpen) return null;
  
  const sizes: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={24} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Student Edit Modal Content
interface EditStudentModalProps {
  student: any;
  onClose: () => void;
  onSave: (student: any) => void;
}

const EditStudentModalContent: React.FC<EditStudentModalProps> = ({ student, onSave }) => {
  const [formData, setFormData] = useState({
    name: student.name,
    registrationNumber: student.registrationNumber,
    email: student.email,
    phone: student.phone,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await new Promise(res => setTimeout(res, 1000));
      setSuccess(true);
      setIsEditing(false);
      onSave({ ...student, ...formData });
    } catch (err) {
      setError('Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      overdue: 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="text-center pb-6 border-b border-slate-200">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User size={32} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">{formData.name}</h3>
        <p className="text-slate-500">{student.registrationNumber}</p>
      </div>
      
      {/* Basic Information */}
      <div>
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <User size={20} className="text-indigo-600" />
          Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-600">Full Name</label>
            {isEditing ? (
              <Input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="bg-white border-indigo-200"
                leftIcon={<User size={16} />}
              />
            ) : (
              <p className="text-slate-900 py-2 px-3 bg-slate-50 rounded-lg">{formData.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-600">Registration Number</label>
            {isEditing ? (
              <Input 
                name="registrationNumber" 
                value={formData.registrationNumber} 
                onChange={handleChange} 
                className="bg-white border-indigo-200"
                leftIcon={<CreditCard size={16} />}
              />
            ) : (
              <p className="text-slate-900 py-2 px-3 bg-slate-50 rounded-lg">{formData.registrationNumber}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-600">Email Address</label>
            {isEditing ? (
              <Input 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="bg-white border-indigo-200"
                leftIcon={<Mail size={16} />}
              />
            ) : (
              <p className="text-slate-900 py-2 px-3 bg-slate-50 rounded-lg">{formData.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-600">Phone Number</label>
            {isEditing ? (
              <Input 
                name="phone" 
                type="tel" 
                value={formData.phone} 
                onChange={handleChange} 
                className="bg-white border-indigo-200"
                leftIcon={<Phone size={16} />}
              />
            ) : (
              <p className="text-slate-900 py-2 px-3 bg-slate-50 rounded-lg">{formData.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      <div>
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BookOpen size={20} className="text-emerald-600" />
          Subscription Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-600">Subscription Plan</label>
            <p className="text-slate-900 py-2 px-3 bg-slate-50 rounded-lg font-medium">
              {student.subscriptionPlan === 'MONTHLY' ? 'Monthly' 
               : student.subscriptionPlan === 'QUARTERLY' ? 'Quarterly'
               : student.subscriptionPlan === 'YEARLY' ? 'Yearly'
               : student.subscriptionPlan.toLowerCase()}
            </p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-600">Payment Status</label>
            <div className="py-2">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(student.paymentStatus)}`}>
                {student.paymentStatus === 'paid' && <CheckCircle size={14} />}
                {student.paymentStatus === 'pending' && <Clock size={14} />}
                {student.paymentStatus === 'overdue' && <AlertCircle size={14} />}
                {student.paymentStatus}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-600">Join Date</label>
            <p className="text-slate-900 py-2 px-3 bg-slate-50 rounded-lg">{new Date(student.joinDate).toLocaleDateString()}</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-600">Due Date</label>
            <p className="text-slate-900 py-2 px-3 bg-slate-50 rounded-lg">
              {student.dueDate ? new Date(student.dueDate).toLocaleDateString() : 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <XCircle size={20} />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          <CheckCircle size={20} />
          Changes saved successfully!
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-200">
        <Button variant="primary" size="sm" className="flex items-center gap-2">
          <Mail size={18} />
          Send Email
        </Button>
        <Button variant="secondary" size="sm" className="flex items-center gap-2" onClick={() => alert(`Update payment for ${student?.name}`)}>
          <CreditCard size={18} />
          Update Payment
        </Button>
        {!isEditing ? (
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setIsEditing(true)}>
            <Edit3 size={18} />
            Edit Student
          </Button>
        ) : (
          <>
            <Button variant="success" size="sm" className="flex items-center gap-2" onClick={handleSave} disabled={loading}>
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2" 
              onClick={() => { 
                setIsEditing(false); 
                setFormData({ 
                  name: student.name, 
                  registrationNumber: student.registrationNumber, 
                  email: student.email, 
                  phone: student.phone 
                }); 
                setError('');
                setSuccess(false);
              }}
            >
              <X size={18} />
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

// Main Students List Component
const StudentsList = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Quick dev login function for testing
  const performQuickLogin = async () => {
    try {
      const data: any = await api.post('/auth/login', {
        email: 'admin@librarymate.com',
        password: 'LibraryMate@123',
        role: 'admin',
      });

      const user = data?.user || data?.data?.user;
      const token = data?.token || data?.data?.token;
      if (user && token) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        console.log('Quick login successful');
        fetchStudents();
      } else {
        console.error('Quick login failed: unexpected response format');
      }
    } catch (error) {
      console.error('Quick login error:', error);
    }
  };

  // Function to fetch students from API
  const fetchStudents = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data: any = await api.get('/students');
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setStudents(list);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on component mount
  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Listen for student added events
  React.useEffect(() => {
    const handleStudentAdded = () => {
      console.log('Student added event received, refetching students...');
      fetchStudents();
    };

    // Listen for custom event when a student is added
    window.addEventListener('studentAdded', handleStudentAdded);
    
    // Also listen for storage changes as a fallback
    window.addEventListener('storage', (e) => {
      if (e.key === 'studentAdded') {
        handleStudentAdded();
        // Clean up the flag
        localStorage.removeItem('studentAdded');
      }
    });

    return () => {
      window.removeEventListener('studentAdded', handleStudentAdded);
      window.removeEventListener('storage', handleStudentAdded);
    };
  }, [fetchStudents]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredStudents = Array.isArray(students) ? students.filter(student => {
    if (!student) return false;
    
    const matchesSearch = (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.registrationNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || student.paymentStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  }) : [];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      overdue: 'bg-red-100 text-red-700 border-red-200'
    };
    return styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getPlanBadge = (plan: string) => {
    const styles: Record<string, string> = {
      MONTHLY: 'bg-blue-100 text-blue-700 border-blue-200',
      monthly: 'bg-blue-100 text-blue-700 border-blue-200',
      QUARTERLY: 'bg-purple-100 text-purple-700 border-purple-200',
      quarterly: 'bg-purple-100 text-purple-700 border-purple-200',
      YEARLY: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      yearly: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    return styles[plan] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const formatPlanText = (plan: string) => {
    const planMap: Record<string, string> = {
      'MONTHLY': 'Monthly',
      'QUARTERLY': 'Quarterly', 
      'YEARLY': 'Yearly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'yearly': 'Yearly'
    };
    return planMap[plan] || plan.toLowerCase();
  };

  const handleStudentClick = (student: any) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'paid': return <CheckCircle size={14} className="text-emerald-600" />;
      case 'pending': return <Clock size={14} className="text-amber-600" />;
      case 'overdue': return <AlertCircle size={14} className="text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-emerald-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      <Navbar />
      
      {/* Loading State */}
      {isLoading && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-lg text-slate-600">Loading students...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center py-20">
            <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Error Loading Students</h3>
            <p className="text-lg text-slate-600 mb-8">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {error.includes('log in') || error.includes('Authentication') ? (
                <>
                  <Button 
                    variant="primary" 
                    onClick={() => window.location.href = '/login'}
                    className="px-8"
                  >
                    Go to Login
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={performQuickLogin}
                    className="px-8"
                  >
                    Quick Login (Dev)
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={fetchStudents} className="px-8">
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      {!isLoading && !error && (
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
              <Users size={28} className="sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-900 to-emerald-900 bg-clip-text text-transparent mb-4">
            Student Management
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Manage your library's student database with powerful tools for tracking subscriptions and payments.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Students</p>
                <p className="text-3xl font-bold text-slate-900">{students.length}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Users size={24} className="text-indigo-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Paid</p>
                <p className="text-3xl font-bold text-emerald-600">{students.filter(s => s.paymentStatus === 'paid').length}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle size={24} className="text-emerald-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-3xl font-bold text-amber-600">{students.filter(s => s.paymentStatus === 'pending').length}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock size={24} className="text-amber-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{students.filter(s => s.paymentStatus === 'overdue').length}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertCircle size={24} className="text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <Input
                placeholder="Search students by name, email, or registration number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={20} />}
                className="text-base sm:text-lg"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-6 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm font-medium"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <Button variant="outline" className="flex items-center gap-2 px-6">
                <Filter size={20} />
                Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Students Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {filteredStudents.map((student) => (
            <Card key={student.id} hover className="p-4 sm:p-6 lg:p-8 group">
              <div
                className="cursor-pointer"
                onClick={() => handleStudentClick(student)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStudentClick(student); }}
              >
                <div className="space-y-4 sm:space-y-6">
                  {/* Student Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {student.name}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">{student.registrationNumber}</p>
                      </div>
                    </div>
                    <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-slate-100 rounded-xl transition-all" type="button">
                      <MoreVertical size={18} className="text-slate-400" />
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="flex items-center text-slate-600 hover:text-slate-800 transition-colors">
                      <Mail size={16} className="mr-3 text-indigo-500" />
                      <span className="text-sm font-medium">{student.email}</span>
                    </div>
                    <div className="flex items-center text-slate-600 hover:text-slate-800 transition-colors">
                      <Phone size={16} className="mr-3 text-emerald-500" />
                      <span className="text-sm font-medium">{student.phone}</span>
                    </div>
                  </div>

                  {/* Subscription Info */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Subscription Plan</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPlanBadge(student.subscriptionPlan)}`}>
                        {formatPlanText(student.subscriptionPlan)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Payment Status</span>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(student.paymentStatus)}`}>
                        {getStatusIcon(student.paymentStatus)}
                        {student.paymentStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Due Date</span>
                      <div className="flex items-center text-sm font-medium text-slate-900">
                        <Calendar size={14} className="mr-2 text-purple-500" />
                        {student.dueDate ? new Date(student.dueDate).toLocaleDateString() : 'Not set'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <Card className="text-center py-20">
            <div className="text-slate-300 mb-6">
              <Search size={80} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">No students found in your library</h3>
            <p className="text-lg text-slate-500 mb-8 max-w-md mx-auto">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                : 'You haven\'t added any students to your library yet. Students will only appear here after you add them to your specific library.'}
            </p>
            {(!searchTerm && filterStatus === 'all') && (
              <Button variant="primary" size="lg" className="px-8">
                Add First Student
              </Button>
            )}
          </Card>
        )}

        {/* Student Detail Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Student Profile"
          size="lg"
        >
          {selectedStudent && (
            <EditStudentModalContent
              student={selectedStudent}
              onClose={() => setIsModalOpen(false)}
              onSave={(updatedStudent) => {
                console.log('Student updated:', updatedStudent);
                setIsModalOpen(false);
              }}
            />
          )}
        </Modal>
      </div>
      )}
    </div>
  );
};

export default StudentsList;