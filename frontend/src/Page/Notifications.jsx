import React from "react";
import Header from "../components/Header"; 
import { useNavigate } from "react-router-dom";

const THEME = {
  page: "#f7f7f7",
  text: "#111111",
  bellDot: "#ef4444",
};

function HeaderSpacer() {
  return <div style={{ height: 68 }} />;
}

function NotificationsList({ list }) {
  const items = Array.isArray(list) ? list : [];

  return (
    <div className="mt-6 bg-white rounded-2xl shadow border max-w-[980px] mx-auto">
      <div className="px-6 py-5 text-[15px] font-semibold">การแจ้งเตือน</div>

      {items.length === 0 ? (
        <div className="px-6 py-8 text-sm text-gray-600">ยังไม่มีการแจ้งเตือนนะคะ</div>
      ) : (
        <div className="divide-y divide-black/10">
          {items.map((n) => (
            <div
              key={n.id}
              className="grid grid-cols-[64px,1fr,10px] items-center gap-4 px-6 py-5 hover:bg-black/[.035] transition"
              title={n.title}
              onClick={() => navigate(`/notification/${n.id}`)}
            >
              {/* icon bubble */}
              <span
                className="inline-flex items-center justify-center w-12 h-12 rounded-full"
                style={{ background: n.color }}
                aria-hidden
              >
                <span className="text-xl leading-none">{n.icon}</span>
              </span>

              {/* text */}
              <div className="min-w-0">
                <div className="text-[15px] font-semibold leading-tight truncate">
                  {n.title}
                </div>
                <div className="text-[13px] text-gray-600 leading-snug line-clamp-2">
                  {n.detail}
                </div>
              </div>

              {/* dot */}
              <span
                className="w-2 h-2 rounded-full justify-self-end self-center"
                style={{ background: n.unread ? THEME.bellDot : "#f59e9e" }}
                aria-hidden
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage({ auth, notifications, requireLogin }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: THEME.page, color: THEME.text }}>
      {/* Header จริงของแอป */}
      <Header
        auth={auth}
        navigate={navigate}
        onCalendarJump={() => navigate("/")}
        notifications={notifications}
        onActivities={() => navigate("/activities")}
        onRequireLogin={requireLogin}
        onClick={() => navigate(`/notification/${n.id}`)}
      />
      <HeaderSpacer />

      <main className="mx-auto max-w-[1040px] px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">การแจ้งเตือน</h1>
          <button
            className="text-sm text-gray-700 opacity-80 hover:opacity-100"
            onClick={() => navigate("/")}
            style={{ background: "transparent" }}
          >
            กลับหน้าแรก
          </button>
        </div>

        <NotificationsList list={notifications} />
      </main>
    </div>
  );
}
