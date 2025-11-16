import { useEffect, useRef, useState } from "react";
import Header, { HeaderSpacer } from "../components/Header";
import Hero from "../components/Hero";
import EventsSection from "../components/EventsSection";
import AgendaGrid from "../components/AgendaGrid";
import EventCard from "../components/EventCard";
import FreeZoneSection from "../components/FreeZone";
import Footer from "../components/Footer";
import { THEME } from "../theme";
import useEventFavorites from "../hooks/useEventFavorites";
import ReviewPendingCard from "../components/ReviewPendingCard";

// import { MOCK_EVENTS_WITH_REVIEWS } from "../lib/mockData";

// const mockEvent = {
//   id: "mock-1",
//   title: "กิจกรรมตัวอย่าง",
//   description: "ลองเขียนรีวิวและให้คะแนนในหน้านี้ได้เลย",
//   date: "2025-11-08",
//   image: "https://picsum.photos/400/200",
//   rating: 4.3,
//   reviewCount: 2,
// };

export default function Home({ navigate, auth, data, requireLogin }) {
  const refAgenda = useRef(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (!params.has("loggedOut")) {
      setLogoutModalOpen(false);
      setLogoutMessage("");
      return;
    }

    const message =
      params.get("message") ||
      "\u0e2d\u0e2d\u0e01\u0e08\u0e32\u0e01\u0e23\u0e30\u0e1a\u0e1a\u0e40\u0e23\u0e35\u0e22\u0e1a\u0e23\u0e49\u0e2d\u0e22\u0e41\u0e25\u0e49\u0e27";
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
  
  
  const { events, favorites, error, onToggleLike, favoriteIds } = useEventFavorites(
    data,
    auth,
    requireLogin
  );

  const goToSearch = (query = "") => {
    // Navigate ไปหน้า Activities แล้วค้นหาที่นั่น
    navigate("/activities");
    // หมายเหตุ: ใน Activities page จะต้องรับ query จาก URL parameter
  };

  const openEventDetail = (event) => {
    if (!event?.id) return;
    const target = `/events/${encodeURIComponent(event.id)}`;
    const url =
      typeof window !== "undefined"
        ? new URL(target, window.location.origin).toString()
        : target;
    window.open(url, "_blank", "noopener,noreferrer");
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
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {"\u0e2d\u0e2d\u0e01\u0e08\u0e32\u0e01\u0e23\u0e30\u0e1a\u0e1a\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {logoutMessage || "\u0e2d\u0e2d\u0e01\u0e08\u0e32\u0e01\u0e23\u0e30\u0e1a\u0e1a\u0e40\u0e23\u0e35\u0e22\u0e1a\u0e23\u0e49\u0e2d\u0e22\u0e41\u0e25\u0e49\u0e27"}
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={closeLogoutModal}
                className="inline-flex items-center rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {"\u0e15\u0e01\u0e25\u0e07"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: THEME.page, color: THEME.text, minHeight: "100vh" }}>
        <Header
          auth={auth}
          navigate={navigate}
          onCalendarJump={() =>
            refAgenda.current?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          notifications={data.notifications}
          onSearch={goToSearch}
          onActivities={() => navigate("/activities")}
          onRequireLogin={requireLogin}
        />
        <HeaderSpacer />

        <main className="pb-24">
          <div className="mx-auto flex w-full max-w-8/10 flex-col gap-16 px-3 md:px-4">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <Hero
              images={data.hero?.images}
              fallbackSrc={data.hero?.fallbackSrc}
              headline={data.hero?.headline}
              tagline={data.hero?.tagline}
              period={data.hero?.period}
              onSearch={goToSearch}
            />


              {auth.loggedIn && favorites.length > 0 && (
                <>
                  {/* Section 1: Liked Activities */}
                  <section className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">กิจกรรมที่คุณถูกใจ</p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                          บันทึกไว้สำหรับติดตาม ภายหลัง
                        </h2>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {favorites
                        .filter(event => {
                          // Show only: liked AND not ended
                          const hasEnded = event.endTime && new Date(event.endTime).getTime() < Date.now();
                          return !hasEnded;
                        })
                        .sort((a, b) => {
                          const dateA = new Date(a.date ?? 0).getTime();
                          const dateB = new Date(b.date ?? 0).getTime();
                          return dateA - dateB;
                        })
                        .slice(0, 3)
                        .map((event) => (
                          <EventCard
                            key={`fav-${event.id}`}
                            e={{ ...event, liked: true }}
                            loggedIn
                            onToggle={onToggleLike}
                            onRequireLogin={requireLogin}
                            onOpen={openEventDetail}
                          />
                        ))}
                    </div>
                  </section>

                  {/* Section 2: Pending Review Activities */}
                  {favorites.some(e => {
                    const hasEnded = e.endTime && new Date(e.endTime).getTime() < Date.now();
                    return hasEnded && !e.hasReviewed;
                  }) && (
                    <section className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">กิจกรรมที่รอคุณให้คะแนน</p>
                          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                            ให้คะแนนและรีวิวกิจกรรมที่เข้าร่วมแล้ว
                          </h2>
                        </div>
                      </div>

                      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {favorites
                          .filter(event => {
                            const hasEnded = event.endTime && new Date(event.endTime).getTime() < Date.now();
                            return hasEnded && !event.hasReviewed;
                          })
                          .sort((a, b) => {
                            const dateA = new Date(a.date ?? 0).getTime();
                            const dateB = new Date(b.date ?? 0).getTime();
                            return dateA - dateB;
                          })
                          .slice(0, 3)
                          .map((event) => (
                            <ReviewPendingCard
                              key={`review-${event.id}`}
                              e={{ ...event, liked: true }}
                              loggedIn
                              onOpen={openEventDetail}
                            />
                          ))}
                      </div>
                    </section>
                  )}
                </>
              )}

            <EventsSection
            list={events}
              loggedIn={auth.loggedIn}
              onToggle={onToggleLike}
              onSeeAllLink={() => navigate("/activities")}
              onRequireLogin={requireLogin}
              onOpenEvent={openEventDetail}
            />

            <AgendaGrid forwardRef={refAgenda} days={data.agendaDays} />

            <FreeZoneSection />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
