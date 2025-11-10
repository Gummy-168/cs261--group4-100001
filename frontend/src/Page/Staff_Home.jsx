import { useEffect, useState } from "react";
import StaffHeader, { HeaderSpacer } from "../components/Staff_Header";

import StaffMyActivitiesSection from "../components/Staff_MyActivitiesSection";
import StaffAddEventSection from "../components/Staff_AddEventSection";
import Footer from "../components/Footer";
import { THEME } from "../theme";

export default function Staff_Home({ navigate, auth, data, requireLogin }) {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");

  // กันกรณี data เป็น null / undefined
  const safeData = data || {
    events: [],
    notifications: [],
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (!params.has("loggedOut")) {
      setLogoutModalOpen(false);
      setLogoutMessage("");
      return;
    }

    const message = params.get("message") || "ออกจากระบบเรียบร้อยแล้ว";
    setLogoutMessage(message);
    setLogoutModalOpen(true);

    params.delete("loggedOut");
    params.delete("message");
    const nextSearch = params.toString();
    const nextUrl = nextSearch
      ? `${window.location.pathname}?${nextSearch}`
      : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  }, []);

  const closeLogoutModal = () => {
    setLogoutModalOpen(false);
    setLogoutMessage("");
  };

  const goToSearch = () => {
    navigate("/staff/myActivities");
  };

  const openEventDetail = (event) => {
    if (!event?.id) return;
    navigate(`/staff/events/${encodeURIComponent(event.id)}`);
  };

  // -------- Welcome Section ----------
  const facultyName =
    auth?.profile?.faculty ??
    auth?.profile?.department ??
    "คณะ...";

  const WelcomeSection = (
    <section className="mx-auto mt-10 w-full max-w-5xl text-center px-6 pt-10 pb-20">
      <h1 className="text-3xl md:text-4xl font-bold text-black">
        ยินดีต้อนรับ
      </h1>
      <p className="mt-2 text-2xl md:text-[1.6rem] font-medium text-black">
        ผู้ดูแลจาก{" "}
        <span className="font-semibold">{facultyName}</span>
      </p>
    </section>
  );

  // กิจกรรมของ staff
  const staffEvents = safeData.events || [];

  // Header เรียก “เพิ่มกิจกรรม”
  const handleAddActivityJump = () => {
    if (typeof window === "undefined") return;

    const el = document.getElementById("staff-add-event");
    if (el) {
      // อยู่หน้า /staff แล้ว -> เลื่อนลงแบบ smooth
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // เผื่อถูกเรียกจากหน้าอื่น / reload แปลก ๆ
      navigate("/staff#staff-add-event");
    }
  };

  return (
    <>
      {logoutModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          role="alertdialog"
          aria-live="assertive"
          aria-modal="true"
          onClick={closeLogoutModal}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              ออกจากระบบสำเร็จ
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {logoutMessage || "ออกจากระบบเรียบร้อยแล้ว"}
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={closeLogoutModal}
                className="inline-flex items-center rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          background: THEME.page,
          color: THEME.text,
          minHeight: "100vh",
        }}
      >
        <StaffHeader
          auth={auth}
          navigate={navigate}
          notifications={safeData.notifications || []}
          onSearch={goToSearch}
          onActivities={() => navigate("/staff/myActivities")}
          onRequireLogin={requireLogin}
          onAddActivityJump={handleAddActivityJump}
        />
        <HeaderSpacer />

        {WelcomeSection}

        <main className="pb-24">
          <div className="mx-auto flex w-full max-w-8/10 flex-col gap-16 px-3 md:px-4">
            <StaffMyActivitiesSection
              list={staffEvents}
              loggedIn={auth?.loggedIn}
              onToggle={() => {}} // ตอนนี้ยังไม่มี toggle จริง ใส่ฟังก์ชันว่างไว้ก่อน
              onSeeAllLink={() => navigate("/staff/myActivities")}
              onRequireLogin={requireLogin}
              onOpenEvent={openEventDetail}
            />

            <StaffAddEventSection auth={auth} navigate={navigate} />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
