import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";

// lib
import { usePath } from "./lib/router";
import { useAuthStore } from "./hooks/useAuth";
import { fetchHomeData, fetchHomeDataForStaff } from "./lib/api";
import { isStaff } from "./lib/authz"; // ✅ เพิ่ม import
import { applyThemePreference, readStoredThemePreference } from "./lib/theme";

// pages (public)
import Home from "./Page/Home";
import Login from "./Page/Login";
import NotificationsPage from "./Page/Notifications";
import ActivitiesPage from "./Page/Activities";
import MyActivitiesPage from "./Page/MyActivities";
import SettingsPage from "./Page/Settings";
import EventDetailPage from "./Page/EventDetail";
import AdminLogin from "./Page/Admin_Login";

// staff pages
import StaffHome from "./Page/Staff_Home";
import StaffMyActivitiesPage from "./Page/Staff_MyActivities";
import StaffEventDetailPage from "./Page/Staff_EventDetail";
import StaffEditEventPage from "./Page/Staff_EditEvent";
import StaffEventReaderPage from "./Page/Staff_EventReader";

// components
import LoginPromptModal from "./components/LoginPromptModal";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";

// staff guard
import StaffRequire from "./components/Staff_Require";

// theme
import ThemeProvider from "./ThemeProvider.jsx";

// (optional) mock login for local testing
function useMockLogin(auth) {
  useEffect(() => {
    if (!auth.loggedIn) {
      auth.login({
        token: "mock-token-123",
        userId: 999,
        remember: false,
        profile: { id: 999, username: "6709616848", displaynameTh: "นักพัฒนา ทดสอบ", email: "test@dome.tu.ac.th", roles: ["staff"] },
      });
    }
  }, [auth]);
}

