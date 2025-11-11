import React, { useMemo, useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";

// lib
import { usePath } from "./lib/router";
import { fetchHomeData } from "./lib/api";
import { isStaff } from "./lib/authz"; // ✅ เพิ่ม import

// pages (public)
import Home from "./Page/Home";
import Login from "./Page/Login";
import NotificationsPage from "./Page/Notifications";
import ActivitiesPage from "./Page/Activities";
import MyActivitiesPage from "./Page/MyActivities";
import SettingsPage from "./Page/Settings";
import EventDetailPage from "./Page/EventDetail";

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

// -------------------- constants & utils --------------------
const DEFAULT_PREFERENCES = {
  theme: "light",
  notifications: { follow: true, near: true, recommend: true, announce: true },
  privacy: { showFavorites: true },
};

const readStoredJson = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const mergeObjects = (base, patch) => {
  if (!patch || typeof patch !== "object") return base;
  const next = Array.isArray(base) ? [...base] : { ...base };
  for (const [k, v] of Object.entries(patch)) {
    next[k] = v && typeof v === "object" && !Array.isArray(v)
      ? mergeObjects(next[k] ?? {}, v)
      : v;
  }
  return next;
};

// -------------------- auth store (local) --------------------
function useAuthStore() {
  const [state, setState] = useState(() => {
    const storedToken = typeof window !== "undefined"
      ? localStorage.getItem("authToken") ?? sessionStorage.getItem("authToken")
      : null;
    const storedUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    const storedProfile = readStoredJson("profileDraft", null);
    const storedPreferences = mergeObjects(
      DEFAULT_PREFERENCES,
      readStoredJson("userPreferences", DEFAULT_PREFERENCES)
    );
    return {
      loggedIn: Boolean(storedToken),
      token: storedToken,
      profile: storedProfile,
      userId: storedUserId ? parseInt(storedUserId) : null,
      preferences: storedPreferences,
    };
  });

  const persistProfile = useCallback((profile) => {
    if (typeof window === "undefined") return;
    if (!profile) return localStorage.removeItem("profileDraft");
    try { localStorage.setItem("profileDraft", JSON.stringify(profile)); } catch {}
  }, []);

  const persistPreferences = useCallback((prefs) => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem("userPreferences", JSON.stringify(prefs)); } catch {}
  }, []);

  const login = useCallback(({ token, profile, remember = true, userId } = {}) => {
    setState((prev) => {
      const nextProfile = profile ?? prev.profile;
      if (nextProfile) { try { localStorage.setItem("profileDraft", JSON.stringify(nextProfile)); } catch {} }
      return { ...prev, loggedIn: true, token: token ?? prev.token, profile: nextProfile, userId: userId ?? prev.userId };
    });
    if (token) {
      if (remember) { localStorage.setItem("authToken", token); sessionStorage.removeItem("authToken"); }
      else { sessionStorage.setItem("authToken", token); localStorage.removeItem("authToken"); }
    }
    if (userId) { localStorage.setItem("userId", userId.toString()); }
  }, []);

  const updateProfile = useCallback((updater) => {
    setState((prev) => {
      const base = prev.profile ?? {};
      const next = typeof updater === "function" ? updater(base) : { ...base, ...updater };
      persistProfile(next);
      return { ...prev, profile: next };
    });
  }, [persistProfile]);

  const updatePreferences = useCallback((updater) => {
    setState((prev) => {
      const base = mergeObjects(DEFAULT_PREFERENCES, prev.preferences ?? {});
      const next = typeof updater === "function" ? updater(base) : mergeObjects(base, updater);
      persistPreferences(next);
      return { ...prev, preferences: next };
    });
  }, [persistPreferences]);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    persistProfile(null);
    persistPreferences({ ...DEFAULT_PREFERENCES });
    setState({ loggedIn: false, token: null, profile: null, userId: null, preferences: { ...DEFAULT_PREFERENCES } });
  }, [persistProfile, persistPreferences]);

  return useMemo(() => ({ ...state, login, logout, updateProfile, updatePreferences }), [state, login, logout, updateProfile, updatePreferences]);
}

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
  useMockLogin(auth); // comment this line in production

  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [homeData, setHomeData] = useState(null);
  const [homeError, setHomeError] = useState(null);
  const [loading, setLoading] = useState(true);

  // theme from preferences
  useEffect(() => {
    const saved = localStorage.getItem("userPreferences");
    if (saved) {
      try { const p = JSON.parse(saved); if (p.theme) document.documentElement.dataset.themePreference = p.theme; } catch {}
    }
  }, []);
  useEffect(() => {
    const t = auth.preferences?.theme ?? "system";
    document.documentElement.dataset.themePreference = t;
  }, [auth.preferences?.theme, path]);

  // data fetch
  useEffect(() => {
    let active = true;
    setHomeError(null);
    setLoading(true);
    const userId = auth.profile?.id || auth.userId;
    const token = auth.token;
    fetchHomeData(token, userId)
      .then((data) => { if (active) setHomeData(data); })
      .catch((error) => { if (active) setHomeError(error.message ?? "ไม่สามารถโหลดข้อมูลได้"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [auth.token, auth.profile, auth.userId, path]);

  // ✅ บังคับให้ผู้ใช้ที่เป็น staff อยู่ใน /staff เสมอ (กันไปฝั่ง user)
  useEffect(() => {
    if (auth?.loggedIn && isStaff(auth) && !path.startsWith("/staff")) {
      navigate("/staff");
    }
  }, [auth?.loggedIn, auth?.profile, auth?.token, path, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <LoadingSpinner size="large" message="กำลังโหลดข้อมูล..." />
      </div>
    );
  }

  const requireLogin = () => setLoginPromptOpen(true);
  const closePrompt = () => setLoginPromptOpen(false);
  const goToLogin = () => { setLoginPromptOpen(false); navigate("/login"); };

  // helpers for routing
  const guard = (el) => (
    <StaffRequire auth={auth} requireLogin={requireLogin} navigate={navigate}>
      {el}
    </StaffRequire>
  );
  const extractId = (prefix, suffix = "") => decodeURIComponent(path.slice(prefix.length).replace(suffix, "").split("?")[0] || "");

  // -------------------- route switch --------------------
  const renderStaffRoutes = () => {
    if (path.startsWith("/staff/events/") && path.endsWith("/reader")) {
      const eventId = extractId("/staff/events/", "/reader");
      return guard(<StaffEventReaderPage navigate={navigate} auth={auth} data={homeData} eventId={eventId} requireLogin={requireLogin} />);
    }
    if (path.startsWith("/staff/events/") && path.endsWith("/edit")) {
      const eventId = extractId("/staff/events/", "/edit");
      return guard(<StaffEditEventPage navigate={navigate} auth={auth} data={homeData} eventId={eventId} requireLogin={requireLogin} />);
    }
    if (path.startsWith("/staff/events/")) {
      const eventId = extractId("/staff/events/");
      return guard(<StaffEventDetailPage navigate={navigate} auth={auth} data={homeData} eventId={eventId} requireLogin={requireLogin} />);
    }
    if (path.startsWith("/staff/myActivities")) {
      return guard(<StaffMyActivitiesPage navigate={navigate} auth={auth} data={homeData} requireLogin={requireLogin} />);
    }
    if (path.startsWith("/staff")) {
      return guard(<StaffHome navigate={navigate} auth={auth} data={homeData} requireLogin={requireLogin} />);
    }
    return null;
  };

  const renderPublicRoutes = () => {
    if (path.startsWith("/notifications")) {
      return <NotificationsPage navigate={navigate} auth={auth} notifications={homeData?.notifications || []} requireLogin={requireLogin} />;
    }
    if (path.startsWith("/my-activities")) {
      return <MyActivitiesPage navigate={navigate} auth={auth} data={homeData} requireLogin={requireLogin} />;
    }
    if (path.startsWith("/activities")) {
      return <ActivitiesPage navigate={navigate} auth={auth} data={homeData} requireLogin={requireLogin} />;
    }
    if (path.startsWith("/events/")) {
      const eventId = extractId("/events/");
      return <EventDetailPage navigate={navigate} auth={auth} data={homeData} eventId={eventId} requireLogin={requireLogin} />;
    }
    if (path.startsWith("/settings")) {
      return <SettingsPage navigate={navigate} auth={auth} />;
    }
    if (path.startsWith("/login")) {
      return <Login navigate={navigate} auth={auth} data={homeData} />;
    }
    return <Home navigate={navigate} auth={auth} data={homeData} requireLogin={requireLogin} />;
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
