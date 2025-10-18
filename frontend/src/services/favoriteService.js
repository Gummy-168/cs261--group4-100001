import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * เพิ่ม Event ลง Favorites
 * @param {number} userId - ID ของผู้ใช้
 * @param {number} activityId - ID ของกิจกรรม
 * @returns {Promise<Object>}
 */
export const addFavorite = async (userId, activityId) => {
  try {
    const response = await axios.post(`${API_URL}/favorites`, {
      userId,
      activityId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw new Error(error.response?.data?.message || 'ไม่สามารถบันทึกกิจกรรมได้');
  }
};

/**
 * ลบ Event ออกจาก Favorites
 * @param {number} userId - ID ของผู้ใช้
 * @param {number} activityId - ID ของกิจกรรม
 * @returns {Promise<void>}
 */
export const removeFavorite = async (userId, activityId) => {
  try {
    await axios.delete(`${API_URL}/favorites`, {
      data: {
        userId,
        activityId
      }
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw new Error(error.response?.data?.message || 'ไม่สามารถลบกิจกรรมออกจากรายการโปรดได้');
  }
};

/**
 * ดึงรายการ Favorites ของ User
 * @param {number} userId - ID ของผู้ใช้
 * @returns {Promise<Array>}
 */
export const getFavoritesByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/favorites/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw new Error(error.response?.data?.message || 'ไม่สามารถโหลดรายการโปรดได้');
  }
};

/**
 * Toggle Favorite (เพิ่มหรือลบ)
 * @param {number} userId
 * @param {number} activityId
 * @param {boolean} isFavorited - สถานะปัจจุบัน
 * @returns {Promise<Object|void>}
 */
export const toggleFavorite = async (userId, activityId, isFavorited) => {
  if (isFavorited) {
    // ถ้า favorite อยู่แล้ว ให้ลบออก
    return await removeFavorite(userId, activityId);
  } else {
    // ถ้ายังไม่ favorite ให้เพิ่ม
    return await addFavorite(userId, activityId);
  }
};
