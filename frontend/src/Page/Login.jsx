// src/Page/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import Illustration from "../assets/video/login-illustration3.mp4";
import Logo from "../assets/img/TULogo-02.png";

function useOptionalNavigate() {
  try {
    return useNavigate();
  } catch (_) {
    return null;
  }
}

export default function Login({ navigate: navigateProp, auth }) {
  const routerNavigate = useOptionalNavigate();
  const navigate = navigateProp ?? routerNavigate ?? ((path) => { window.location.href = path; });

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
      const data = await login(identifier, password);
      
      // ดึงข้อมูลจาก Backend Response
      const userId = data?.userId;  // เพิ่ม userId
      const token = data?.token;
      const profile = {
        id: userId,  // เก็บ userId ไว้ใน profile
        username: data?.username,
        displaynameTh: data?.displayname_th || data?.displaynameTh,
        email: data?.email,
      };

      // บันทึก auth state พร้อม userId
      auth?.login?.({ token, profile, remember, userId });

      setClosing(true);
      setTimeout(() => navigate("/"), 600);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message;
      setError(msg || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      <div
        className={[
          "hidden md:block",
          closing ? "w-full" : "w-2/5",
          "transition-all duration-700 ease-in-out",
        ].join(" ")}
        onTransitionEnd={() => {
          if (closing) navigate("/");
        }}
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
            <div>
              <label className="block mb-3 text-lg font-semibold text-gray-700">
                ชื่อผู้ใช้หรืออีเมล
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="กรอกชื่อผู้ใช้หรืออีเมล"
                className="w-full rounded-lg border border-gray-300 px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </div>

            <div>
              <label className="block mb-3 text-lg font-semibold text-gray-700">
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="กรอกรหัสผ่าน"
                className="w-full rounded-lg border border-gray-300 px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </div>

            <div className="flex items-center mt-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={() => setRemember((value) => !value)}
                className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
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

            {error && (
              <p className="text-base text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex gap-6 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIdentifier("");
                  setPassword("");
                  setError("");
                }}
                className="flex-1 h-14 rounded-lg bg-gray-200 text-gray-800 font-bold text-lg hover:bg-gray-300 transition-colors"
              >
                ล้างข้อมูล
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-14 rounded-lg bg-red-600 text-white font-bold text-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
