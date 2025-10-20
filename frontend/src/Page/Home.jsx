import { useRef } from "react";
import Header, { HeaderSpacer } from "../components/Header";
import Hero from "../components/Hero";
import EventsSection from "../components/EventsSection";
import AgendaGrid from "../components/AgendaGrid";
import EventCard from "../components/EventCard";
import FreeZoneSection from "../components/FreeZone";
import Footer from "../components/Footer";
import { THEME } from "../theme";
import useEventFavorites from "../hooks/useEventFavorites";

export default function Home({ navigate, auth, data, requireLogin }) {
  const refAgenda = useRef(null);

  const { events, favorites, error, onToggleLike, favoriteIds } = useEventFavorites(data, auth, requireLogin);

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
            <section className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">กิจกรรมที่คุณถูกใจ</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                    บันทึกไว้สำหรับติดตามภายหลัง
                  </h2>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...favorites]
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
          )}

          <EventsSection
            list={events.map((event) => ({
              ...event,
              liked: favoriteIds.has(event.id) || event.liked,
            }))}
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
  );
}
