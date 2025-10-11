// src/Page/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import Illustration from '../assets/video/login-illustration3.mp4';
import Logo from '../assets/img/TULogo-02.png';

export default function Login() {
  const nav = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // state สำหรับแอนิเมชัน
  const [closing, setClosing] = useState(false); // true = ซ้ายกำลังยืดปิดฟอร์ม

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(identifier, password);
      if (remember && data?.token) localStorage.setItem('authToken', data.token);

      // เริ่มแอนิเมชันยืดภาพซ้าย
      setClosing(true);
      // ถ้า onTransitionEnd ไม่ยิง (บางกรณีพิเศษ) ให้มี fallback
      setTimeout(() => nav('/dashboard'), 900);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message;
      setError(msg || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* ซ้าย: วิดีโอพื้นหลัง (ยืดเต็มจอตอนปิด) */}
      <div
        className={[
          'hidden md:block',
          closing ? 'w-full' : 'w-2/5',
          'transition-all duration-700 ease-in-out',
        ].join(' ')}
        onTransitionEnd={() => {
          if (closing) nav('/dashboard');
        }}
      >
        <div className="relative h-full w-full">
          <video
            src={Illustration}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover object-center mb-100"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      </div>

      {/* ขวา: ฟอร์ม (ค่อยๆ จางหายตอนกำลังปิด) */}
      <div
        className={[
          'flex-1 flex items-center justify-center px-10',
          'transition-opacity duration-3000',
          closing ? 'opacity-0 pointer-events-none' : 'opacity-100',
        ].join(' ')}
      >
        <div className="w-full max-w-lg flex flex-col items-center justify-center">
          <img src={Logo} alt="TU Logo" className="w-3/5 mb-30 -mt-20" />

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 text-center tracking-tight">
            เข้าสู่ระบบ
          </h1>

          <form onSubmit={handleSubmit} className="w-full space-y-7">
            <div>
              <label className="block mb-3 text-lg font-semibold text-gray-700">
                รหัสนักศึกษา / อีเมลโดม
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="รหัสนักศึกษา / อีเมลโดม"
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่าน"
                className="w-full rounded-lg border border-gray-300 px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </div>

            <div className="flex items-center mt-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(v => !v)}
                className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="remember" className="ml-3 text-base text-gray-700">
                จดจำฉัน
              </label>
            </div>

            {error && (
              <p className="text-base text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex gap-6 pt-4">
              <button
                type="button"
                onClick={() => { setIdentifier(''); setPassword(''); setError(''); }}
                className="flex-1 h-14 rounded-lg bg-gray-200 text-gray-800 font-bold text-lg hover:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-14 rounded-lg bg-red-600 text-white font-bold text-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {loading ? 'กำลังเข้าสู่ระบบ…' : 'ตกลง'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}