import axiosInstance from '../lib/axiosInstance';

/**
 * สร้าง Feedback สำหรับ Event
 * @param {number} eventId - ID ของกิจกรรม
 * @param {Object} feedbackData - { rating: number, comment: string }
 * @returns {Promise<Object>}
 */
export const createFeedback = async (eventId, feedbackData) => {
  try {
    const username = localStorage.getItem('userId'); // หรือ username จาก auth
    
    const response = await axiosInstance.post(
      `/events/${eventId}/feedbacks`,
      feedbackData,
      {
        headers: {
          'X-Username': username
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw new Error(error.response?.data?.error || error.message || 'ไม่สามารถส่ง feedback ได้');
  }
};

/**
 * แก้ไข Feedback
 * @param {number} eventId - ID ของกิจกรรม
 * @param {Object} feedbackData - { rating: number, comment: string }
 * @returns {Promise<Object>}
 */
export const updateFeedback = async (eventId, feedbackData) => {
  try {
    const username = localStorage.getItem('userId');
    
    const response = await axiosInstance.put(
      `/events/${eventId}/feedbacks`,
      feedbackData,
      {
        headers: {
          'X-Username': username
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw new Error(error.response?.data?.error || error.message || 'ไม่สามารถแก้ไข feedback ได้');
  }
};

/**
 * ลบ Feedback
 * @param {number} eventId - ID ของกิจกรรม
 * @returns {Promise<Object>}
 */
export const deleteFeedback = async (eventId) => {
  try {
    const username = localStorage.getItem('userId');
    
    const response = await axiosInstance.delete(`/events/${eventId}/feedbacks`, {
      headers: {
        'X-Username': username
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw new Error(error.response?.data?.error || error.message || 'ไม่สามารถลบ feedback ได้');
  }
};

/**
 * ดึง Feedback ทั้งหมดของ Event
 * @param {number} eventId - ID ของกิจกรรม
 * @returns {Promise<Array>}
 */
export const getAllFeedbacks = async (eventId) => {
  try {
    const response = await axiosInstance.get(`/events/${eventId}/feedbacks`);
    return response.data.feedbacks || [];
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    throw new Error(error.message || 'ไม่สามารถโหลด feedback ได้');
  }
};

/**
 * ดึง Feedback ของตัวเอง
 * @param {number} eventId - ID ของกิจกรรม
 * @returns {Promise<Object|null>}
 */
export const getMyFeedback = async (eventId) => {
  try {
    const username = localStorage.getItem('userId');
    
    const response = await axiosInstance.get(`/events/${eventId}/feedbacks/my`, {
      headers: {
        'X-Username': username
      }
    });
    
    return response.data.feedback;
  } catch (error) {
    console.error('Error fetching my feedback:', error);
    return null;
  }
};

/**
 * ดึงสถิติ Feedback ของ Event
 * @param {number} eventId - ID ของกิจกรรม
 * @returns {Promise<Object>}
 */
export const getFeedbackStatistics = async (eventId) => {
  try {
    const response = await axiosInstance.get(`/events/${eventId}/feedbacks/statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback statistics:', error);
    throw new Error(error.message || 'ไม่สามารถโหลดสถิติ feedback ได้');
  }
};

/**
 * ตรวจสอบว่า User ให้ feedback แล้วหรือยัง
 * @param {number} eventId - ID ของกิจกรรม
 * @returns {Promise<boolean>}
 */
export const hasUserGivenFeedback = async (eventId) => {
  try {
    const myFeedback = await getMyFeedback(eventId);
    return myFeedback !== null;
  } catch (error) {
    console.error('Error checking feedback status:', error);
    return false;
  }
};

/**
 * Submit หรือ Update Feedback (ตรวจสอบอัตโนมัติ)
 * @param {number} eventId - ID ของกิจกรรม
 * @param {Object} feedbackData - { rating: number, comment: string }
 * @returns {Promise<Object>}
 */
export const submitFeedback = async (eventId, feedbackData) => {
  try {
    const hasFeedback = await hasUserGivenFeedback(eventId);
    
    if (hasFeedback) {
      // ถ้ามี feedback อยู่แล้ว ให้ update
      return await updateFeedback(eventId, feedbackData);
    } else {
      // ถ้ายังไม่มี feedback ให้ create ใหม่
      return await createFeedback(eventId, feedbackData);
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw new Error(error.message || 'ไม่สามารถส่ง feedback ได้');
  }
};

/**
 * คำนวณคะแนนเฉลี่ย
 * @param {Array} feedbacks - Array ของ feedbacks
 * @returns {number}
 */
export const calculateAverageRating = (feedbacks) => {
  if (!feedbacks || feedbacks.length === 0) return 0;
  
  const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
  return (totalRating / feedbacks.length).toFixed(1);
};

/**
 * นับจำนวน Feedback แต่ละระดับดาว
 * @param {Array} feedbacks - Array ของ feedbacks
 * @returns {Object} { 5: count, 4: count, 3: count, 2: count, 1: count }
 */
export const getRatingDistribution = (feedbacks) => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  if (!feedbacks || feedbacks.length === 0) return distribution;
  
  feedbacks.forEach(feedback => {
    if (feedback.rating >= 1 && feedback.rating <= 5) {
      distribution[feedback.rating]++;
    }
  });
  
  return distribution;
};

/**
 * เรียงลำดับ Feedback
 * @param {Array} feedbacks - Array ของ feedbacks
 * @param {string} sortBy - 'newest', 'oldest', 'highest', 'lowest'
 * @returns {Array}
 */
export const sortFeedbacks = (feedbacks, sortBy = 'newest') => {
  if (!feedbacks || feedbacks.length === 0) return [];
  
  const sorted = [...feedbacks];
  
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'highest':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'lowest':
      return sorted.sort((a, b) => a.rating - b.rating);
    default:
      return sorted;
  }
};

/**
 * กรอง Feedback ตามคะแนน
 * @param {Array} feedbacks - Array ของ feedbacks
 * @param {number} rating - คะแนนที่ต้องการกรอง (1-5)
 * @returns {Array}
 */
export const filterFeedbacksByRating = (feedbacks, rating) => {
  if (!feedbacks || feedbacks.length === 0) return [];
  return feedbacks.filter(feedback => feedback.rating === rating);
};
