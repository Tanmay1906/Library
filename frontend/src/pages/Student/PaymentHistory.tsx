import React, { useState } from 'react';
import { Calendar, CreditCard, Download, Filter, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import Navbar from '../../components/Layout/Navbar';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/UI/Modal';
import { useAuth } from '../../utils/AuthContext';
import { api } from '../../utils/api';

// Payment interface for API data matching backend schema
interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
  plan: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  method: 'CASH' | 'CARD' | 'UPI' | 'NET_BANKING' | 'WALLET';
  studentId: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    name: string;
    email: string;
  };
}
/**
 * Payment History Page Component
 * Displays student's payment history with filtering and detailed transaction views
 * Features invoice downloads, payment status tracking, and transaction details
 */
const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterAmount, setFilterAmount] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchPaymentHistory = async () => {
      setLoading(true);
      try {
        console.log('DEBUG: Current user:', user);
        console.log('DEBUG: Token from localStorage:', localStorage.getItem('token'));
        
        const data = await api.getPaymentHistory();
        console.log('DEBUG: API response:', data);
        
        setPayments(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching payment history:', err);
        if (err.message.includes('401')) {
          setError('Authentication required. Please log in to view payment history.');
        } else {
          setError('Failed to load payment history. Please try again later.');
        }
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPaymentHistory();
    } else {
      setError('Please log in to view payment history.');
      setLoading(false);
    }
  }, [user]);

  /**
   * Filter payments based on status and period
   */
  const filteredPayments = Array.isArray(payments) ? payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    let matchesPeriod = true;
    if (filterPeriod !== 'all') {
      const paymentDate = new Date(payment.date);
      const now = new Date();
      
      switch (filterPeriod) {
        case 'last_month':
          matchesPeriod = paymentDate >= new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;
        case 'last_3_months':
          matchesPeriod = paymentDate >= new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'last_year':
          matchesPeriod = paymentDate >= new Date(now.getFullYear() - 1, 0, 1);
          break;
      }
    }
    
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    let matchesAmount = true;
    if (filterAmount !== 'all') {
      if (filterAmount === 'lt100') matchesAmount = payment.amount < 100;
      else if (filterAmount === '100to500') matchesAmount = payment.amount >= 100 && payment.amount <= 500;
      else if (filterAmount === 'gt500') matchesAmount = payment.amount > 500;
    }
    return matchesStatus && matchesPeriod && matchesMethod && matchesAmount;
  }) : [];

  /**
   * Calculate summary statistics
   */
  const totalPaid = filteredPayments
    .filter(p => p.status === 'PAID')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const pendingAmount = filteredPayments
    .filter(p => p.status === 'PENDING')
    .reduce((sum, payment) => sum + payment.amount, 0);

  /**
   * Get status icon and styling
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle size={16} className="text-emerald-600" />;
      case 'PENDING':
        return <Clock size={16} className="text-amber-600" />;
      case 'OVERDUE':
      case 'CANCELLED':
      case 'REFUNDED':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-slate-400" />;
    }
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status: string) => {
    const styles = {
      PAID: 'bg-emerald-100 text-emerald-700',
      PENDING: 'bg-amber-100 text-amber-700',
      OVERDUE: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-slate-100 text-slate-700'
    };
    return styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-700';
  };

  /**
   * Get payment method icon
   */
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CARD':
        return <CreditCard size={16} className="text-blue-600" />;
      case 'NET_BANKING':
        return <div className="w-4 h-4 bg-green-600 rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">B</span>
        </div>;
      case 'CASH':
        return <div className="w-4 h-4 bg-amber-600 rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">₹</span>
        </div>;
      case 'UPI':
        return <div className="w-4 h-4 bg-purple-600 rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">U</span>
        </div>;
      case 'WALLET':
        return <div className="w-4 h-4 bg-indigo-600 rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">W</span>
        </div>;
      default:
        return <CreditCard size={16} className="text-slate-400" />;
    }
  };

  /**
   * Get user-friendly plan name
   */
  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'MONTHLY':
        return 'Monthly Plan';
      case 'QUARTERLY':
        return 'Quarterly Plan';
      case 'YEARLY':
        return 'Yearly Plan';
      default:
        return plan;
    }
  };

  /**
   * Get user-friendly method name
   */
  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case 'NET_BANKING':
        return 'Net Banking';
      case 'CARD':
        return 'Card';
      case 'UPI':
        return 'UPI';
      case 'CASH':
        return 'Cash';
      case 'WALLET':
        return 'Wallet';
      default:
        return method;
    }
  };
  const viewPaymentDetail = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  };

  /**
   * Handle invoice download
   */
  const downloadInvoice = async (paymentId: string) => {
    try {
      const invoiceData = await api.downloadInvoice(paymentId);

      // Generate PDF-like content and download
      const invoiceContent = `
INVOICE
=======

Invoice Number: ${invoiceData.invoiceNumber}
Issue Date: ${invoiceData.issueDate}
Payment Date: ${new Date(invoiceData.date).toLocaleDateString()}

Student Details:
- Name: ${invoiceData.student.name}
- Email: ${invoiceData.student.email}
- Registration: ${invoiceData.student.registrationNumber}

Payment Details:
- Plan: ${getPlanDisplayName(invoiceData.plan)}
- Amount: ₹${invoiceData.amount.toFixed(2)}
- Method: ${getMethodDisplayName(invoiceData.method)}
- Status: ${invoiceData.status}
- Payment ID: ${invoiceData.paymentId}

Thank you for your payment!
      `;

      // Create and download as text file (in a real app, this would be a PDF)
      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceData.invoiceNumber}.txt`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const exportAllPayments = () => {
    // Export CSV with proper display names
    const csvRows = [
      ['Transaction', 'Date', 'Amount', 'Method', 'Status'],
      ...filteredPayments.map(p => [
        getPlanDisplayName(p.plan), 
        p.date, 
        p.amount, 
        getMethodDisplayName(p.method), 
        p.status
      ])
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Summary statistics
   */
  const summaryStats = [
    {
      title: 'Total Paid',
      value: `₹${totalPaid.toFixed(2)}`,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-emerald-500',
      description: 'Successfully completed payments'
    },
    {
      title: 'Pending',
      value: `₹${pendingAmount.toFixed(2)}`,
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-amber-500',
      description: 'Payments in process'
    },
    {
      title: 'Transactions',
      value: filteredPayments.length,
      icon: <CreditCard className="h-6 w-6" />,
      color: 'bg-blue-500',
      description: 'Total payment records'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-emerald-100 relative">
      <Navbar />
      {/* Glassmorphism background accent with animation */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl absolute top-0 left-0 animate-pulse" />
        <div className="w-72 h-72 bg-emerald-300/30 rounded-full blur-2xl absolute bottom-0 right-0 animate-pulse" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-8 lg:px-16 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight drop-shadow-xl">Payment History</h1>
          <p className="text-lg md:text-xl text-slate-600 mt-3">Track your subscription payments, download invoices, and manage your transactions with ease.</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your payment history...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-8 bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
            <p className="text-center">{error}</p>
          </Card>
        )}

        {/* Main Content - Only show when not loading */}
        {!loading && (
          <>

        {/* Summary Statistics */}
        <div className="flex flex-col md:flex-row gap-8 mb-10 justify-center">
          {summaryStats.map((stat, index) => (
            <Card key={index} className="flex-1 bg-white/95 border border-slate-100 shadow-xl p-8 rounded-2xl flex items-center gap-6 hover:shadow-2xl transition-shadow duration-300 animate-fade-in">
              <div className={`inline-flex p-4 rounded-xl ${stat.color} text-white shadow-xl"}`}>{stat.icon}</div>
              <div>
                <p className="text-3xl md:text-4xl font-extrabold text-slate-900">{stat.value}</p>
                <p className="text-lg md:text-xl font-semibold text-slate-700">{stat.title}</p>
                <p className="text-sm text-slate-500 mt-2">{stat.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Main Table */}
          <div className="lg:col-span-3 space-y-12">
            {/* Filters - collapsible on mobile */}
            <Card className="mb-10 bg-white/90 backdrop-blur-lg border border-slate-100 shadow-2xl p-8 rounded-2xl animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex flex-wrap items-center gap-6">
                  <select
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                    className="px-4 py-3 border border-indigo-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 shadow-sm"
                  >
                    <option value="all">All Methods</option>
                    <option value="CARD">Card</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="WALLET">Wallet</option>
                  </select>
                  <select
                    value={filterAmount}
                    onChange={(e) => setFilterAmount(e.target.value)}
                    className="px-4 py-3 border border-indigo-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 shadow-sm"
                  >
                    <option value="all">All Amounts</option>
                    <option value="lt100">Less than ₹100</option>
                    <option value="100to500">₹100 - ₹500</option>
                    <option value="gt500">More than ₹500</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 border border-indigo-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 shadow-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="px-4 py-3 border border-indigo-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 shadow-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_3_months">Last 3 Months</option>
                    <option value="last_year">Last Year</option>
                  </select>
                </div>
                <div className="flex gap-4 ml-auto">
                  <Button variant="outline" className="flex items-center gap-2 bg-white/70 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow" onClick={() => {}}>
                    <Filter size={20} />
                    More Filters
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 bg-white/70 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow" onClick={exportAllPayments}>
                    <Download size={20} />
                    Export All
                  </Button>
                </div>
              </div>
            </Card>
            {/* Payment History Table - sticky header, zebra striping, tooltips */}
            <Card className="bg-white/95 backdrop-blur-lg border border-slate-100 shadow-2xl p-8 rounded-2xl animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-20">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredPayments.map((payment, idx) => (
                      <tr key={payment.id} className={idx % 2 === 0 ? "bg-white hover:bg-indigo-50 transition-colors" : "bg-indigo-50/30 hover:bg-indigo-100 transition-colors"}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-base font-bold text-slate-900">{getPlanDisplayName(payment.plan)}</div>
                              <div className="text-xs text-slate-500">ID: {payment.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-base text-slate-900">
                            <Calendar size={16} className="mr-2 text-slate-400" />
                            {new Date(payment.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-base font-bold text-slate-900">₹{payment.amount.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-base text-slate-700">
                            {getPaymentMethodIcon(payment.method)}
                            <span className="ml-2">{getMethodDisplayName(payment.method)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(payment.status)}
                            <span className={`ml-2 inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.status)}`}>{payment.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-bold">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => viewPaymentDetail(payment)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center relative group"
                            >
                              <Eye size={16} className="mr-2" />
                              View
                              <span className="absolute left-0 -top-7 opacity-0 group-hover:opacity-100 transition bg-slate-800 text-white text-xs rounded px-2 py-1 pointer-events-none">View details</span>
                            </button>
                            {payment.status === 'PAID' && (
                              <button
                                onClick={() => downloadInvoice(payment.id)}
                                className="text-emerald-600 hover:text-emerald-900 flex items-center relative group"
                              >
                                <Download size={16} className="mr-2" />
                                Invoice
                                <span className="absolute left-0 -top-7 opacity-0 group-hover:opacity-100 transition bg-slate-800 text-white text-xs rounded px-2 py-1 pointer-events-none">Download invoice</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            {/* Empty State */}
            {filteredPayments.length === 0 && (
              <Card className="text-center py-20 bg-white/95 backdrop-blur-lg border border-slate-100 shadow-2xl rounded-2xl mt-10 animate-fade-in">
                <div className="text-slate-400 mb-8">
                  <CreditCard size={64} className="mx-auto animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No payments found</h3>
                <p className="text-slate-500 text-lg">
                  {error 
                    ? 'There was an issue loading your payment history.'
                    : filterStatus !== 'all' || filterPeriod !== 'all'
                    ? 'Try adjusting your filter criteria.'
                    : user?.role?.toLowerCase() === 'student' 
                    ? 'You have no payment history yet. Payments will appear here once you join a library and make payments.'
                    : user?.role?.toLowerCase() === 'library_owner' || user?.role?.toLowerCase() === 'owner'
                    ? 'No payment history found. Payments from students in your library will appear here.'
                    : 'Your payment history will appear here.'}
                </p>
                {user?.role?.toLowerCase() === 'student' && !error && (
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
                      onClick={() => navigate('/student/dashboard')}
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                )}
              </Card>
            )}
            {/* Payment Detail Modal - animated */}
            <Modal
              isOpen={isDetailModalOpen}
              onClose={() => setIsDetailModalOpen(false)}
              title="Payment Details"
              className="animate-fade-in"
            >
              {selectedPayment && (
                <div className="space-y-10">
                  {/* Payment Header */}
                  <div className="flex items-center justify-between p-8 bg-slate-50 rounded-2xl shadow">
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900">{getPlanDisplayName(selectedPayment.plan)}</h4>
                      <p className="text-base text-slate-600">Payment ID: {selectedPayment.id}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-extrabold text-slate-900">₹{selectedPayment.amount.toFixed(2)}</div>
                      <div className="flex items-center justify-end mt-3">
                        {getStatusIcon(selectedPayment.status)}
                        <span className={`ml-2 px-4 py-2 text-sm font-semibold rounded-full ${getStatusBadge(selectedPayment.status)}`}>{selectedPayment.status}</span>
                      </div>
                    </div>
                  </div>
                  {/* Payment Details */}
                  <div className="grid grid-cols-2 gap-10">
                    <div>
                      <label className="text-base font-semibold text-slate-600">Payment Date</label>
                      <p className="text-slate-900 text-lg">{new Date(selectedPayment.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-base font-semibold text-slate-600">Payment Method</label>
                      <div className="flex items-center">
                        {getPaymentMethodIcon(selectedPayment.method)}
                        <span className="ml-2 text-slate-900 text-lg">{getMethodDisplayName(selectedPayment.method)}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-base font-semibold text-slate-600">Transaction Type</label>
                      <p className="text-slate-900 text-lg">Subscription Payment</p>
                    </div>
                    <div>
                      <label className="text-base font-semibold text-slate-600">Reference</label>
                      <p className="text-slate-900 text-lg">TXN-{selectedPayment.id}-2024</p>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-6 pt-8 border-t">
                    {selectedPayment.status === 'PAID' && (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => downloadInvoice(selectedPayment.id)}
                        className="flex items-center gap-3 shadow-md"
                      >
                        <Download size={20} />
                        Download Invoice
                      </Button>
                    )}
                    <Button variant="outline" size="md" className="rounded-xl shadow-md">Print Receipt</Button>
                    <Button variant="outline" size="md" className="rounded-xl shadow-md">Email Receipt</Button>
                  </div>
                </div>
              )}
            </Modal>
          </div>
          {/* Sidebar: Quick Actions - sticky, more vibrant */}
          <div className="space-y-12 lg:sticky lg:top-24 h-fit animate-fade-in">
            <Card className="bg-white/95 backdrop-blur-lg border border-slate-100 shadow-2xl p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Quick Actions</h3>
              <div className="space-y-5">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-indigo-200 to-indigo-100 hover:from-indigo-300 hover:to-indigo-200 rounded-xl shadow-lg flex items-center gap-4 text-indigo-900 font-semibold text-lg"
                  onClick={() => navigate('/student/dashboard')}
                >
                  View Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-emerald-200 to-emerald-100 hover:from-emerald-300 hover:to-emerald-200 rounded-xl shadow-lg flex items-center gap-4 text-emerald-900 font-semibold text-lg"
                  onClick={() => navigate('/student/books')}
                >
                  Browse Books
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-amber-200 to-amber-100 hover:from-amber-300 hover:to-amber-200 rounded-xl shadow-lg flex items-center gap-4 text-amber-900 font-semibold text-lg"
                  onClick={() => navigate('/student/profile')}
                >
                  Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-blue-200 to-blue-100 hover:from-blue-300 hover:to-blue-200 rounded-xl shadow-lg flex items-center gap-4 text-blue-900 font-semibold text-lg"
                  onClick={() => navigate('/support')}
                >
                  Contact Support
                </Button>
              </div>
            </Card>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );

}
export default PaymentHistory;