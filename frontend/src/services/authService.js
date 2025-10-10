import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

/**
 * Login ผ่าน TU API
 * @param {string} identifier - รหัสนักศึกษาหรืออีเมล
 * @param {string} password - รหัสผ่าน
 * @returns {Promise} Response จาก Backend
 */
export const login = async (identifier, password) => {
  // ลบช่องว่างหน้า-หลัง
  const username = (identifier || '').toString().trim();

  // ตรวจสอบว่ามีข้อมูลครบหรือไม่
  if (!username || !password) {
    throw new Error('กรุณากรอก Username และ Password');
  }

  try {
    // ส่ง request ไปยัง Backend
    const response = await axios.post(`${API_URL}/login`, {
      username: username,
      password: password
    });

    return response.data;
  } catch (error) {
    // จัดการ error
    if (error.response) {
      // Backend ตอบกลับมา แต่เป็น error
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.request) {
      // ส่ง request ไปแล้ว แต่ไม่ได้ response
      throw new Error('Cannot connect to server');
    } else {
      // Error อื่นๆ
      throw new Error(error.message);
    }
  }
};

/**
 * Register (ถ้ามี endpoint นี้)
 */
export const register = async (email, password, name) => {
  const response = await axios.post(`${API_URL}/register`, {
    email,
    password,
    name
  });
  return response.data;
};