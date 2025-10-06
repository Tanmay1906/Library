import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

/**
 * Development Helper Component
 * Auto-logs in as a student and redirects to books page
 */
const DevLogin: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const autoLogin = async () => {
      if (!isAuthenticated) {
        console.log('Auto-logging in as student for development...');
        const success = await login('student@test.com', 'student', '123456789012');
        if (success) {
          console.log('Auto-login successful, redirecting to books...');
          navigate('/student/books');
        } else {
          console.error('Auto-login failed');
        }
      } else {
        console.log('Already authenticated, redirecting to books...');
        navigate('/student/books');
      }
    };

    autoLogin();
  }, [login, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Setting up development environment...</p>
        <p className="text-sm text-gray-500 mt-2">Auto-logging in as student and redirecting to books</p>
      </div>
    </div>
  );
};

export default DevLogin;