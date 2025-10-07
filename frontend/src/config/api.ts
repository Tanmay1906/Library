/**
 * API Configuration
 * Centralized API base URL configuration
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  UPLOAD_URL: import.meta.env.VITE_UPLOAD_URL || 'http://localhost:4000/api/upload'
};

export default API_CONFIG;