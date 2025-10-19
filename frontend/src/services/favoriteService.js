import axiosInstance from '../lib/axiosInstance';

/**
 * เพิ่ม Event ลง Favorites
 * @param {number} userId - ID ของผู้ใช้
 * @param {number} eventId - ID ของกิจกรรม
 * @returns {Promise<Object>}
 */
export const addFavorite = async (userId, eventId) => {
  try {
    const response = await axiosInstance.post('/favorites', {
      userId,
      eventId: eventId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw new Error(error.message || 'ไม่สามารถบันทึกกิจกรรมได้');
  }
};

/**
 * ลบ Event ออกจาก Favorites
 * @param {number} userId - ID ของผู้ใช้
 * @param {number} eventId - ID ของกิจกรรม
 * @returns {Promise<void>}
 */
export const removeFavorite = async (userId, eventId) => {
  try {
    await axiosInstance.delete('/favorites', {
      data: {
        userId,
        eventId: eventId
      }
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw new Error(error.message || 'ไม่สามารถลบกิจกรรมออกจากรายการโปรดได้');
  }
};

/**
 * ดึงรายการ Favorites ของ User
 * @param {number} userId - ID ของผู้ใช้
 * @returns {Promise<Array>}
 */
export const getFavoritesByUser = async (userId) => {
  try {
    const response = await axiosInstance.get(`/favorites/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw new Error(error.message || 'ไม่สามารถโหลดรายการโปรดได้');
  }
};

/**
 * Toggle Favorite (เพิ่มหรือลบ)
 * @param {number} userId
 * @param {number} eventId
 * @param {boolean} isFavorited - สถานะปัจจุบัน
 * @returns {Promise<Object|void>}
 */
export const toggleFavorite = async (userId, eventId, isFavorited) => {
  if (isFavorited) {
    // ถ้า favorite อยู่แล้ว ให้ลบออก
    return await removeFavorite(userId, eventId);
  } else {
    // ถ้ายังไม่ favorite ให้เพิ่ม
    return await addFavorite(userId, eventId);
  }
};
