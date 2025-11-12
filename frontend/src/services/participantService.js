import axiosInstance from '../lib/axiosInstance';

/**
 * ลงทะเบียนเข้าร่วม Event
 * @param {number} eventId - ID ของกิจกรรม
 * @returns {Promise<Object>}
 */
export const registerForEvent = async (eventId) => {
  try {
    const response = await axiosInstance.post('/participants/register', {
      eventId: eventId
    });
    return response.data;
  } catch (error) {
    console.error('Error registering for event:', error);
    throw new Error(error.response?.data?.message || error.message || 'ไม่สามารถลงทะเบียนได้');
  }
};

/**
 * ยกเลิกการลงทะเบียน Event
 * @param {number} eventId - ID ของกิจกรรม
 * @returns {Promise<void>}
 */
export const cancelEventRegistration = async (eventId) => {
  try {
    await axiosInstance.delete(`/participants/cancel/${eventId}`);
  } catch (error) {
    console.error('Error canceling registration:', error);
    throw new Error(error.response?.data?.message || error.message || 'ไม่สามารถยกเลิกการลงทะเบียนได้');
  }
};

/**
 * ดึงรายการ Events ที่ User ลงทะเบียนแล้ว
 * @returns {Promise<Array>}
 */
export const getMyRegisteredEvents = async () => {
  try {
    const response = await axiosInstance.get('/participants/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching registered events:', error);
    throw new Error(error.message || 'ไม่สามารถโหลดรายการกิจกรรมที่ลงทะเบียนได้');
  }
};

/**
 * ตรวจสอบว่า User ลงทะเบียน Event นี้แล้วหรือยัง
 * @param {number} eventId - ID ของกิจกรรม
 * @returns {Promise<boolean>}
 */
export const checkIsRegistered = async (eventId) => {
  try {
    const response = await axiosInstance.get(`/participants/check/${eventId}`);
    return response.data.isRegistered || false;
  } catch (error) {
    console.error('Error checking registration status:', error);
    return false;
  }
};

/**
 * Toggle Registration (ลงทะเบียนหรือยกเลิก)
 * @param {number} eventId
 * @param {boolean} isRegistered - สถานะปัจจุบัน
 * @returns {Promise<Object|void>}
 */
export const toggleRegistration = async (eventId, isRegistered) => {
  if (isRegistered) {
    // ถ้าลงทะเบียนอยู่แล้ว ให้ยกเลิก
    return await cancelEventRegistration(eventId);
  } else {
    // ถ้ายังไม่ได้ลงทะเบียน ให้ลงทะเบียน
    return await registerForEvent(eventId);
  }
};

// ========== ADMIN ONLY FUNCTIONS ==========

/**
 * ดึงรายชื่อผู้เข้าร่วมทั้งหมดของ Event (Admin only)
 * @param {number} eventId - ID ของกิจกรรม
 * @returns {Promise<Object>}
 */
export const getEventParticipants = async (eventId) => {
  try {
    const response = await axiosInstance.get(`/admin/events/${eventId}/participants`, {
      headers: {
        'X-Admin-Email': localStorage.getItem('adminEmail')
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching participants:', error);
    throw new Error(error.response?.data?.error || 'ไม่สามารถโหลดรายชื่อผู้เข้าร่วมได้');
  }
};

/**
 * Upload รายชื่อผู้เข้าร่วมจากไฟล์ (Admin only)
 * @param {number} eventId - ID ของกิจกรรม
 * @param {File} file - ไฟล์ CSV หรือ Excel
 * @returns {Promise<Object>}
 */
export const uploadParticipantsList = async (eventId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(
      `/admin/events/${eventId}/participants/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Admin-Email': localStorage.getItem('adminEmail')
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading participants:', error);
    throw new Error(error.response?.data?.error || 'ไม่สามารถอัปโหลดรายชื่อได้');
  }
};

/**
 * เพิ่มผู้เข้าร่วมคนเดียว (Admin only)
 * @param {number} eventId - ID ของกิจกรรม
 * @param {Object} participantData - ข้อมูลผู้เข้าร่วม
 * @returns {Promise<Object>}
 */
export const addParticipant = async (eventId, participantData) => {
  try {
    const response = await axiosInstance.post(
      `/admin/events/${eventId}/participants`,
      participantData,
      {
        headers: {
          'X-Admin-Email': localStorage.getItem('adminEmail')
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding participant:', error);
    throw new Error(error.response?.data?.error || 'ไม่สามารถเพิ่มผู้เข้าร่วมได้');
  }
};

/**
 * แก้ไขข้อมูลผู้เข้าร่วม (Admin only)
 * @param {number} eventId - ID ของกิจกรรม
 * @param {number} participantId - ID ของผู้เข้าร่วม
 * @param {Object} participantData - ข้อมูลที่ต้องการแก้ไข
 * @returns {Promise<Object>}
 */
export const updateParticipant = async (eventId, participantId, participantData) => {
  try {
    const response = await axiosInstance.put(
      `/admin/events/${eventId}/participants/${participantId}`,
      participantData,
      {
        headers: {
          'X-Admin-Email': localStorage.getItem('adminEmail')
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating participant:', error);
    throw new Error(error.response?.data?.error || 'ไม่สามารถแก้ไขข้อมูลได้');
  }
};

/**
 * ลบผู้เข้าร่วม (Admin only)
 * @param {number} eventId - ID ของกิจกรรม
 * @param {number} participantId - ID ของผู้เข้าร่วม
 * @returns {Promise<Object>}
 */
export const deleteParticipant = async (eventId, participantId) => {
  try {
    const response = await axiosInstance.delete(
      `/admin/events/${eventId}/participants/${participantId}`,
      {
        headers: {
          'X-Admin-Email': localStorage.getItem('adminEmail')
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting participant:', error);
    throw new Error(error.response?.data?.error || 'ไม่สามารถลบผู้เข้าร่วมได้');
  }
};
