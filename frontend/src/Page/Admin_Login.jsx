import { useEffect, useState } from "react";
import { adminLogin } from "../services/adminAuthService";
import { isAdmin } from "../lib/authz";
import Logo from "../assets/img/TULogo-02.png";

export default function AdminLogin({ navigate, auth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (auth?.loggedIn && isAdmin(auth)) {
      navigate("/staff");
    }
  }, [auth, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await adminLogin(email, password, remember);
      if (!data?.token) {
        setError(data?.message || "ไม่ได้รับคำตอบที่ถูกต้องจากระบบ");
        return;
      }
      const profile = {
        id: data.adminId ?? data.userId ?? null,
        email: (data.email || email).toLowerCase(),
        fullName:
          data.fullName ??
          data.displaynameTh ??
          data.name ??
          data.email ??
          email,
        displaynameTh: data.displaynameTh ?? data.fullName ?? "",
        roles:
          Array.isArray(data.roles) && data.roles.length > 0
            ? data.roles
            : ["admin"],
        position: data.position ?? "Administrator",
      };

      auth?.login?.({
        token: data.token,
        profile,
        remember,
        userId: profile.id,
      });

      navigate("/staff");
    } catch (err) {
      setError(err?.message || "เข้าสู่ระบบผู้ดูแลระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl bg-white px-8 py-10 shadow-2xl">
        <div className="text-center space-y-4 mb-8">
          <img src={Logo} alt="Meet Meet" className="mx-auto h-16 w-auto" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
              Admin Panel
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              เข้าสู่ระบบผู้ดูแล
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              ใช้บัญชีอีเมลที่ลงทะเบียนในระบบเพื่อจัดการกิจกรรม
            </p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
              placeholder="admin@example.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
              placeholder="กรอกรหัสผ่าน"
              required
              disabled={loading}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              disabled={loading}
            />
            จดจำฉันไว้ในอุปกรณ์นี้
          </label>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-red-500 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 mt-6 space-y-1">
          <p>
            ต้องการกลับไปยังระบบผู้ใช้ทั่วไป?{" "}
            <button
              type="button"
              className="font-semibold text-red-500 hover:text-red-600"
              onClick={() => navigate("/login")}
              disabled={loading}
            >
              ไปที่หน้า Login ผู้ใช้
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
