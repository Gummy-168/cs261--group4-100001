import { useMemo } from "react";
import Header, { HeaderSpacer } from "../components/Header";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import { THEME } from "../theme";
import useEventFavorites from "../hooks/useEventFavorites";

export default function MyActivitiesPage({ navigate, auth, data, requireLogin }) {
  const { favorites, error, onToggleLike, favoriteIds } = useEventFavorites(
    data,
    auth,
    requireLogin
  );

  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => {
      const dateA = new Date(a?.date ?? 0).getTime();
      const dateB = new Date(b?.date ?? 0).getTime();
      return dateA - dateB;
    });
  }, [favorites]);

  const openEventDetail = (event) => {
    if (!event?.id) return;
    const target = `/events/${encodeURIComponent(event.id)}`;
    const url =
      typeof window !== "undefined"
        ? new URL(target, window.location.origin).toString()
        : target;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const goToActivities = () => navigate("/activities");
  const goToLogin = () => navigate("/login");

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: THEME.page, color: THEME.text }}
    >
      <Header
        auth={auth}
        navigate={navigate}
        notifications={data?.notifications ?? []}
        onSearch={() => navigate("/activities")}
        onActivities={goToActivities}
        onRequireLogin={requireLogin}
      />
      <HeaderSpacer />

      <main className="flex-1 pb-20">
        <div className="mx-auto flex w-full max-w-8/10 flex-col gap-10 px-4 pt-10">
          <section className="rounded-[28px] border border-black/10 bg-white px-6 py-8 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">กิจกรรมที่คุณถูกใจ</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                  บันทึกไว้สำหรับติดตามภายหลัง
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  รวบรวมกิจกรรมทั้งหมดที่คุณกดถูกใจไว้ในที่เดียว เพื่อกลับมาดูรายละเอียดหรือสมัครเข้าร่วมได้ง่ายขึ้น
                </p>
              </div>
              <button
                type="button"
                onClick={goToActivities}
                className="inline-flex items-center justify-center rounded-full border border-black/10 px-5 py-2 text-sm font-semibold text-gray-800 transition hover:border-black/30 hover:bg-black/5"
              >
                ดูกิจกรรมทั้งหมด
              </button>
            </div>
          </section>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {!auth?.loggedIn ? (
            <section className="rounded-[28px] border border-dashed border-black/10 bg-white px-6 py-12 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">เข้าสู่ระบบเพื่อดูรายการโปรดของคุณ</h2>
              <p className="mt-3 text-sm text-gray-600">
                ลงชื่อเข้าใช้เพื่อดูและจัดการกิจกรรมที่คุณบันทึกไว้ รวมถึงติดตามการอัปเดตได้สะดวกยิ่งขึ้น
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
                  onClick={goToActivities}
                  className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-2 text-sm font-semibold text-gray-800 transition hover:border-black/30 hover:bg-black/5"
                >
                  ไปหน้ากิจกรรม
                </button>
              </div>
            </section>
          ) : sortedFavorites.length === 0 ? (
            <section className="rounded-[28px] border border-black/10 bg-white px-6 py-12 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">ยังไม่มีรายการถูกใจ</h2>
              <p className="mt-3 text-sm text-gray-600">
                ลองสำรวจกิจกรรมใหม่ๆ และกดหัวใจไว้เพื่อเก็บกิจกรรมที่สนใจกลับมาดูได้ทุกเมื่อ
              </p>
              <button
                type="button"
                onClick={goToActivities}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                ค้นหากิจกรรม
              </button>
            </section>
          ) : (
            <section className="rounded-[28px] border border-black/10 bg-white px-6 py-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  ทั้งหมด {sortedFavorites.length} กิจกรรมที่ถูกใจ
                </h2>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-700 transition hover:border-black/30 hover:bg-black/5"
                >
                  กลับไปด้านบน
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 19V5m0 0-6 6m6-6 6 6" />
                  </svg>
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedFavorites.map((event) => (
                  <EventCard
                    key={`fav-${event.id}`}
                    e={{ ...event, liked: favoriteIds.has(event.id) || event.liked }}
                    loggedIn={auth.loggedIn}
                    onToggle={onToggleLike}
                    onRequireLogin={requireLogin}
                    onOpen={openEventDetail}
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
