import axiosInstance from '../lib/axiosInstance';

/**
 * ดึงข้อมูล Events ทั้งหมดในรูปแบบ Card
 * @returns {Promise<Array>} รายการ Events
 */
export const getAllEventCards = async () => {
  try {
    const response = await axiosInstance.get('/events/cards');
    return response.data;
  } catch (error) {
    console.error('Error fetching event cards:', error);
    throw new Error(error.message || 'ไม่สามารถโหลดข้อมูลกิจกรรมได้');
  }
};

/**
 * ดึงข้อมูล Events ทั้งหมดในรูปแบบ Card (สำหรับ Admin/Staff)
 * @returns {Promise<Array>} รายการ Events ทั้งหมด รวม Draft
 */
export const getAllEventCardsForAdmin = async () => {
  try {
    const adminEmail = localStorage.getItem('adminEmail');
    
    if (!adminEmail) {
      throw new Error('ไม่พบข้อมูล Admin กรุณา Login ใหม่');
    }
    
    const response = await axiosInstance.get('/events/cards/admin', {
      headers: {
        'X-Admin-Email': adminEmail
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching event cards for admin:', error);
    throw new Error(error.message || 'ไม่สามารถโหลดข้อมูลกิจกรรมได้');
  }
};

/**
 * ดึงข้อมูล Events พร้อมสถานะ Favorite สำหรับ User
 * @param {number} userId - ID ของผู้ใช้
 * @returns {Promise<Array>} รายการ Events พร้อม isFavorited
 */
export const getEventCardsForUser = async (userId) => {
  try {
    const response = await axiosInstance.get(`/events/cards/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event cards for user:', error);
    throw new Error(error.message || 'ไม่สามารถโหลดข้อมูลกิจกรรมได้');
  }
};

/**
 * ดึงข้อมูล Event ทั้งหมด (รูปแบบปกติ)
 * @returns {Promise<Array>}
 */
export const getAllEvents = async () => {
  try {
    const response = await axiosInstance.get('/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error(error.message || 'ไม่สามารถโหลดข้อมูลกิจกรรมได้');
  }
};

/**
 * ดึงข้อมูล Event เดียวตาม ID
 * @param {number} eventId - ID ของกิจกรรม
 * @returns {Promise<Object>}
 */
export const getEventById = async (eventId) => {
  try {
    const response = await axiosInstance.get(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    throw new Error(error.message || 'ไม่พบกิจกรรมที่ต้องการ');
  }
};

/**
 * สร้าง Event ใหม่ (สำหรับ Admin)
 * @param {Object} eventData - ข้อมูลกิจกรรม
 * @returns {Promise<Object>}
 */
export const createEvent = async (eventData) => {
  try {
    const adminEmail = localStorage.getItem('adminEmail');
    
    if (!adminEmail) {
      throw new Error('ไม่พบข้อมูล Admin กรุณา Login ใหม่');
    }
    
    const response = await axiosInstance.post('/events', eventData, {
      headers: {
        'X-Admin-Email': adminEmail
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error(error.response?.data?.error || error.message || 'ไม่สามารถสร้างกิจกรรมได้');
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
    const adminEmail = localStorage.getItem('adminEmail');
    
    if (!adminEmail) {
      throw new Error('ไม่พบข้อมูล Admin กรุณา Login ใหม่');
    }
    
    const response = await axiosInstance.put(`/events/${eventId}`, eventData, {
      headers: {
        'X-Admin-Email': adminEmail
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
    throw new Error(error.response?.data?.error || error.message || 'ไม่สามารถอัปเดตกิจกรรมได้');
  }
};

/**
 * ลบ Event (Admin)
 * @param {number} eventId
 * @returns {Promise<void>}
 */
export const deleteEvent = async (eventId) => {
  try {
    const adminEmail = localStorage.getItem('adminEmail');
    
    await axiosInstance.delete(`/events/${eventId}`, {
      headers: {
        'X-Admin-Email': adminEmail
      }
    });
  } catch (error) {
    console.error(`Error deleting event ${eventId}:`, error);
    throw new Error(error.message || 'ไม่สามารถลบกิจกรรมได้');
  }
};

/**
 * ⭐️ ใหม่: ค้นหากิจกรรมตามเงื่อนไข (เรียก Backend /api/events/search)
 * @param {object} searchParams - อ็อบเจกต์ของ query parameters
 * เช่น { keyword: '...', category: '...', location: '...', startTime: '...', endTime: '...', sortBy: '...' }
 * @returns {Promise<Array>} รายการ Events ที่ตรงเงื่อนไข
 */
export const searchEvents = async (searchParams) => {
  try {
    // ส่ง { params: searchParams } เพื่อให้ axios สร้าง query string
    // เช่น /api/events/search?keyword=test&category=วิชาการ
    // (หมายเหตุ: Endpoint ใน Controller ของคุณคือ /api/events/search)
    const response = await axiosInstance.get('/events/search', { params: searchParams });
    return response.data;
  } catch (error) {
    console.error('Error searching events:', error);
    throw new Error(error.response?.data?.message || error.message || 'ไม่สามารถค้นหากิจกรรมได้');
  }
};
