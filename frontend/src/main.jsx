import React, { useMemo, useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { usePath } from "./lib/router";
import { fetchHomeData } from "./lib/api";
import Home from "./Page/Home";
import Login from "./Page/Login";
import NotificationsPage from "./Page/Notifications";
import ActivitiesPage from "./Page/Activities";
import MyActivitiesPage from "./Page/MyActivities";
import LoginPromptModal from "./components/LoginPromptModal";
import SettingsPage from "./Page/Settings";
import EventDetailPage from "./Page/EventDetail";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";

const DEFAULT_PREFERENCES = {
  theme: "light",
  notifications: {
    follow: true,
    near: true,
    soon: true,
    recommend: true,
    announce: true,
  },
  privacy: {
    showFavorites: true,
  },
};

const readStoredJson = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const mergeObjects = (base, patch) => {
  if (!patch || typeof patch !== "object") return base;
  const next = Array.isArray(base) ? [...base] : { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      next[key] = mergeObjects(next[key] ?? {}, value);
    } else {
      next[key] = value;
    }
  }
  return next;
};

function useAuthStore() {
  const [state, setState] = useState(() => {
    const storedToken =
      typeof window !== "undefined"
        ? localStorage.getItem("authToken") ?? sessionStorage.getItem("authToken")
        : null;
    const storedUserId =
      typeof window !== "undefined"
        ? localStorage.getItem("userId")
        : null;
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
    if (!profile) {
      localStorage.removeItem("profileDraft");
      return;
    }
    try {
      localStorage.setItem("profileDraft", JSON.stringify(profile));
    } catch {
      /* silent */
    }
  }, []);

  const persistPreferences = useCallback((prefs) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("userPreferences", JSON.stringify(prefs));
    } catch {
      /* silent */
    }
  }, []);

  const login = useCallback(({ token, profile, remember = true, userId } = {}) => {
    console.log('🔐 Auth Store - Login called:', { hasToken: !!token, userId, remember });
    
    setState((prev) => {
      const nextProfile = profile ?? prev.profile;
      if (nextProfile) {
        try {
          localStorage.setItem("profileDraft", JSON.stringify(nextProfile));
        } catch {
          /* silent */
        }
      }
      return {
        ...prev,
        loggedIn: true,
        token: token ?? prev.token,
        profile: nextProfile,
        userId: userId ?? prev.userId,
      };
    });
    
    // Store token
    if (token) {
      if (remember) {
        localStorage.setItem("authToken", token);
        sessionStorage.removeItem("authToken");
        console.log('✅ Token stored in localStorage');
      } else {
        sessionStorage.setItem("authToken", token);
        localStorage.removeItem("authToken");
        console.log('✅ Token stored in sessionStorage');
      }
    }
    
    // Store userId
    if (userId) {
      localStorage.setItem("userId", userId.toString());
      console.log('✅ UserId stored:', userId);
    }
  }, []);

  const updateProfile = useCallback(
    (updater) => {
      setState((prev) => {
        const base = prev.profile ?? {};
        const next =
          typeof updater === "function" ? updater(base) : { ...base, ...updater };
        persistProfile(next);
        return { ...prev, profile: next };
      });
    },
    [persistProfile]
  );

  const updatePreferences = useCallback(
    (updater) => {
      setState((prev) => {
        const base = mergeObjects(DEFAULT_PREFERENCES, prev.preferences ?? {});
        const next =
          typeof updater === "function" ? updater(base) : mergeObjects(base, updater);
        persistPreferences(next);
        return { ...prev, preferences: next };
      });
    },
    [persistPreferences]
  );

  const logout = useCallback(() => {
    console.log('👋 Auth Store - Logout called');
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    persistProfile(null);
    persistPreferences({ ...DEFAULT_PREFERENCES });
    setState({
      loggedIn: false,
      token: null,
      profile: null,
      userId: null,
      preferences: { ...DEFAULT_PREFERENCES },
    });
    console.log('✅ Logout complete');
  }, [persistProfile, persistPreferences]);

  return useMemo(
    () => ({
      ...state,
      login,
      logout,
      updateProfile,
      updatePreferences,
    }),
    [state, login, logout, updateProfile, updatePreferences]
  );
}

function App() {
  const { path, navigate } = usePath();
  const auth = useAuthStore();

  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [homeData, setHomeData] = useState(null);
  const [homeError, setHomeError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set theme
  useEffect(() => {
    if (typeof document !== "undefined") {
      const isLogin = path.startsWith("/login");
      const themePref = auth.preferences?.theme ?? "system";
      document.documentElement.dataset.themePreference = isLogin ? "light" : themePref;
    }
  }, [auth.preferences?.theme, path]);

  // Fetch home data
  useEffect(() => {
    let active = true;
    setHomeError(null);
    setLoading(true);

    const userId = auth.profile?.id || auth.userId;
    const token = auth.token;

    console.log('📦 Fetching home data:', { userId, hasToken: !!token });

    fetchHomeData(token, userId)
      .then((data) => {
        if (active) {
          setHomeData(data);
          console.log('✅ Home data loaded:', {
            events: data.events?.length || 0,
            favorites: data.favoriteEvents?.length || 0
          });
        }
      })
      .catch((error) => {
        if (active) {
          console.error('❌ Home data error:', error);
          setHomeError(error.message ?? "ไม่สามารถโหลดข้อมูลได้");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [auth.token, auth.profile, auth.userId, path]);

  // Show loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <LoadingSpinner size="large" message="กำลังโหลดข้อมูล..." />
      </div>
    );
  }

  const requireLogin = () => setLoginPromptOpen(true);
  const closePrompt = () => setLoginPromptOpen(false);
  const goToLogin = () => {
    setLoginPromptOpen(false);
    navigate("/login");
  };

  // Route handling
  let page = null;
  if (path.startsWith("/notifications")) {
    page = (
      <NotificationsPage
        navigate={navigate}
        auth={auth}
        notifications={homeData?.notifications || []}
        requireLogin={requireLogin}
      />
    );
  } else if (path.startsWith("/my-activities")) {
    page = (
      <MyActivitiesPage
        navigate={navigate}
        auth={auth}
        data={homeData}
        requireLogin={requireLogin}
      />
    );
  } else if (path.startsWith("/activities")) {
    page = (
      <ActivitiesPage
        navigate={navigate}
        auth={auth}
        data={homeData}
        requireLogin={requireLogin}
      />
    );
  } else if (path.startsWith("/events/")) {
    const eventId = decodeURIComponent(path.replace("/events/", "").split("?")[0] ?? "");
    page = (
      <EventDetailPage
        navigate={navigate}
        auth={auth}
        data={homeData}
        eventId={eventId}
        requireLogin={requireLogin}
      />
    );
  } else if (path.startsWith("/settings")) {
    page = <SettingsPage navigate={navigate} auth={auth} />;
  } else if (path.startsWith("/login")) {
    page = <Login navigate={navigate} auth={auth} data={homeData} />;
  } else {
    page = (
      <Home navigate={navigate} auth={auth} data={homeData} requireLogin={requireLogin} />
    );
  }

  return (
    <>
      {homeError && (
        <div className="bg-red-50 py-2 text-center text-sm text-red-600 border-b border-red-200">
          ⚠️ {homeError}
        </div>
      )}
      <div key={path} className="route-fade">
        {page}
      </div>
      <LoginPromptModal open={loginPromptOpen} onClose={closePrompt} onConfirm={goToLogin} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
