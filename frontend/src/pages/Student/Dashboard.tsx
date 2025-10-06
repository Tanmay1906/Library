import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, CreditCard, Heart, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import Navbar from '../../components/Layout/Navbar';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useAuth } from '../../utils/AuthContext';
import { api } from '../../utils/api';

/**
 * Student Dashboard Component
 * Provides overview of student's library activity, reading progress, and subscription status
 * Features reading statistics, recent activity, and quick access to books
 */
const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  // State for dashboard data
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  // Listen for online/offline events
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Safely calculate reading statistics with null checks
  const totalBooks = dashboardData?.stats?.totalBooks || 0;
  const completedBooks = dashboardData?.stats?.completedBooks || 0;
  const wishlistedBooks = dashboardData?.stats?.wishlistedBooks || 0;
  const currentlyReading = dashboardData?.stats?.currentlyReading || 0;

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch dashboard data using API utility
        const data = await api.getStudentDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error instanceof Error) {
          if (error.message.includes('Unable to connect to server')) {
            setError('Unable to connect to server. Please check if the backend is running and try again.');
          } else if (error.message.includes('401')) {
            setError('Authentication required. Please log in again.');
            // Auto-logout and redirect after a delay
            setTimeout(() => {
              logout();
              navigate('/login');
            }, 3000);
          } else if (error.message.includes('500')) {
            setError('Server error occurred. Please try again later.');
          } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            setError('Network connection issue. Please check your connection and try again.');
          } else {
            setError('Failed to load dashboard data. Please try again.');
          }
        }
      }

      try {
        // Fetch recent activity using API utility
        const activityData = await api.getStudentActivity();
        setRecentActivity(Array.isArray(activityData) ? activityData : []);
      } catch (err) {
        console.error('Error fetching activity:', err);
        // Don't show error for activity fetch failures since it's not critical
        setRecentActivity([]);
        
        // Only show error if it's not a network issue (since dashboard data is more critical)
        if (err instanceof Error && !err.message.includes('Unable to connect') && !err.message.includes('NetworkError')) {
          console.warn('Non-critical error fetching activity data:', err.message);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [logout, navigate, isOnline]);

  /**
   * Reading stats for dashboard overview with new student context
   */
  const readingStats = [
    {
      title: 'Books Available',
      value: totalBooks,
      icon: <BookOpen className="h-6 w-6" />,
      color: 'bg-blue-500',
      description: 'Total books in library'
    },
    {
      title: 'Completed',
      value: completedBooks,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-emerald-500',
      description: completedBooks === 0 ? 'Start reading books' : 'Books completed'
    },
    {
      title: 'Currently Reading',
      value: currentlyReading,
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-amber-500',
      description: currentlyReading === 0 ? 'Pick a book to start' : 'Books in progress'
    },
    {
      title: 'Wishlist',
      value: wishlistedBooks,
      icon: <Heart className="h-6 w-6" />,
      color: 'bg-red-500',
      description: wishlistedBooks === 0 ? 'Save favorites here' : 'Books saved for later'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-emerald-50 relative">
      <Navbar />
      {/* Glassmorphism background accent */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl absolute top-0 left-0" />
        <div className="w-72 h-72 bg-emerald-200/30 rounded-full blur-2xl absolute bottom-0 right-0" />
      </div>
      
      {loading ? (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-lg text-slate-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10">{/* Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight drop-shadow-lg">
            {completedBooks === 0 && currentlyReading === 0 ? 
             `Welcome to your library, ${user?.name || 'Reader'}!` : 
             `Welcome back, ${user?.name || 'Reader'}!`}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-2 sm:mt-3">
            {completedBooks === 0 && currentlyReading === 0 ? 
             `Start your reading journey with ${dashboardData?.library?.name || 'Library'}.` :
             `Continue your learning journey with ${dashboardData?.library?.name || 'Library'}.`}
          </p>
          
          {/* New Student Welcome Message */}
          {completedBooks === 0 && currentlyReading === 0 && (
            <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-3">
                <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
                <h2 className="text-lg font-semibold text-indigo-900">Getting Started</h2>
              </div>
              <p className="text-indigo-700 mb-4">You're all set up! Browse our collection and borrow your first book to begin reading.</p>
              <Button
                variant="primary"
                onClick={() => navigate('/student/books')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Books
              </Button>
            </div>
          )}
          
          {!isOnline && (
            <div className="mt-4">
              <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                You're currently offline. Some features may not be available.
              </div>
            </div>
          )}
          {error && (
            <div className="mt-4">
              <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                <span>⚠️ {error}</span>
              </div>
              {error.includes('Server error') || error.includes('Unable to connect') || error.includes('Failed to load') ? (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="text-sm"
                  >
                    Retry
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Registration Number Card */}
        {(user?.registrationNumber || dashboardData?.student?.registrationNumber) && (
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-lg border border-slate-100 shadow-xl p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Registration Number</h3>
                  <p className="text-2xl font-bold text-indigo-600 mt-2">
                    {dashboardData?.student?.registrationNumber || user?.registrationNumber}
                  </p>
                </div>
                <div className="bg-indigo-100 p-4 rounded-xl">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {readingStats.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-lg border border-slate-100 shadow-xl hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`inline-flex p-4 rounded-xl ${stat.color} shadow-lg mb-4`}>{stat.icon}</div>
                  <p className="text-3xl font-extrabold text-slate-900 drop-shadow-sm">{stat.value}</p>
                  <p className="text-base text-slate-500 mt-1 font-medium">{stat.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Main Content: Current Reading & Recent Activity */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Currently Reading */}
            <Card className="bg-white/80 backdrop-blur-lg border border-slate-100 shadow-xl p-4 sm:p-6 lg:p-8 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Currently Reading</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/60 border border-indigo-200 hover:bg-indigo-50 transition-colors shadow"
                  onClick={() => navigate('/student/books')}
                >
                  View All Books
                </Button>
              </div>
              <div className="space-y-4 sm:space-y-5">
                {dashboardData?.currentBorrows && dashboardData.currentBorrows.length > 0 ? (
                  dashboardData.currentBorrows.slice(0, 2).map((borrow: any) => (
                    <div key={borrow.id} className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 sm:p-6 bg-gradient-to-r from-slate-50 via-white to-indigo-50 rounded-xl shadow-sm hover:scale-[1.01] transition-transform">
                      <img
                        src={borrow.book.coverUrl || 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=300'}
                        alt={borrow.book.title}
                        className="w-16 h-20 sm:w-20 sm:h-28 object-cover rounded-xl shadow-md mx-auto sm:mx-0"
                      />
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-semibold text-slate-900 text-base sm:text-lg">{borrow.book.title}</h4>
                        <p className="text-sm text-slate-600">{borrow.book.author}</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                            <span>Progress</span>
                            <span>{Math.floor(Math.random() * 80) + 20}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.floor(Math.random() * 80) + 20}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => navigate('/book-reader/' + borrow.book.id)}
                      >
                        Continue Reading
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">
                      {error ? 'Unable to load books at the moment' : 
                       dashboardData?.stats?.completedBooks === 0 && dashboardData?.stats?.currentlyReading === 0 ? 
                       'Welcome! Start your reading journey by browsing our collection' : 
                       'No books currently in progress'}
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-4"
                      onClick={() => navigate('/student/books')}
                    >
                      {dashboardData?.stats?.completedBooks === 0 && dashboardData?.stats?.currentlyReading === 0 ? 
                       'Explore Books' : 'Browse Books'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-lg border border-slate-100 shadow-xl p-8 rounded-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-900">Recent Activity</h3>
                <TrendingUp className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="space-y-5">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-5 bg-gradient-to-r from-slate-50 via-white to-indigo-50 rounded-xl shadow-sm">
                      <div className="mt-1 p-3 bg-indigo-100 text-indigo-600 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-current" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base text-slate-900 font-semibold">
                          <span className="font-medium">{activity.action}</span>{' '}
                          <span className="text-indigo-600">{activity.book}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 mb-2">
                      {completedBooks === 0 && currentlyReading === 0 ? 
                       'No activity yet - your reading journey starts here!' : 
                       'No recent activity'}
                    </p>
                    <p className="text-sm text-slate-400">
                      {completedBooks === 0 && currentlyReading === 0 ? 
                       'Borrow your first book to see activity here' : 
                       'Activity from book loans and returns will appear here'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            {/* Library Info - only show if student has joined a library */}
            {dashboardData?.library ? (
              <Card className="bg-white/80 backdrop-blur-lg border border-slate-100 shadow-xl p-8 rounded-2xl">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-emerald-100 p-4 rounded-xl">
                    <BookOpen className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">My Library</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Library</label>
                    <p className="text-slate-900">{dashboardData.library.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Member Since</label>
                    <p className="text-slate-900">{dashboardData?.student?.joinDate ? new Date(dashboardData.student.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Not available'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Subscription</label>
                    <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      {dashboardData?.student?.subscriptionPlan || 'No Plan'} - {dashboardData?.student?.paymentStatus === 'PAID' ? 'Active' : 'Pending'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => navigate('/student/my-library')}
                >
                  View Library Details
                </Button>
              </Card>
            ) : (
              /* No Library Joined Card */
              <Card className="bg-white/80 backdrop-blur-lg border border-slate-100 shadow-xl p-8 rounded-2xl">
                <div className="text-center py-4">
                  <div className="bg-orange-100 p-4 rounded-xl w-16 h-16 mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-orange-600 mx-auto" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No Library Joined</h3>
                  <p className="text-sm text-slate-600 mb-4">Join a library to start borrowing books and tracking your reading progress.</p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => navigate('/student/libraries')}
                  >
                    Browse Libraries
                  </Button>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-lg border border-slate-100 shadow-xl p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-indigo-100 to-indigo-50 hover:from-indigo-200 hover:to-indigo-100 rounded-xl shadow flex items-center gap-3 text-indigo-900 font-semibold"
                  onClick={() => navigate('/student/books')}
                >
                  <BookOpen className="h-5 w-5 mr-2" />Browse All Books
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-emerald-100 to-emerald-50 hover:from-emerald-200 hover:to-emerald-100 rounded-xl shadow flex items-center gap-3 text-emerald-900 font-semibold"
                  onClick={() => navigate('/student/wishlist')}
                >
                  <Heart className="h-5 w-5 mr-2" />View Wishlist
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-amber-100 to-amber-50 hover:from-amber-200 hover:to-amber-100 rounded-xl shadow flex items-center gap-3 text-amber-900 font-semibold"
                  onClick={() => navigate('/student/completed-books')}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />Completed Books
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 rounded-xl shadow flex items-center gap-3 text-blue-900 font-semibold"
                  onClick={() => navigate('/student/payment-history')}
                >
                  <CreditCard className="h-5 w-5 mr-2" />Payment History
                </Button>
              </div>
            </Card>

            {/* Subscription Status - only show if student has a subscription */}
            {dashboardData?.student?.subscriptionPlan && (
              <Card className="bg-white/80 backdrop-blur-lg border border-slate-100 shadow-xl p-8 rounded-2xl">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-amber-100 p-4 rounded-xl">
                    <Calendar className="h-7 w-7 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Subscription</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Current Plan</span>
                    <span className="font-medium text-slate-900">{dashboardData.student.subscriptionPlan}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Amount</span>
                    <span className="font-medium text-slate-900">
                      {dashboardData.student.subscriptionPlan === 'YEARLY' ? '₹299.99' : 
                       dashboardData.student.subscriptionPlan === 'QUARTERLY' ? '₹89.99' : '₹29.99'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Next Payment</span>
                    <span className="font-medium text-slate-900">
                      {dashboardData.student.dueDate ? new Date(dashboardData.student.dueDate).toLocaleDateString() : 'Not scheduled'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dashboardData.student.paymentStatus === 'PAID' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : dashboardData.student.paymentStatus === 'OVERDUE'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {dashboardData.student.paymentStatus === 'PAID' ? 'Active' : 
                       dashboardData.student.paymentStatus === 'OVERDUE' ? 'Overdue' : 'Pending'}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;