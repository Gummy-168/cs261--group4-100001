import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

/**
 * Login กับ TU API
 * @param {string} identifier - รหัสนักศึกษา
 * @param {string} password - รหัสผ่าน
 * @returns {Promise<any>} ข้อมูลตอบกลับจาก Backend
 */
export const login = async (identifier, password) => {
  const username = (identifier || '').toString().trim();

  if (!username || !password) {
    throw new Error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
  }

  try {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password,
    });

    return response.data;
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
 * Register (เผื่อไว้ หากมี endpoint)
 */
export const register = async (email, password, name) => {
  const response = await axios.post(`${API_URL}/register`, {
    email,
    password,
    name,
  });
  return response.data;
};

