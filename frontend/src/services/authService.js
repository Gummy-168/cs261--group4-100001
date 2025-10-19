import axiosInstance from '../lib/axiosInstance';

/**
 * Login กับ TU API
 * @param {string} identifier - รหัสนักศึกษา
 * @param {string} password - รหัสผ่าน
 * @param {boolean} remember - จำการเข้าสู่ระบบ
 * @returns {Promise<any>} ข้อมูลตอบกลับจาก Backend (รวม JWT token)
 */
export const login = async (identifier, password, remember = true) => {
  const username = (identifier || '').toString().trim();

  if (!username || !password) {
    throw new Error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
  }

  try {
    const response = await axiosInstance.post('/auth/login', {
      username,
      password,
    });

    const data = response.data;

    // Store token and userId
    if (data.status && data.token) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.userId.toString());
    }

    return data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'เข้าสู่ระบบล้มเหลว');
    } else if (error.request) {
      throw new Error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
    } else {
      throw new Error(error.message);
    }
  }
};

/**
 * Validate current JWT token
 * @returns {Promise<any>} Validation result
 */
export const validateToken = async () => {
  try {
    const response = await axiosInstance.get('/auth/validate');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Token validation failed');
  }
};

/**
 * Logout - clear all auth data
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('profileDraft');
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  return !!token;
};

/**
 * Get current auth token
 * @returns {string|null}
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};
