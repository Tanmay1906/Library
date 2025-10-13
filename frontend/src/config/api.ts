/**
 * API Configuration
 * Centralized API base URL configuration
 */

// Normalize env values to avoid trailing slashes and ensure consistent /api base
const envApi = import.meta.env.VITE_API_URL;
const defaultApi = 'http://localhost:4000/api';
const base = envApi ? String(envApi).replace(/\/+$/, '') : defaultApi;

const envUpload = import.meta.env.VITE_UPLOAD_URL;
const uploadBase = envUpload ? String(envUpload).replace(/\/+$/, '') : `${base}/upload`;

export const API_CONFIG = {
  BASE_URL: base,
  UPLOAD_URL: uploadBase
};

export default API_CONFIG;