// -------------------- App --------------------
function App() {
  const { path, navigate } = usePath();
  const auth = useAuthStore();
  const forceStaffHome = import.meta.env.VITE_FORCE_STAFF_HOME === "true";
  // useMockLogin(auth); // comment this line in production

  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [homeData, setHomeData] = useState(null);
  const [homeError, setHomeError] = useState(null);
  const [loading, setLoading] = useState(true);

  // theme from preferences
  useEffect(() => {
    const savedTheme = readStoredThemePreference();
    applyThemePreference(savedTheme);
  }, []);
  useEffect(() => {
    const t = auth.preferences?.theme || "light";
    applyThemePreference(t);
  }, [auth.preferences?.theme, path]);

  // data fetch
  useEffect(() => {
    let active = true;
    setHomeError(null);
    setLoading(true);
    const userId = auth.profile?.id || auth.userId;
    const token = auth.token;
    
    // เลือกใช้ function ที่เหมาะสมสำหรับ Staff หรือ User
    const fetchFunction = auth?.loggedIn && isStaff(auth) ? fetchHomeDataForStaff : fetchHomeData;
    
    fetchFunction(token, userId)
      .then((data) => { if (active) setHomeData(data); })
      .catch((error) => { if (active) setHomeError(error.message ?? "ไม่สามารถโหลดข้อมูลได้"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [auth.token, auth.profile, auth.userId, auth.loggedIn, path]);

  // ✅ บังคับให้ผู้ใช้ที่เป็น staff อยู่ใน /staff เสมอ (กันไปฝั่ง user)
  useEffect(() => {
    if (!forceStaffHome) return;
    if (auth?.loggedIn && isStaff(auth) && !path.startsWith("/staff")) {
      navigate("/staff");
    }
  }, [auth?.loggedIn, auth?.profile, auth?.token, path, navigate, forceStaffHome]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <LoadingSpinner size="large" message="กำลังโหลดข้อมูล..." />
      </div>
    );
  }

  const requirePublicLogin = () => setLoginPromptOpen(true);
  const requireAdminLogin = () => {
    if (!path.startsWith("/admin/login")) {
      navigate("/admin/login");
    }
  };
  const closePrompt = () => setLoginPromptOpen(false);
  const goToLogin = () => { setLoginPromptOpen(false); navigate("/login"); };

  // helpers for routing
  const guard = (el) => (
    <StaffRequire auth={auth} requireLogin={requireAdminLogin} navigate={navigate}>
      {el}
    </StaffRequire>
  );
  const extractId = (prefix, suffix = "") => decodeURIComponent(path.slice(prefix.length).replace(suffix, "").split("?")[0] || "");

  // -------------------- route switch --------------------
  const renderStaffRoutes = () => {
    if (path.startsWith("/staff/events/") && path.endsWith("/reader")) {
      const eventId = extractId("/staff/events/", "/reader");
      return guard(<StaffEventReaderPage navigate={navigate} auth={auth} data={homeData} eventId={eventId} requireLogin={requireAdminLogin} />);
    }
    if (path.startsWith("/staff/events/") && path.endsWith("/edit")) {
      const eventId = extractId("/staff/events/", "/edit");
      return guard(<StaffEditEventPage navigate={navigate} auth={auth} data={homeData} eventId={eventId} requireLogin={requireAdminLogin} />);
    }
    if (path.startsWith("/staff/events/")) {
      const eventId = extractId("/staff/events/");
      return guard(<StaffEventDetailPage navigate={navigate} auth={auth} data={homeData} eventId={eventId} requireLogin={requireAdminLogin} />);
    }
    if (path.startsWith("/staff/myActivities")) {
      return guard(<StaffMyActivitiesPage navigate={navigate} auth={auth} data={homeData} requireLogin={requireAdminLogin} />);
    }
    if (path.startsWith("/staff")) {
      return guard(<StaffHome navigate={navigate} auth={auth} data={homeData} requireLogin={requireAdminLogin} />);
    }
    return null;
  };

  const renderPublicRoutes = () => {
    if (path.startsWith("/admin/login")) {
      return <AdminLogin navigate={navigate} auth={auth} />;
    }
    if (path.startsWith("/notifications")) {
      return <NotificationsPage navigate={navigate} auth={auth} notifications={homeData?.notifications || []} requireLogin={requirePublicLogin} />;
    }
    if (path.startsWith("/my-activities")) {
      return <MyActivitiesPage navigate={navigate} auth={auth} data={homeData} requireLogin={requirePublicLogin} />;
    }
    if (path.startsWith("/activities")) {
      return <ActivitiesPage navigate={navigate} auth={auth} data={homeData} requireLogin={requirePublicLogin} />;
    }
    if (path.startsWith("/events/")) {
      const eventId = extractId("/events/");
      return <EventDetailPage navigate={navigate} auth={auth} data={homeData} eventId={eventId} requireLogin={requirePublicLogin} />;
    }
    if (path.startsWith("/settings")) {
      return <SettingsPage navigate={navigate} auth={auth} />;
    }
    if (path.startsWith("/login")) {
      return <Login navigate={navigate} auth={auth} data={homeData} />;
    }
    return <Home navigate={navigate} auth={auth} data={homeData} requireLogin={requirePublicLogin} />;
  };

  const page = renderStaffRoutes() ?? renderPublicRoutes();

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} gutter={8} toastOptions={{
        duration: 3000,
        style: { background: "#fff", color: "#363636", padding: "16px", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)" },
        success: { duration: 3000, iconTheme: { primary: "#10b981", secondary: "#fff" } },
        error: { duration: 4000, iconTheme: { primary: "#ef4444", secondary: "#fff" } },
      }} />

      {homeError && (
        <div className="bg-red-50 py-2 text-center text-sm text-red-600 border-b border-red-2 00">⚠️ {homeError}</div>
      )}

      <div key={path} className="route-fade">{page}</div>

      <LoginPromptModal open={loginPromptOpen} onClose={closePrompt} onConfirm={goToLogin} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
