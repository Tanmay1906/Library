import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';

// Lazy load components for better performance
const Login = React.lazy(() => import('./pages/Login'));
const OTPLogin = React.lazy(() => import('./pages/OTPLogin'));
const Signup = React.lazy(() => import('./pages/Signup'));
const StudentActivation = React.lazy(() => import('./pages/StudentActivation'));
const OTPVerification = React.lazy(() => import('./pages/OTPVerification'));

// Library Owner Pages - Lazy loaded
const LibraryOwnerDashboard = React.lazy(() => import('./pages/LibraryOwner/Dashboard'));
const AddStudent = React.lazy(() => import('./pages/LibraryOwner/AddStudent'));
const EditStudent = React.lazy(() => import('./pages/LibraryOwner/EditStudent'));
const StudentsList = React.lazy(() => import('./pages/LibraryOwner/StudentsList'));
const LibraryInfo = React.lazy(() => import('./pages/LibraryOwner/LibraryInfo'));
const Notifications = React.lazy(() => import('./pages/LibraryOwner/Notifications'));
const LibraryOwnerProfile = React.lazy(() => import('./pages/LibraryOwner/Profile'));

// Student Pages - Lazy loaded
const StudentDashboard = React.lazy(() => import('./pages/Student/Dashboard'));
const MyLibrary = React.lazy(() => import('./pages/Student/MyLibrary'));
const Books = React.lazy(() => import('./pages/Student/Books'));
const PaymentHistory = React.lazy(() => import('./pages/Student/PaymentHistory'));
const Wishlist = React.lazy(() => import('./pages/Student/Wishlist'));
const UpgradePlan = React.lazy(() => import('./pages/Student/UpgradePlan'));
const UpdatePayment = React.lazy(() => import('./pages/Student/UpdatePayment'));
const CompletedBooks = React.lazy(() => import('./pages/Student/CompletedBooks'));
const CurrentlyReading = React.lazy(() => import('./pages/Student/CurrentlyReading'));
const StudentProfile = React.lazy(() => import('./pages/Student/Profile'));

// Other Pages - Lazy loaded
const BookReader = React.lazy(() => import('./pages/BookReader'));
const ContactSupport = React.lazy(() => import('./pages/ContactSupport'));
const ResponsiveTest = React.lazy(() => import('./pages/ResponsiveTest'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const DevLogin = React.lazy(() => import('./pages/DevLogin'));
const HomePage = React.lazy(() => import('./pages/Home'));
const AuthDebug = React.lazy(() => import('./pages/AuthDebug'));

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
      <p className="mt-4 text-white font-medium">Loading...</p>
    </div>
  </div>
);

/**
 * Protected Route Component - Optimized
 * Handles route protection based on authentication and user role
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isAuthenticated } = useAuth();
  
  // Optimized localStorage check - only when context is empty
  const [localStorageAuth, setLocalStorageAuth] = React.useState<any>(null);
  
  React.useEffect(() => {
    // Only check localStorage if context auth is not available
    if (!isAuthenticated && !user) {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          setLocalStorageAuth(userData);
        } catch {
          setLocalStorageAuth(null);
        }
      } else {
        setLocalStorageAuth(null);
      }
    }
  }, [user, isAuthenticated]);
  
  // Use context auth first, fallback to localStorage
  const effectiveUser = user || localStorageAuth;
  const effectiveAuth = isAuthenticated || (localStorageAuth && localStorage.getItem('token'));
  
  if (!effectiveAuth) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && effectiveUser?.role !== requiredRole) {
    return <Navigate to={effectiveUser?.role === 'student' ? '/student/dashboard' : '/owner/dashboard'} replace />;
  }
  
  return <>{children}</>;
};

/**
 * Home Component - Landing Page
 * Shows available books and login options
 */
const Home: React.FC = () => {
  return <HomePage />;
};

/**
 * Main App Component
 * Handles routing and authentication flow for the Library Management System
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-x-hidden">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/otp-login" element={<OTPLogin />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/activate-student" element={<StudentActivation />} />
              <Route path="/otp-verification" element={<OTPVerification />} />
              <Route path="/responsive-test" element={<ResponsiveTest />} />
              <Route path="/auth-debug" element={<AuthDebug />} />
            {/* Library Owner Routes */}
            <Route 
              path="/owner/dashboard" 
              element={
                <ProtectedRoute requiredRole="owner">
                  <LibraryOwnerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/currently-reading" 
              element={
                <ProtectedRoute requiredRole="student">
                  <CurrentlyReading />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/upgrade-plan" 
              element={
                <ProtectedRoute requiredRole="student">
                  <UpgradePlan />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/update-payment" 
              element={
                <ProtectedRoute requiredRole="student">
                  <UpdatePayment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/wishlist" 
              element={
                <ProtectedRoute requiredRole="student">
                  <Wishlist />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/completed-books" 
              element={
                <ProtectedRoute requiredRole="student">
                  <CompletedBooks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/owner/add-student" 
              element={
                <ProtectedRoute requiredRole="owner">
                  <AddStudent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/owner/edit-student/:studentId" 
              element={
                <ProtectedRoute requiredRole="owner">
                  <EditStudent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/owner/students" 
              element={
                <ProtectedRoute requiredRole="owner">
                  <StudentsList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/owner/library-info" 
              element={
                <ProtectedRoute requiredRole="owner">
                  <LibraryInfo />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/owner/notifications" 
              element={
                <ProtectedRoute requiredRole="owner">
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/owner/profile" 
              element={
                <ProtectedRoute requiredRole="owner">
                  <LibraryOwnerProfile />
                </ProtectedRoute>
              } 
            />
            
            {/* Student Routes */}
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/my-library" 
              element={
                <ProtectedRoute requiredRole="student">
                  <MyLibrary />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/books" 
              element={
                <ProtectedRoute requiredRole="student">
                  <Books />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/payment-history" 
              element={
                <ProtectedRoute requiredRole="student">
                  <PaymentHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/profile" 
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentProfile />
                </ProtectedRoute>
              } 
            />
            
            {/* Shared Routes */}
            <Route 
              path="/support" 
              element={
                <ProtectedRoute>
                  <ContactSupport />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/book-reader/:bookId" 
              element={
                <ProtectedRoute>
                  <BookReader />
                </ProtectedRoute>
              } 
            />
            
            {/* Default Redirect */}
            <Route path="/" element={<Home />} />
            
            {/* Development Helper Route */}
            <Route path="/dev" element={<DevLogin />} />
            
            {/* Direct Books Access for Testing */}
            <Route path="/books" element={<Books />} />
            
            {/* 404 Not Found - catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  </AuthProvider>
);
}

export default App;