/**
 * API Utility Functions
 * Handles authenticated API requests with proper error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Get authorization headers with token
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    // Only log token in development
    if (import.meta.env.DEV) {
      console.debug(`Using token: ${token.substring(0, 10)}...${token.substring(token.length - 10)}`);
    }
  } else if (import.meta.env.DEV) {
    console.warn('No authentication token found in localStorage');
  }
  
  return headers;
};

/**
 * Make authenticated API request
 */
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Only clear tokens on 401 Unauthorized (not 403 Forbidden)
      // 401 specifically means invalid/expired token
      if (response.status === 401) {
        console.warn('Authentication token invalid, clearing stored data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only reload if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return;
      }
      let message = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errBody = await response.json();
        message = errBody?.message || errBody?.error || message;
      } catch {}
      throw new Error(message);
    }

    const result = await response.json();
    
    // If the response has a 'data' property, return that, otherwise return the whole response
    return result.data || result;
  } catch (error) {
    // Check if it's a network error (fetch failed completely)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`Network error for ${endpoint}:`, error.message);
      throw new Error(`Unable to connect to server. Please check if the backend is running.`);
    }
    
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * API methods for different resources
 */
export const api = {
  // Books
  getBooks: () => apiRequest('/books'),
  getBook: (id: string) => apiRequest(`/books/${id}`),
  
  // Libraries
  getLibraries: () => apiRequest('/libraries'),
  getLibrary: (id: string) => apiRequest(`/libraries/${id}`),
  
  // Student specific
  getStudentBooks: () => apiRequest('/students/books'),
  getStudentDashboard: () => apiRequest('/students/dashboard'),
  getStudentActivity: () => apiRequest('/students/activity'),
  getStudentProgress: () => apiRequest('/students/progress'),
  getPaymentHistory: () => apiRequest('/payments/history'),
  downloadInvoice: (paymentId: string) => apiRequest(`/payments/${paymentId}/invoice`),
  
  // Generic GET request
  get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
  
  // Generic POST request
  post: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Generic PUT request
  put: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Generic DELETE request
  delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' }),
};

export default api;