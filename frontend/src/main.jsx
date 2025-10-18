import React, { useMemo, useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { usePath } from "./lib/router";
import { fetchHomeData } from "./lib/api";
import Home from "./Page/Home";
import Login from "./Page/Login";
import NotificationsPage from "./Page/Notifications";
import ActivitiesPage from "./Page/Activities";
import LoginPromptModal from "./components/LoginPromptModal";
// import EventsAll from "./page/EventsAll";

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
    return {
      loggedIn: Boolean(storedToken),
      token: storedToken,
      profile: null,
      userId: storedUserId ? parseInt(storedUserId) : null,  // เพิ่ม userId
    };
  });

  const login = useCallback(({ token, profile, remember = true, userId } = {}) => {
    setState((prev) => ({
      ...prev,
      loggedIn: true,
      token: token ?? prev.token,
      profile: profile ?? prev.profile,
      userId: userId ?? prev.userId,  // เพิ่ม userId
    }));
    if (token) {
      if (remember) {
        localStorage.setItem("authToken", token);
        sessionStorage.removeItem("authToken");
      } else {
        sessionStorage.setItem("authToken", token);
        localStorage.removeItem("authToken");
      }
    }
    if (userId) {
      localStorage.setItem("userId", userId.toString());
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("userId");  // ลบ userId ด้วย
    setState({ loggedIn: false, token: null, profile: null, userId: null });
  }, []);

  return useMemo(() => ({
    ...state,
    login,
    logout,
  }), [state, login, logout]);
}

function App() {
  const { path, navigate } = usePath();
  const auth = useAuthStore();

  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  // preload home data (you can split per-route if you want)
  const [homeData, setHomeData] = useState(null);
  const [homeError, setHomeError] = useState(null);

  useEffect(() => {
    let active = true;
    setHomeError(null);
    
    // ส่ง userId ถ้ามี
    const userId = auth.profile?.id || auth.userId;
    
    fetchHomeData(auth.token, userId)
      .then((data) => {
        if (active) setHomeData(data);
      })
      .catch((error) => {
        if (active) setHomeError(error.message ?? "ไม่สามารถโหลดข้อมูลได้");
      });
    return () => { active = false; };
  }, [auth.token, auth.profile, auth.userId]);

  if (!homeData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-600">
        Loading...
      </div>
    );
  }

  const requireLogin = () => setLoginPromptOpen(true);
  const closePrompt = () => setLoginPromptOpen(false);
  const goToLogin = () => {
    setLoginPromptOpen(false);
    navigate("/login");
  };

  let page = null;
  if (path.startsWith("/notifications")) {
    page = (
      <NotificationsPage
        navigate={navigate}
        auth={auth}
        notifications={homeData.notifications}
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
  } else if (path.startsWith("/login")) {
    page = <Login navigate={navigate} auth={auth} data={homeData} />;
  } else {
    page = <Home navigate={navigate} auth={auth} data={homeData} requireLogin={requireLogin} />;
  }
  // if (path.startsWith("/events-all"))   return <EventsAll navigate={navigate} auth={auth} data={homeData} />;

  return (
    <>
      {homeError ? (
        <div className="bg-red-50 py-2 text-center text-sm text-red-600">
          {homeError}
        </div>
      ) : null}
      <div key={path} className="route-fade">
        {page}
      </div>
      <LoginPromptModal open={loginPromptOpen} onClose={closePrompt} onConfirm={goToLogin} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);
