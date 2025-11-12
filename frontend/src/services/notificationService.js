import axiosInstance from '../lib/axiosInstance';

/**
 * ดึงการแจ้งเตือนทั้งหมดของ User
 * @returns {Promise<Array>}
 */
export const getUserNotifications = async () => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User not logged in');
    }

    const response = await axiosInstance.get(`/notifications/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new Error(error.message || 'ไม่สามารถโหลดการแจ้งเตือนได้');
  }
};

/**
 * ดึงการแจ้งเตือนที่ยังไม่ได้อ่าน
 * @returns {Promise<Array>}
 */
export const getUnreadNotifications = async () => {
  try {
    const notifications = await getUserNotifications();
    return notifications.filter(notification => !notification.isRead);
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    throw new Error(error.message || 'ไม่สามารถโหลดการแจ้งเตือนได้');
  }
};

/**
 * นับจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
 * @returns {Promise<number>}
 */
export const getUnreadCount = async () => {
  try {
    const unreadNotifications = await getUnreadNotifications();
    return unreadNotifications.length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

/**
 * ทำเครื่องหมายว่าอ่านแล้ว
 * @param {number} notificationId - ID ของการแจ้งเตือน
 * @returns {Promise<Object>}
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error(error.message || 'ไม่สามารถอัปเดตสถานะได้');
  }
};

/**
 * ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
 * @returns {Promise<Array>}
 */
export const markAllAsRead = async () => {
  try {
    const notifications = await getUserNotifications();
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    const markPromises = unreadNotifications.map(notification => 
      markAsRead(notification.id)
    );
    
    await Promise.all(markPromises);
    return unreadNotifications;
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw new Error(error.message || 'ไม่สามารถอัปเดตสถานะได้');
  }
};

/**
 * ลบการแจ้งเตือน
 * @param {number} notificationId - ID ของการแจ้งเตือน
 * @returns {Promise<void>}
 */
export const deleteNotification = async (notificationId) => {
  try {
    await axiosInstance.delete(`/notifications/${notificationId}`);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw new Error(error.message || 'ไม่สามารถลบการแจ้งเตือนได้');
  }
};

/**
 * ลบการแจ้งเตือนทั้งหมด
 * @returns {Promise<void>}
 */
export const deleteAllNotifications = async () => {
  try {
    const notifications = await getUserNotifications();
    const deletePromises = notifications.map(notification => 
      deleteNotification(notification.id)
    );
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw new Error(error.message || 'ไม่สามารถลบการแจ้งเตือนได้');
  }
};

/**
 * ดึงการแจ้งเตือนล่าสุด (จำกัดจำนวน)
 * @param {number} limit - จำนวนที่ต้องการ
 * @returns {Promise<Array>}
 */
export const getRecentNotifications = async (limit = 10) => {
  try {
    const notifications = await getUserNotifications();
    return notifications.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent notifications:', error);
    throw new Error(error.message || 'ไม่สามารถโหลดการแจ้งเตือนได้');
  }
};

/**
 * กรองการแจ้งเตือนตามประเภท
 * @param {string} type - ประเภทการแจ้งเตือน (event, favorite, registration, etc.)
 * @returns {Promise<Array>}
 */
export const getNotificationsByType = async (type) => {
  try {
    const notifications = await getUserNotifications();
    return notifications.filter(notification => 
      notification.type?.toLowerCase() === type.toLowerCase()
    );
  } catch (error) {
    console.error('Error filtering notifications:', error);
    throw new Error(error.message || 'ไม่สามารถกรองการแจ้งเตือนได้');
  }
};

/**
 * Subscribe to notification updates (สำหรับ real-time updates ในอนาคต)
 * @param {Function} callback - Callback function เมื่อมี notification ใหม่
 */
export const subscribeToNotifications = (callback) => {
  // TODO: Implement WebSocket or Server-Sent Events
  // For now, use polling
  const intervalId = setInterval(async () => {
    try {
      const notifications = await getUserNotifications();
      callback(notifications);
    } catch (error) {
      console.error('Error polling notifications:', error);
    }
  }, 30000); // Poll every 30 seconds

  // Return cleanup function
  return () => clearInterval(intervalId);
};
