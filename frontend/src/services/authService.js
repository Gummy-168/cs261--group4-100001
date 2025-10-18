// ...existing code...
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export const login = async (identifier, password) => {
  // identifier = อีเมลหรือรหัสนักศึกษา
  const id = (identifier || '').toString().trim();
  const payload = {};

  if (id.includes('@')) {
    payload.email = id;
  } else {
    // ถ้ารหัสนักศึกษาของคุณไม่มี '@' ให้ส่งเป็น student_id ตามที่ backend ต้องการ
    payload.student_id = id;
  }

  const response = await axios.post(`${API_URL}/login`, {
    ...payload,
    password
  });
  return response.data;
};

export const register = async (email, password, name) => {
  const response = await axios.post(`${API_URL}/register`, {
    email,
    password,
    name
  });
  return response.data;
};
