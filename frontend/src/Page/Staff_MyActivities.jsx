import { useMemo } from "react";
import StaffHeader, { HeaderSpacer } from "../components/Staff_Header";
import StaffEventCard from "../components/Staff_EventCard";
import Footer from "../components/Footer";
import { THEME } from "../theme";

export default function StaffMyActivitiesPage({
  navigate,
  auth,
  data,
  requireLogin,
}) {
  const isLoggedIn = auth?.loggedIn;

  // ดึงรายการกิจกรรมที่สตาฟสร้าง (ตอนนี้สมมติอยู่ใน data.events ก่อนนะ)
  const staffEvents = useMemo(() => {
    const list = data?.events ?? [];
    // เรียงจากแก้ไขล่าสุด -> เก่าสุด (ถ้าไม่มี updatedAt ก็ใช้ date แทน)
    return [...list].sort((a, b) => {
      const tA = new Date(a?.updatedAt ?? a?.date ?? 0).getTime();
      const tB = new Date(b?.updatedAt ?? b?.date ?? 0).getTime();
      return tB - tA;
    });
  }, [data?.events]);

  const openEventDetail = (event) => {
    if (!event?.id) return;
    navigate(`/staff/events/${encodeURIComponent(event.id)}`);
  };


  const goToStaffHome = () => navigate("/staff");
  const goToLogin = () => navigate("/login");
  const goToAddEvent = () => navigate("/staff#staff-add-event");

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: THEME.page, color: THEME.text }}
    >
      <StaffHeader
        auth={auth}
        navigate={navigate}
        notifications={data?.notifications ?? []}
        onSearch={goToStaffHome}
        onActivities={() => navigate("/staff/myActivities")}
        onAddActivityJump={goToAddEvent}
        onRequireLogin={requireLogin}
      />
      <HeaderSpacer />

      <main className="flex-1 pb-20">
        <div className="mx-auto flex w-full max-w-8/10 flex-col gap-10 px-4 pt-10">
          {/* แบนเนอร์หัวข้อเพจ */}
          <section className="rounded-[28px] border border-black/10 bg-white px-6 py-8 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-6">
              <div>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                  จัดการกิจกรรมที่คุณสร้าง
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  ดูภาพรวมกิจกรรมทั้งหมดที่คุณสร้างขึ้น แก้ไขรายละเอียด
                  หรือลบกิจกรรมที่ไม่ใช้แล้วได้จากหน้านี้
                </p>
              </div>
              <button
                type="button"
                onClick={goToAddEvent}
                className="inline-flex items-center justify-center rounded-full bg-[#e84c3d] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#d63a2b]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="mr-1.5 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                เพิ่มกิจกรรม
              </button>
            </div>
          </section>

          {/* ถ้ายังไม่ได้ล็อกอิน */}
          {!isLoggedIn ? (
            <section className="rounded-[28px] border border-dashed border-black/10 bg-white px-6 py-12 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">
                เข้าสู่ระบบเพื่อดูและจัดการกิจกรรมของคุณ
              </h2>
              <p className="mt-3 text-sm text-gray-600">
                ลงชื่อเข้าใช้เพื่อสร้าง แก้ไข
                และติดตามสถิติกิจกรรมที่คุณดูแล
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={goToLogin}
                  className="inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  type="button"
                  onClick={goToStaffHome}
                  className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-2 text-sm font-semibold text-gray-800 transition hover:border-black/30 hover:bg-black/5"
                >
                  กลับหน้าแรก
                </button>
              </div>
            </section>
          ) : staffEvents.length === 0 ? (
            // ล็อกอินแล้วแต่ยังไม่มีงานที่สร้าง
            <section className="rounded-[28px] border border-black/10 bg-white px-6 py-16 text-center shadow-sm flex flex-col items-center justify-center">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                ยังไม่มีกิจกรรมที่คุณสร้าง
              </h2>
              <p className="mt-3 text-sm text-gray-600 max-w-md">
                เริ่มต้นสร้างกิจกรรมแรกของคุณเพื่อประชาสัมพันธ์ให้กับนิสิต
                และติดตามจำนวนผู้เข้าร่วมได้จากหน้านี้
              </p>
              <button
                type="button"
                onClick={goToAddEvent}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                เพิ่มกิจกรรม
              </button>
            </section>
          ) : (
            // มีรายการกิจกรรมแล้ว
            <section className="rounded-[28px] border border-black/10 bg-white px-6 py-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  ทั้งหมด {staffEvents.length} กิจกรรมที่คุณดูแล
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-700 transition hover:border-black/30 hover:bg-black/5"
                >
                  กลับไปด้านบน
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 19V5m0 0-6 6m6-6 6 6" />
                  </svg>
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {staffEvents.map((event) => (
                  <StaffEventCard
                    key={event.id}
                    e={event}
                    loggedIn={isLoggedIn}
                    onRequireLogin={requireLogin}
                    onOpen={() => openEventDetail(event)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer className="mt-auto" />
    </div>
  );
}
