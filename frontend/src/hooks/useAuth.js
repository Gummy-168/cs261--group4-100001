import { useCallback } from 'react';
import { logout as logoutService, validateToken } from '../services/authService';

/**
 * Custom Hook สำหรับจัดการ Authentication
 * ใช้ร่วมกับ auth object จาก main.jsx
 */
export function useAuth(auth) {
  
  /**
   * Check if user is logged in
   */
  const isLoggedIn = useCallback(() => {
    return auth?.loggedIn || false;
  }, [auth]);

  /**
   * Get current user
   */
  const getUser = useCallback(() => {
    return auth?.profile || null;
  }, [auth]);

  /**
   * Get user ID
   */
  const getUserId = useCallback(() => {
    return auth?.userId || auth?.profile?.id || null;
  }, [auth]);

  /**
   * Get auth token
   */
  const getToken = useCallback(() => {
    return auth?.token || null;
  }, [auth]);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    logoutService(); // Clear localStorage/sessionStorage
    if (auth?.logout) {
      auth.logout();
    }
  }, [auth]);

  /**
   * Validate current token
   */
  const validateCurrentToken = useCallback(async () => {
    try {
      const result = await validateToken();
      return result.valid;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }, []);

  /**
   * Require login - redirect to login if not logged in
   */
  const requireLogin = useCallback((navigate) => {
    if (!isLoggedIn()) {
      console.warn('⚠️ User not logged in, redirecting to login');
      navigate('/login');
      return false;
    }
    return true;
  }, [isLoggedIn]);

  return {
    isLoggedIn,
    getUser,
    getUserId,
    getToken,
    logout,
    validateCurrentToken,
    requireLogin,
    // Pass through original auth object
    auth,
  };
}

export default useAuth;
