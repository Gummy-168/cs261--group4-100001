import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - Add JWT token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage or sessionStorage
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          console.error('Unauthorized access - please login again');
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          localStorage.removeItem('userId');
          window.location.href = '/login';
          break;
          
        case 403:
          console.error('Forbidden - insufficient permissions');
          break;
          
        case 404:
          console.error('Resource not found');
          break;
          
        case 500:
          console.error('Server error - please try again later');
          break;
          
        default:
          console.error(`Error ${status}: ${data?.message || 'Unknown error'}`);
      }
      
      return Promise.reject(new Error(data?.message || `Error ${status}`));
    } else if (error.request) {
      // Request was made but no response
      console.error('Network error - no response from server');
      return Promise.reject(new Error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์'));
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;
export { API_BASE_URL };
