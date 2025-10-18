import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * ดึงข้อมูล Events ทั้งหมดในรูปแบบ Card
 * @returns {Promise<Array>} รายการ Events
 */
export const getAllEventCards = async () => {
  try {
    const response = await axios.get(`${API_URL}/events/cards`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event cards:', error);
    throw new Error(error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลกิจกรรมได้');
  }
};

/**
 * ดึงข้อมูล Events พร้อมสถานะ Favorite สำหรับ User
 * @param {number} userId - ID ของผู้ใช้
 * @returns {Promise<Array>} รายการ Events พร้อม isFavorited
 */
export const getEventCardsForUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/events/cards/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event cards for user:', error);
    throw new Error(error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลกิจกรรมได้');
  }
};

/**
 * ดึงข้อมูล Event ทั้งหมด (รูปแบบปกติ)
 * @returns {Promise<Array>}
 */
export const getAllEvents = async () => {
  try {
    const response = await axios.get(`${API_URL}/events`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error(error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลกิจกรรมได้');
  }
};

/**
 * ดึงข้อมูล Event เดียวตาม ID
 * @param {number} eventId - ID ของกิจกรรม
 * @returns {Promise<Object>}
 */
export const getEventById = async (eventId) => {
  try {
    const response = await axios.get(`${API_URL}/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    throw new Error(error.response?.data?.message || 'ไม่พบกิจกรรมที่ต้องการ');
  }
};

/**
 * สร้าง Event ใหม่ (สำหรับ Admin)
 * @param {Object} eventData - ข้อมูลกิจกรรม
 * @returns {Promise<Object>}
 */
export const createEvent = async (eventData) => {
  try {
    const response = await axios.post(`${API_URL}/events`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error(error.response?.data?.message || 'ไม่สามารถสร้างกิจกรรมได้');
  }
};

/**
 * อัปเดต Event
 * @param {number} eventId
 * @param {Object} eventData
 * @returns {Promise<Object>}
 */
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await axios.put(`${API_URL}/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
    throw new Error(error.response?.data?.message || 'ไม่สามารถอัปเดตกิจกรรมได้');
  }
};

/**
 * ลบ Event
 * @param {number} eventId
 * @returns {Promise<void>}
 */
export const deleteEvent = async (eventId) => {
  try {
    await axios.delete(`${API_URL}/events/${eventId}`);
  } catch (error) {
    console.error(`Error deleting event ${eventId}:`, error);
    throw new Error(error.response?.data?.message || 'ไม่สามารถลบกิจกรรมได้');
  }
};
