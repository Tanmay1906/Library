import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'student';
  libraryId?: string;
  phone?: string;
  registrationNumber?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: 'owner' | 'student') => Promise<boolean>;
  completeLogin: (email: string, code: string, role: 'owner' | 'student') => Promise<boolean>;
  loginWithOTP: (email: string, role?: 'owner' | 'student') => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  activateStudent: (activationData: any) => Promise<boolean>;
  verifyOTP: (otp: string) => Promise<boolean>;
  logout: () => void;
  pendingUser: any;
  setPendingUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Optimized API helper function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('API call error:', error);
    }
    throw error;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('user');
  });
  const [pendingUser, setPendingUser] = useState<any>(null);

  // Optimized authentication state restoration
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken && !user) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } else if (!storedUser || !storedToken) {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const login = async (email: string, password: string, role: 'owner' | 'student' = 'student'): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: role === 'owner' ? 'admin' : role
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data && data.data.user) {
          // Direct login success
          const userData: User = {
            id: data.data.user.id,
            name: data.data.user.name,
            email: data.data.user.email,
            role: data.data.user.role === 'LIBRARY_OWNER' ? 'owner' : 'student',
            libraryId: data.data.user.libraryId,
            phone: data.data.user.phone,
            registrationNumber: data.data.user.registrationNumber,
          };

          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', data.data.token);
          return true;
        } else if (data.message && data.message.includes('OTP')) {
          // OTP required
          setPendingUser({ email, role });
          return false; // OTP required
        }
      }
      return false;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Login error:', error);
      }
      return false;
    }
  };

  const completeLogin = async (email: string, code: string, role: 'owner' | 'student'): Promise<boolean> => {
    try {
      const requestBody = {
        email,
        code,
        role: role === 'owner' ? 'admin' : role
      };

      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data && data.data.user) {
          const userData: User = {
            id: data.data.user.id,
            name: data.data.user.name,
            email: data.data.user.email,
            role: data.data.user.role === 'LIBRARY_OWNER' ? 'owner' : 'student',
            libraryId: data.data.user.libraryId,
            phone: data.data.user.phone,
            registrationNumber: data.data.user.registrationNumber,
          };

          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', data.data.token);
          
          return true;
        }
      }
      return false;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Complete login error:', error);
      }
      return false;
    }
  };

  const loginWithOTP = async (email: string, role: 'owner' | 'student' = 'student'): Promise<boolean> => {
    try {
      const response = await apiCall('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({
          email,
          role: role === 'owner' ? 'admin' : role
        }),
      });

      if (response.success) {
        setPendingUser({ email, role });
        return true;
      }
      return false;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('OTP login error:', error);
      }
      return false;
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      const response = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return response.success;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Signup error:', error);
      }
      return false;
    }
  };

  const activateStudent = async (activationData: any): Promise<boolean> => {
    try {
      const response = await apiCall('/auth/activate-student', {
        method: 'POST',
        body: JSON.stringify(activationData),
      });

      return response.success;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Student activation error:', error);
      }
      return false;
    }
  };

  const verifyOTP = async (otp: string): Promise<boolean> => {
    try {
      const response = await apiCall('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ otp }),
      });

      return response.success;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('OTP verification error:', error);
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setPendingUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    login,
    completeLogin,
    loginWithOTP,
    signup,
    activateStudent,
    verifyOTP,
    logout,
    pendingUser,
    setPendingUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};