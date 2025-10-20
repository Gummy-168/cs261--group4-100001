// ไฟล์ Debug สำหรับตรวจสอบ Auth State
// วางโค้ดนี้ใน browser console เพื่อดูข้อมูล auth

console.log("=== DEBUG AUTH STATE ===");
console.log("localStorage:", {
  token: localStorage.getItem("token"),
  userId: localStorage.getItem("userId"),
  profile: localStorage.getItem("profile")
});

// ตรวจสอบ auth context/state ที่ใช้อยู่
console.log("Check your auth state in React DevTools");
console.log("========================");
