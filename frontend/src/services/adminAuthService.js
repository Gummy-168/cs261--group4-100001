import axiosInstance from "../lib/axiosInstance";

const ADMIN_LOGIN_ENDPOINT =
  import.meta.env.VITE_ADMIN_LOGIN_ENDPOINT || "/admin/login";

/**
 * Login สำหรับผู้ดูแลระบบ (Admin)
 * @param {string} email
 * @param {string} password
 * @param {boolean} remember
 */
export async function adminLogin(email, password, remember = true) {
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new Error("กรุณากรอกอีเมลและรหัสผ่านผู้ดูแลระบบ");
  }

  try {
    const response = await axiosInstance.post(ADMIN_LOGIN_ENDPOINT, {
      email: normalizedEmail,
      password,
    });
    const data = response.data ?? {};

    if (data.token) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("authToken", data.token);
      const adminId = data.adminId ?? data.userId;
      if (adminId) {
        localStorage.setItem("userId", adminId.toString());
      }
    }

    if (data.email || normalizedEmail) {
      localStorage.setItem("adminEmail", (data.email || normalizedEmail).toLowerCase());
    }

    return data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || "เข้าสู่ระบบผู้ดูแลระบบไม่สำเร็จ");
    }
    if (error.request) {
      throw new Error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
    throw new Error(error.message);
  }
}

export default adminLogin;

