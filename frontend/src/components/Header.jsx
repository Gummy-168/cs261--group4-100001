import { useEffect, useRef, useState } from "react";
import { logout } from "../services/authService";
import { FLAGS, LOGO_TEXT, THEME } from "../theme";
import LogoMeetMeet from "../assets/img/Logo_MeetMeet.png";

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

export default function Header({
  navigate,
  onCalendarJump,
  notifications = [],
  auth,
  onSearch,
  onActivities,
  onRequireLogin,
}) {
  const hidden = useScrollShowDownHideUp();

  const [openBell, setOpenBell] = useState(false);
  const bellRef = useRef(null);
  useClickOutside(bellRef, () => setOpenBell(false));

  const [openProfile, setOpenProfile] = useState(false);
  const profRef = useRef(null);
  useClickOutside(profRef, () => setOpenProfile(false));

  const isLoggedIn = auth?.loggedIn || false;
  const unreadCount = isLoggedIn ? notifications.filter((n) => n.unread).length : 0;
  const user = auth?.profile || {};

  // Handle Logout
  const handleLogout = () => {
    console.log('👋 Logging out...');
    logout(); // Clear tokens from storage
    auth?.logout?.(); // Update auth state
    setOpenProfile(false);
    navigate('/login');
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 transition-transform duration-300"
      style={{
        transform: hidden ? "translateY(-110%)" : "translateY(0)",
        background: THEME.brand.soft,
        backdropFilter: "saturate(1.1) blur(4px)",
      }}
    >
      <div className="mx-auto max-w-8/10 px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); navigate("/"); }} 
          className="flex items-center gap-2"
        >
          <img src={LogoMeetMeet} alt={LOGO_TEXT} className="h-9 w-auto" />
        </a>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {/* Search Button */}
          <button
            className="p-1 hover:text-red-600 transition-colors"
            aria-label="ค้นหากิจกรรม"
            onClick={() => (onSearch ? onSearch() : navigate("/search"))}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="6" />
              <path d="m20 20-3.6-3.6" />
            </svg>
          </button>

          {/* Activities Button */}
          <button
            className="rounded-full px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-black/10"
            onClick={() => (onActivities ? onActivities() : navigate("/activities"))}
          >
            กิจกรรมอื่นๆ
          </button>

          {/* Calendar Button */}
          {onCalendarJump && (
            <button
              className="rounded-full px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-black/10"
              onClick={onCalendarJump}
            >
              ปฏิทิน
            </button>
          )}

          {/* Notifications Bell */}
          <div className="relative" ref={bellRef}>
            <button
              className="relative p-1 hover:text-red-600 transition-colors"
              aria-label="แจ้งเตือน"
              onClick={() => {
                if (!isLoggedIn) {
                  if (typeof onRequireLogin === "function") {
                    onRequireLogin();
                  } else {
                    navigate('/login');
                  }
                  return;
                }
                setOpenBell((prev) => !prev);
              }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {openBell && isLoggedIn && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">แจ้งเตือน</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    ไม่มีการแจ้งเตือน
                  </div>
                ) : (
                  <div>
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                          notif.unread ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          setOpenBell(false);
                          navigate('/notifications');
                        }}
                      >
                        <div className="flex gap-3">
                          <span className="text-2xl">{notif.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notif.detail}</p>
                          </div>
                          {notif.unread && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-1"></span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="px-4 py-2 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setOpenBell(false);
                      navigate('/notifications');
                    }}
                    className="text-sm text-blue-600 hover:underline w-full text-center"
                  >
                    ดูทั้งหมด
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile / Login */}
          {isLoggedIn ? (
            <div className="relative" ref={profRef}>
              <button
                className="flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-black/10 transition-colors"
                onClick={() => setOpenProfile(!openProfile)}
                aria-label="โปรไฟล์"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {user.displaynameTh?.charAt(0) || user.username?.charAt(0) || 'U'}
                </div>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {openProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{user.displaynameTh || 'ผู้ใช้'}</p>
                    <p className="text-sm text-gray-600">{user.email || user.username}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setOpenProfile(false);
                      navigate('/settings');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>ตั้งค่า</span>
                  </button>

                  <button
                    onClick={() => {
                      setOpenProfile(false);
                      navigate('/my-activities');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>กิจกรรมของฉัน</span>
                  </button>

                  <div className="border-t border-gray-200 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="rounded-full px-6 py-2 bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
            >
              เข้าสู่ระบบ
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

