import React, { useMemo, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { usePath } from "./lib/router";
import { fetchHomeData } from "./lib/api";
import Home from "./Page/Home";               
import Login from "./Page/Login";             
import NotificationsPage from "./Page/Notifications";
// import EventsAll from "./page/EventsAll";

function useAuthStore(initial = false) {
  const [loggedIn, setLoggedIn] = useState(initial);
  return useMemo(() => ({
    loggedIn,
    login: () => setLoggedIn(true),
    logout: () => setLoggedIn(false),
  }), [loggedIn]);
}

function App() {
  const { path, navigate } = usePath();
  const auth = useAuthStore(false);

  // preload home data (you can split per-route if you want)
  const [homeData, setHomeData] = useState(null);
  useEffect(() => { fetchHomeData().then(setHomeData); }, []);

  // minimal loading state
  if (!homeData) return <div className="p-6 text-gray-600">Loading…</div>;
  if (path.startsWith("/notifications")) {
    return (
      <NotificationsPage
        navigate={navigate}
        auth={auth}
        notifications={homeData.notifications}
      />
    );
  }

  if (path.startsWith("/login"))        return <Login navigate={navigate} auth={auth} data={homeData} />;
  // if (path.startsWith("/notifications")) return <Notifications navigate={navigate} auth={auth} data={homeData} />;
  // if (path.startsWith("/events-all"))   return <EventsAll navigate={navigate} auth={auth} data={homeData} />;

  return <Home navigate={navigate} auth={auth} data={homeData} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);
