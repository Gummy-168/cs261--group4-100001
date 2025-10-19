// src/Page/Login.jsx
import { useState } from "react";
import { login } from "../services/authService";
import Illustration from "../assets/video/login-illustration3.mp4";
import Logo from "../assets/img/TULogo-02.png";

export default function Login({ navigate, auth }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // เรียกใช้ authService ที่อัปเดตแล้ว (รองรับ JWT)
      const data = await login(identifier, password, remember);
      
      if (data.status) {
        // ดึงข้อมูลจาก Backend Response
        const profile = {
          id: data.userId,
          username: data.username,
          fullName: data.displaynameTh || data.username, // ใช้ displaynameTh เป็น fullName
          displaynameTh: data.displaynameTh,
          displayName: data.displaynameTh, // เพิ่ม displayName
          nickname: data.displaynameTh || data.username, // ตั้งค่าเริ่มต้นจาก displaynameTh
          email: data.email,
          studentId: data.username, // ถ้า username เป็นรหัสนักศึกษา
          faculty: data.faculty || '', // ดึงจาก Backend
          department: data.department || '', // ดึงจาก Backend
          phone: '', // ยังไม่มีข้อมูล
        };

        // บันทึก auth state พร้อม token และ userId
        auth?.login?.({ 
          token: data.token,  // JWT Token
          profile, 
          remember, 
          userId: data.userId 
        });

        console.log('✅ Login successful!');
        console.log('Token:', data.token);
        console.log('User ID:', data.userId);

        // Navigate ไปหน้าหลัก
        setClosing(true);
        setTimeout(() => navigate("/"), 600);
      } else {
        setError(data.message || "เข้าสู่ระบบไม่สำเร็จ");
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      const msg = err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left Side - Video Illustration */}
      <div
        className={[
          "hidden md:block",
          closing ? "w-full" : "w-2/5",
          "transition-all duration-700 ease-in-out",
        ].join(" ")}
      >
        <div className="relative h-full w-full">
          <video
            src={Illustration}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div
        className={[
          "flex-1 flex items-center justify-center px-10",
          "transition-opacity duration-[600ms]",
          closing ? "opacity-0 pointer-events-none" : "opacity-100",
        ].join(" ")}
      >
        <div className="w-full max-w-lg flex flex-col items-center justify-center">
          <img src={Logo} alt="TU Logo" className="w-3/5 mb-12 -mt-10" />

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 text-center tracking-tight">
            เข้าสู่ระบบ
          </h1>

          <form onSubmit={handleSubmit} className="w-full space-y-7">
            {/* Username/Email Input */}
            <div>
              <label className="block mb-3 text-lg font-semibold text-gray-700">
                ชื่อผู้ใช้หรืออีเมล
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้หรืออีเมล"
                className="w-full rounded-lg border border-gray-300 px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block mb-3 text-lg font-semibold text-gray-700">
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                className="w-full rounded-lg border border-gray-300 px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={loading}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center mt-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                disabled={loading}
              />
              <label htmlFor="remember" className="ml-3 text-base text-gray-700">
                จดจำฉันไว้
              </label>
              <a
                href="https://accounts.tu.ac.th/Login.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-blue-600 hover:underline cursor-pointer"
              >
                ลืมรหัสผ่าน?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-base text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
                ⚠️ {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-6 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIdentifier("");
                  setPassword("");
                  setError("");
                }}
                disabled={loading}
                className="flex-1 h-14 rounded-lg bg-gray-200 text-gray-800 font-bold text-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                ล้างข้อมูล
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-14 rounded-lg bg-red-600 text-white font-bold text-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <p className="mt-6 text-sm text-gray-600 text-center">
            ใช้บัญชี TU Account ของคุณในการเข้าสู่ระบบ
          </p>
        </div>
      </div>
    </div>
  );
}
