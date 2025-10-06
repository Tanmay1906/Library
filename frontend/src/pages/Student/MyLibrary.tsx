import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Mail, Phone, MapPin, Calendar, Users, CreditCard, BookOpen } from 'lucide-react';
import Navbar from '../../components/Layout/Navbar';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

import { useAuth } from '../../utils/AuthContext';
import { api } from '../../utils/api';
/**
 * My Library Page Component
 * Displays detailed information about the student's assigned library
 * Includes subscription details, library contact info, and membership status
 */
const MyLibrary: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [library, setLibrary] = React.useState<any>(null);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [paymentHistory, setPaymentHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch student dashboard data which includes library details
        const dashboardResponse = await api.getStudentDashboard();
        
        // Set data regardless of whether it's complete or not
        setDashboardData(dashboardResponse || null);
        setLibrary(dashboardResponse?.library || null);
        
        // Fetch payment history for subscription details
        try {
          const paymentResponse = await api.getPaymentHistory();
          setPaymentHistory(paymentResponse || []);
        } catch (paymentError) {
          console.log('Payment history not available:', paymentError);
          setPaymentHistory([]);
        }
        
      } catch (error) {
        console.error('Error fetching student data:', error);
        
        // Check if the error is due to student not existing
        if (error instanceof Error && error.message.includes('404')) {
          // Student account not found - they need to be created by a library owner
          setDashboardData({
            student: null,
            library: null,
            stats: { totalBooks: 0, completedBooks: 0, currentlyReading: 0, wishlistedBooks: 0 },
            currentBorrows: [],
            completedBooks: []
          });
        } else {
          // Other error - keep data as null
          setDashboardData(null);
        }
        setLibrary(null);
        setPaymentHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get subscription details from student data or return null for new students
  const getSubscriptionDetails = () => {
    if (!dashboardData?.student || !dashboardData?.library) {
      return null; // No subscription if no library assigned
    }

    const student = dashboardData.student;
    const latestPayment = paymentHistory.find(p => p.status === 'COMPLETED') || paymentHistory[0];
    
    return {
      plan: student.subscriptionPlan === 'MONTHLY' ? 'Monthly Subscription' : 
            student.subscriptionPlan === 'QUARTERLY' ? 'Quarterly Subscription' :
            student.subscriptionPlan === 'YEARLY' ? 'Yearly Subscription' : 'Basic Plan',
      amount: latestPayment?.amount || (student.subscriptionPlan === 'MONTHLY' ? 299 : 
                                       student.subscriptionPlan === 'QUARTERLY' ? 799 : 
                                       student.subscriptionPlan === 'YEARLY' ? 2999 : 299),
      startDate: student.joinDate,
      nextPayment: student.dueDate,
      status: student.paymentStatus?.toLowerCase() || 'pending',
      paymentMethod: latestPayment?.paymentMethod || 'Not set',
      features: [
        'Access to all digital books',
        'Mobile app access',
        'Email support',
        'Reading progress sync',
        'Offline reading capability'
      ]
    };
  };

  const subscriptionDetails = getSubscriptionDetails();

  /**
   * Membership statistics - calculated from real data
   */
  const getMembershipStats = () => {
    // If no library assigned, show "not joined" status
    if (!dashboardData?.library) {
      return [
        {
          title: 'Library Status',
          value: 'Not Joined',
          icon: <Calendar className="h-5 w-5" />,
          color: 'bg-orange-500'
        },
        {
          title: 'Books Available',
          value: dashboardData?.stats?.totalBooks?.toString() || '0',
          icon: <BookOpen className="h-5 w-5" />,
          color: 'bg-blue-500'
        },
        {
          title: 'Registration',
          value: dashboardData?.student?.registrationNumber || 'Pending',
          icon: <Users className="h-5 w-5" />,
          color: 'bg-gray-500'
        }
      ];
    }

    const student = dashboardData.student;
    const stats = dashboardData.stats;

    return [
      {
        title: 'Member Since',
        value: student.joinDate ? new Date(student.joinDate).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        }) : 'Not Available',
        icon: <Calendar className="h-5 w-5" />,
        color: 'bg-blue-500'
      },
      {
        title: 'Books Read',
        value: stats.completedBooks ? stats.completedBooks.toString() : '0',
        icon: <BookOpen className="h-5 w-5" />,
        color: 'bg-emerald-500'
      },
      {
        title: 'Currently Reading',
        value: stats.currentlyReading ? stats.currentlyReading.toString() : '0',
        icon: <Users className="h-5 w-5" />,
        color: 'bg-amber-500'
      }
    ];
  };

  const membershipStats = getMembershipStats();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-emerald-50 relative">
        <Navbar />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-lg text-slate-600">Loading your library information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-emerald-50 relative">
      <Navbar />
      {/* Glassmorphism background accent */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl absolute top-0 left-0" />
        <div className="w-72 h-72 bg-emerald-200/30 rounded-full blur-2xl absolute bottom-0 right-0" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight drop-shadow-lg">My Library</h1>
          <p className="text-lg text-slate-600 mt-3">Your library membership and subscription details.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Library Information */}
          <div className="lg:col-span-3 space-y-10">
            {/* No Library Joined State */}
            {!library ? (
              <Card className="bg-white/80 backdrop-blur-lg border border-slate-100 shadow-xl p-8 rounded-2xl">
                <div className="text-center py-12">
                  <div className="bg-orange-100 p-8 rounded-full w-24 h-24 mx-auto mb-6">
                    <Building className="h-8 w-8 text-orange-600 mx-auto mt-4" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    {dashboardData?.student ? 'No Library Joined Yet' : 'Account Not Created'}
                  </h2>
                  <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                    {dashboardData?.student 
                      ? 'You haven\'t been assigned to any library yet. Contact a library owner to get access to their library.'
                      : 'Your student account hasn\'t been created by a library owner yet. Please contact a library to create your account and get access to their books.'
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="primary"
                      onClick={() => navigate('/student/libraries')}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Browse Libraries
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/student/books')}
                    >
                      View Available Books
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                {/* Library Details */}
                <Card className="bg-white/80 backdrop-blur-lg border border-slate-100 shadow-xl p-8 rounded-2xl">
                  <div className="flex items-start space-x-6 mb-8">
                    <div className="bg-indigo-100 p-6 rounded-xl">
                      <Building className="h-10 w-10 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">{library.name}</h2>
                      <p className="text-slate-600 mt-2 text-lg">{library.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <MapPin className="h-6 w-6 text-slate-400" />
                        <div>
                          <p className="text-base font-medium text-slate-700">Address</p>
                          <p className="text-slate-900 text-lg">{library.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Phone className="h-6 w-6 text-slate-400" />
                        <div>
                          <p className="text-base font-medium text-slate-700">Phone</p>
                          <p className="text-slate-900 text-lg">{library.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <Mail className="h-6 w-6 text-slate-400" />
                        <div>
                          <p className="text-base font-medium text-slate-700">Email</p>
                          <p className="text-slate-900 text-lg">{library.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Users className="h-6 w-6 text-slate-400" />
                        <div>
                          <p className="text-base font-medium text-slate-700">Total Members</p>
                          <p className="text-slate-900 text-lg">{library.totalStudents ? `${library.totalStudents} students` : 'Not available'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Subscription Details */}
                <Card className="bg-white/80 backdrop-blur-lg border border-slate-100 shadow-xl p-8 rounded-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="bg-emerald-100 p-6 rounded-xl">
                        <CreditCard className="h-10 w-10 text-emerald-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">Subscription Details</h3>
                    </div>
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-base font-semibold">
                      {subscriptionDetails?.status === 'active' || subscriptionDetails?.status === 'completed' ? 'Active' : 'Pending'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                      <div>
                        <label className="text-base font-medium text-slate-600">Current Plan</label>
                        <p className="text-lg font-semibold text-slate-900">{subscriptionDetails?.plan}</p>
                      </div>
                      <div>
                        <label className="text-base font-medium text-slate-600">Monthly Amount</label>
                        <p className="text-lg font-semibold text-slate-900">{subscriptionDetails?.amount ? `₹${subscriptionDetails.amount}` : 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-base font-medium text-slate-600">Payment Method</label>
                        <p className="text-slate-900 text-lg">{subscriptionDetails?.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="text-base font-medium text-slate-600">Start Date</label>
                        <p className="text-slate-900 text-lg">{subscriptionDetails?.startDate ? new Date(subscriptionDetails.startDate).toLocaleDateString() : 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-base font-medium text-slate-600">Next Payment</label>
                        <p className="text-slate-900 text-lg">{subscriptionDetails?.nextPayment ? new Date(subscriptionDetails.nextPayment).toLocaleDateString() : 'Not scheduled'}</p>
                      </div>
                      <div>
                        <label className="text-base font-medium text-slate-600">Student ID</label>
                        <p className="text-slate-900 text-lg">{dashboardData?.student?.registrationNumber || user?.registrationNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-4">Plan Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subscriptionDetails && subscriptionDetails.features && subscriptionDetails.features.length > 0 ? (
                        subscriptionDetails.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-base text-slate-600">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
                            {feature}
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-base text-slate-600">No features available</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8 pt-8 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-semibold"
                      onClick={() => navigate('/student/upgrade-plan')}
                    >
                      Upgrade Plan
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-semibold"
                      onClick={() => navigate('/student/update-payment')}
                    >
                      Update Payment
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-semibold"
                      onClick={() => alert('Invoice downloaded!')}
                    >
                      Download Invoice
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            {/* Membership Stats */}
            <Card className="bg-white/80 backdrop-blur-lg border border-slate-100 shadow-xl p-6 rounded-2xl">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Membership Overview</h3>
                <p className="text-sm text-slate-500">Your reading journey at a glance</p>
              </div>
              <div className="space-y-3">
                {membershipStats.map((stat, index) => (
                  <div key={index} className="group hover:shadow-md transition-all duration-200 p-4 bg-gradient-to-r from-slate-50/50 via-white to-slate-50/30 border border-slate-100/50 rounded-xl hover:border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-lg ${stat.color} text-white shadow-sm group-hover:shadow-md transition-shadow duration-200`}>
                          {stat.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                          <p className="text-lg font-bold text-slate-900 mt-0.5">{stat.value}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`w-3 h-3 rounded-full ${stat.color} opacity-60`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Progress indicator - only show if joined a library */}
              {dashboardData?.library && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>Reading Activity</span>
                    <span>
                      {dashboardData?.stats?.completedBooks || 0 > 0 
                        ? `${Math.round((dashboardData?.stats?.completedBooks || 0) / ((dashboardData?.stats?.completedBooks || 0) + (dashboardData?.stats?.currentlyReading || 0)) * 100)}% Complete`
                        : 'Getting Started'
                      }
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${dashboardData?.stats?.completedBooks || 0 > 0 
                          ? Math.round((dashboardData?.stats?.completedBooks || 0) / ((dashboardData?.stats?.completedBooks || 0) + (dashboardData?.stats?.currentlyReading || 0)) * 100)
                          : 5
                        }%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-lg border border-slate-100 shadow-xl p-6 rounded-2xl">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Quick Actions</h3>
                <p className="text-sm text-slate-500">Access your library features</p>
              </div>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-indigo-50 to-indigo-25 hover:from-indigo-100 hover:to-indigo-50 border-indigo-100 hover:border-indigo-200 rounded-xl h-12 transition-all duration-200 group"
                  onClick={() => navigate('/student/books')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors duration-200">
                      <BookOpen size={16} className="text-indigo-600" />
                    </div>
                    <span className="font-medium text-indigo-900">Browse Books</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-blue-50 to-blue-25 hover:from-blue-100 hover:to-blue-50 border-blue-100 hover:border-blue-200 rounded-xl h-12 transition-all duration-200 group"
                  onClick={() => navigate('/student/payment-history')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                      <CreditCard size={16} className="text-blue-600" />
                    </div>
                    <span className="font-medium text-blue-900">Payment History</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-emerald-50 to-emerald-25 hover:from-emerald-100 hover:to-emerald-50 border-emerald-100 hover:border-emerald-200 rounded-xl h-12 transition-all duration-200 group"
                  onClick={() => navigate('/support')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors duration-200">
                      <Mail size={16} className="text-emerald-600" />
                    </div>
                    <span className="font-medium text-emerald-900">Contact Library</span>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Payment Reminder - only show if subscribed to a library */}
            {subscriptionDetails && (
              <Card className="bg-white/80 backdrop-blur-lg border border-slate-100 shadow-xl p-6 rounded-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-3 rounded-xl shadow-sm">
                    <Calendar className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Payment Reminder</h3>
                    <p className="text-xs text-slate-500">Next billing cycle</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 mb-4">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {subscriptionDetails.amount && subscriptionDetails.nextPayment ? (
                      <>
                        Your next payment of{' '}
                        <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          ₹{subscriptionDetails.amount}
                        </span>{' '}
                        is due on{' '}
                        <span className="font-semibold text-slate-900">
                          {new Date(subscriptionDetails.nextPayment).toLocaleDateString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-500 italic">No payment scheduled</span>
                    )}
                  </p>
                </div>
                
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => navigate('/student/payment-history')}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <CreditCard size={16} />
                    <span>Pay Now</span>
                  </div>
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyLibrary;