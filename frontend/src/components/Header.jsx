import { useEffect, useRef, useState } from "react";
import { FLAGS, LOGO_TEXT, THEME } from "../theme";

function useScrollShowDownHideUp() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(window.scrollY);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const goingUp = y < lastY.current;
      if (FLAGS.NAV_HIDE_ON_SCROLL_UP) setHidden(goingUp && y > 10);
      lastY.current = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  return hidden;
}
function useClickOutside(ref, onClose) {
  useEffect(() => {
    const onDoc = (e) => ref.current && !ref.current.contains(e.target) && onClose?.();
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [ref, onClose]);
}

export function HeaderSpacer() {
  return <div style={{ height: FLAGS.HEADER_HEIGHT_PX }} />;
}

export default function Header({ navigate, onCalendarJump, notifications = [], auth }) {
  const hidden = useScrollShowDownHideUp();

  const [openBell, setOpenBell] = useState(false);
  const bellRef = useRef(null);
  useClickOutside(bellRef, () => setOpenBell(false));

  const [openProfile, setOpenProfile] = useState(false);
  const profRef = useRef(null);
  useClickOutside(profRef, () => setOpenProfile(false));

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 transition-transform duration-300"
      style={{
        transform: hidden ? "translateY(-110%)" : "translateY(0)",
        background: `${THEME.brand.yellow}cc`,
        backdropFilter: "saturate(1.1) blur(4px)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <a href="/" onClick={(e)=>{e.preventDefault(); navigate("/");}} className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm" style={{ background: THEME.brand.yellow }} />
          <span className="text-2xl font-extrabold">{LOGO_TEXT}</span>
        </a>

        <nav className="flex items-center gap-6">
          <button className="p-1" aria-label="Calendar" onClick={onCalendarJump}>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </button>

          {/* bell */}
          <div className="relative" ref={bellRef}>
            <button className="relative p-1" onClick={() => setOpenBell(v=>!v)}>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 18v1a2 2 0 1 1-4 0v-1"/>
                <path d="M6 8a6 6 0 1 1 12 0v5l2 3H4l2-3V8z"/>
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: THEME.bellDot }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {openBell && (
              <div className={`absolute right-0 mt-2 ${FLAGS.NOTIF_POPUP_WIDTH} ${FLAGS.NOTIF_POPUP_HEIGHT} rounded-2xl shadow-lg border bg-white`}>
                <div className="flex items-center justify-between px-4 pt-3">
                  <div className="text-[15px] font-semibold">การแจ้งเตือน</div>
                  <button className="text-sm opacity-80 hover:opacity-100" onClick={() => { setOpenBell(false); navigate("/notifications"); }}>
                    ทั้งหมด →
                  </button>
                </div>
                <div className="mt-2 h-[calc(200px-40px-8px)] overflow-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="grid grid-cols-[auto,1fr,auto] items-start gap-3 px-4 py-2 hover:bg-black/5">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0" style={{ background: n.color }}>
                        <span className="text-lg">{n.icon}</span>
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium line-clamp-1">{n.title}</div>
                        <div className="text-xs text-gray-600 line-clamp-2">{n.detail}</div>
                      </div>
                      <span className="w-2 h-2 rounded-full mt-1"
                            style={{ background: n.unread ? THEME.bellDot : "#f59e9e" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* auth */}
          {auth?.loggedIn ? (
            <div className="relative" ref={profRef}>
              <button className="p-1" onClick={() => setOpenProfile(v => !v)}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/>
                </svg>
              </button>
              {openProfile && (
                <div className="absolute right-0 mt-2 w-[360px] rounded-[16px] shadow-lg border bg-white overflow-hidden">
                  <div className="px-4 py-4" style={{ background: THEME.brand.yellow }}>
                    <div className="font-bold">ชื่อ</div>
                    <div className="text-sm opacity-90">ส่วนตัว</div>
                  </div>
                  <div className="bg-white px-2 py-3">
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5">การตั้งค่า</button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5"
                            onClick={auth.logout}>ออกจากระบบ</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="rounded-xl px-4 py-2 text-sm font-semibold shadow"
                    style={{ background: THEME.brand.yellowDark, color: THEME.text }}
                    onClick={() => navigate("/login")}>
              เข้าสู่ระบบ
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
