import axiosInstance from '../lib/axiosInstance';

/**
 * เพิ่ม Event ลง Favorites
 * @param {number} eventId - ID ของกิจกรรม
 * @param {number} userId - ID ผู้ใช้
 * @returns {Promise<Object>}
 */
export const addFavorite = async (eventId, userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    const response = await axiosInstance.post('/favorites', {
      userId,
      eventId,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw new Error(error.message || 'ไม่สามารถบันทึกกิจกรรมได้');
  }
};

/**
 * ลบ Event ออกจาก Favorites
 * @param {number} eventId - ID ของกิจกรรม
 * @param {number} userId - ID ผู้ใช้
 * @returns {Promise<void>}
 */
export const removeFavorite = async (eventId, userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    await axiosInstance.delete('/favorites', {
      data: { userId, eventId },
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw new Error(error.message || 'ไม่สามารถลบกิจกรรมออกจากรายการโปรดได้');
  }
};

/**
 * ดึงรายการ Favorites ของ User ที่ login อยู่
 * @returns {Promise<Array>}
 */
export const getFavoritesByUser = async () => {
  try {
    const response = await axiosInstance.get('/favorites/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw new Error(error.message || 'ไม่สามารถโหลดรายการโปรดได้');
  }
};

/**
 * ตรวจสอบว่า event ถูก favorite หรือยัง
 * @param {number} eventId - ID ของกิจกรรม
 * @returns {Promise<boolean>}
 */
export const checkIsFavorited = async (eventId) => {
  try {
    const response = await axiosInstance.get(`/favorites/check/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

/**
 * ดึงจำนวน favorites ของ event
 * @param {number} eventId - ID ของกิจกรรม
 * @returns {Promise<number>}
 */
export const getFavoriteCount = async (eventId) => {
  try {
    const response = await axiosInstance.get(`/favorites/event/${eventId}/count`);
    return response.data;
  } catch (error) {
    console.error('Error fetching favorite count:', error);
    return 0;
  }
};

/**
 * Toggle Favorite (เพิ่มหรือลบ)
 * @param {number} eventId
 * @param {boolean} isFavorited - สถานะปัจจุบัน
 * @returns {Promise<Object|void>}
 */
export const toggleFavorite = async (eventId, isFavorited, userId) => {
  if (isFavorited) {
    // ถ้า favorite อยู่แล้ว ให้ลบออก
    return await removeFavorite(eventId, userId);
  } else {
    // ถ้ายังไม่ favorite ให้เพิ่ม
    return await addFavorite(eventId, userId);
  }
};
