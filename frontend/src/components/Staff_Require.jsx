// src/components/Staff_Require.jsx
import { useEffect, useState } from "react";
import { isStaff } from "../lib/authz";

export default function StaffRequire({ auth, requireLogin, navigate, children }) {
  const [allowed, setAllowed] = useState(null); // null = กำลังตรวจสอบ

  useEffect(() => {
    if (!auth?.loggedIn) {
      requireLogin?.();   // เปิด modal ให้ล็อกอิน
      setAllowed(false);
      return;
    }
    setAllowed(isStaff(auth));
  }, [auth, requireLogin]);

  if (allowed === null) {
    return (
      <div className="p-10 text-center text-sm text-gray-500">
        กำลังตรวจสอบสิทธิ์…
      </div>
    );
  }

  if (!allowed) {
    // ป้องกันคนที่ไม่ใช่ staff
    navigate?.("/"); // หรือจะโชว์ 403 แทนก็ได้
    return (
      <div className="p-10 text-center">
        <h2 className="text-lg font-semibold">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-sm text-gray-600 mt-2">
          หน้านี้สำหรับเจ้าหน้าที่ (Staff) เท่านั้น
        </p>
      </div>
    );
  }

  return children;
}
