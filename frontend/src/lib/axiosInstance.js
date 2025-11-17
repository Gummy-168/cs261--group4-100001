import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // เพิ่มเป็น 30 วินาที (แก้ปัญหา cold start)
});

// Request interceptor - Add JWT token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // ---
    // โค้ดที่แก้ไข: เปลี่ยนตรรกะการแนบ Token
    // ---
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    // ตรรกะใหม่:
    // 1. ตรวจสอบ Admin Token ก่อนเสมอ
    //    ถ้ามี adminToken ให้ใช้ Token นี้ทันทีสำหรับทุก Request
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } 
    // 2. ถ้าไม่มี Admin Token (เช่น เป็น User ทั่วไป)
    //    ให้ตรวจสอบและใช้ userToken แทน
    else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    // 3. ถ้าไม่มี Token ทั้งคู่ (เช่น หน้า Public) ก็จะไม่แนบ Header ไป

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
  async (error) => {
    const originalRequest = error.config;

    // Retry logic สำหรับ network errors (ยกเว้น login)
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      if (!originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
        originalRequest._retry = true;
        console.log('🔄 Retrying request...');
        return axiosInstance(originalRequest);
      }
    }

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
          // อย่า redirect ถ้าอยู่ที่หน้า login อยู่แล้ว
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
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
      return Promise.reject(new Error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองอีกครั้ง'));
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;
export { API_BASE_URL };