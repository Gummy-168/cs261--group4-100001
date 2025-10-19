import { useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute Component
 * ใช้สำหรับป้องกัน routes ที่ต้อง login
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Components ที่ต้องการป้องกัน
 * @param {Object} props.auth - Auth object จาก main.jsx
 * @param {Function} props.navigate - Navigation function
 * @param {Function} props.requireLogin - Function เปิด login modal (optional)
 */
export default function ProtectedRoute({ children, auth, navigate, requireLogin }) {
  const isLoggedIn = auth?.loggedIn || false;

  useEffect(() => {
    if (!isLoggedIn) {
      console.warn('⚠️ Protected route accessed without login');
      
      // ถ้ามี requireLogin function ให้เปิด modal
      if (requireLogin) {
        requireLogin();
      } else {
        // ไม่มี modal ให้ redirect ไป login page
        navigate('/login');
      }
    }
  }, [isLoggedIn, navigate, requireLogin]);

  // ถ้ายังไม่ได้ login แสดง loading
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="large" message="กำลังตรวจสอบสิทธิ์..." />
          <p className="mt-4 text-gray-600">
            กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้
          </p>
        </div>
      </div>
    );
  }

  // ถ้า login แล้ว แสดง content
  return <>{children}</>;
}
