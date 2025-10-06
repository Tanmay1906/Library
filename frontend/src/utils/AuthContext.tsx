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
  isLoading: boolean;
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingUser, setPendingUser] = useState<any>(null);

  // Restore authentication state on app initialization
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    
    // Set loading to false after initialization
    setIsLoading(false);
  }, []); // Only run once on mount

  const login = async (email: string, password: string, role: 'owner' | 'student' = 'student'): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
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
            token: data.data.token
          };
          
          console.log('Setting user data:', userData);
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', data.data.token);
          return true;
        }
      }
      
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Login failed:', errorData.error || 'Authentication failed');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const completeLogin = async (email: string, code: string, role: 'owner' | 'student'): Promise<boolean> => {
    try {
      console.log('🔄 Attempting completeLogin with:', { email, code: '***', role });
      
      const requestBody = {
        email,
        code,
        role: role === 'owner' ? 'admin' : role
      };
      
      console.log('📤 Request body:', requestBody);
      
      const response = await fetch('http://localhost:4000/api/auth/complete-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Complete login response status:', response.status);
      console.log('📥 Complete login response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Complete login response data:', data);
        
        if (!data.success || !data.data || !data.data.user) {
          console.error('❌ Invalid response structure:', data);
          return false;
        }
        
        const userData: User = {
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          role: data.data.user.role === 'LIBRARY_OWNER' ? 'owner' : 'student',
          libraryId: data.data.user.libraryId,
          phone: data.data.user.phone,
          registrationNumber: data.data.user.registrationNumber,
          token: data.data.token
        };
        
        console.log('👤 Mapped user data:', userData);
        
        // Set state first
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ React state updated');
        
        // Then save to localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.data.token);
        console.log('💾 Data saved to localStorage');
        
        // Force a small delay to ensure everything is saved
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify storage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        console.log('🔍 Verification - stored user:', storedUser ? 'Present' : 'Missing');
        console.log('🔍 Verification - stored token:', storedToken ? 'Present' : 'Missing');
        
        console.log('✅ Authentication state updated successfully');
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Login completion failed:', response.status, errorData.message || 'OTP verification failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Login completion error:', error);
      return false;
    }
  };

  const loginWithOTP = async (email: string, role: 'owner' | 'student' = 'student'): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/login-with-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          role: role === 'owner' ? 'admin' : role
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Store email and role for OTP verification step
          setPendingUser({ email, role });
          return true;
        }
      } else {
        const errorData = await response.json();
        console.error('Login with OTP failed:', errorData.message || 'Failed to send OTP');
        return false;
      }
    } catch (error) {
      console.error('Login with OTP error:', error);
      return false;
    }
    return false;
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      // Convert frontend role to backend role and remove fields the backend doesn't expect
      const { confirmPassword, libraryName, libraryDescription, ...cleanUserData } = userData;
      const backendUserData = {
        ...cleanUserData,
        role: userData.role === 'owner' ? 'admin' : userData.role,
        // Include libraryId for students if provided and not empty
        ...(userData.role === 'student' && userData.libraryId && userData.libraryId.trim() !== '' && { 
          libraryId: userData.libraryId 
        })
      };

      // Remove libraryId if it's empty or undefined for students
      if (userData.role === 'student' && (!userData.libraryId || userData.libraryId.trim() === '')) {
        delete backendUserData.libraryId;
      }

      const response = await fetch('http://localhost:4000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendUserData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // For immediate login after signup, store user data and token
          if (data.token && data.user) {
            const user: User = {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role === 'admin' ? 'owner' : data.user.role,
              libraryId: data.user.libraryId,
              phone: data.user.phone,
              registrationNumber: data.user.registrationNumber,
              token: data.token
            };
            
            setUser(user);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', data.token);
            setPendingUser(null);
            return true;
          } else {
            // If no immediate login, set as pending for OTP verification
            setPendingUser(userData);
            return true;
          }
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || 'Registration failed';
        console.error('Signup failed:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
    
    return false;
  };

  const activateStudent = async (activationData: any): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/activate-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activationData),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          const user: User = {
            id: data.data.user.id,
            name: data.data.user.name,
            email: data.data.user.email,
            role: 'student',
            libraryId: data.data.user.libraryId,
            registrationNumber: data.data.user.registrationNumber,
            token: data.data.token
          };
          
          setUser(user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', data.data.token);
          return true;
        }
      } else {
        const errorData = await response.json();
        console.error('Activation failed:', errorData.message || errorData.error || 'Activation failed');
        return false;
      }
    } catch (error) {
      console.error('Activation error:', error);
      return false;
    }
    return false;
  };

  const verifyOTP = async (otp: string): Promise<boolean> => {
    try {
      if (otp.length === 4 && pendingUser) {
        const userData: User = {
          id: Date.now().toString(),
          name: pendingUser.name,
          email: pendingUser.email,
          role: pendingUser.role,
          libraryId: pendingUser.role === 'student' ? 'lib-001' : undefined,
          phone: pendingUser.phone,
          registrationNumber: pendingUser.registrationNumber,
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        setPendingUser(null);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('OTP verification error:', error);
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

  const value = {
    user,
    isAuthenticated,
    isLoading,
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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
