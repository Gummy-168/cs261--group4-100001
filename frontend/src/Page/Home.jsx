import { useRef } from "react";
import Header, { HeaderSpacer } from "../components/Header";
import Hero from "../components/Hero";
import EventsSection from "../components/EventsSection";
import AgendaGrid from "../components/AgendaGrid";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import { THEME } from "../theme";
import useEventFavorites from "../hooks/useEventFavorites";

export default function Home({ navigate, auth, data, requireLogin }) {
  const refAgenda = useRef(null);

  const { events, favorites, error, onToggleLike, favoriteIds } = useEventFavorites(data, auth, requireLogin);

  const goToSearch = (query = "") => {
    if (query && typeof query === "string") {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate("/search");
    }
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
                  .map((event) => (
                    <EventCard
                      key={`fav-${event.id}`}
                      e={{ ...event, liked: true }}
                      loggedIn
                      onToggle={onToggleLike}
                      onRequireLogin={requireLogin}
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
          />

          <AgendaGrid forwardRef={refAgenda} days={data.agendaDays} />

          <section className="rounded-[28px] border border-black/5 bg-white py-16 text-center shadow-sm">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Free Zone</h2>
            <p className="mt-4 text-base text-gray-600">
              พื้นที่สำหรับโปรโมตกิจกรรม ข่าวสาร หรือคอนเทนต์อื่น ๆ ที่อยากเน้นเป็นพิเศษ
              สามารถปรับแต่งเนื้อหาได้ตามที่ต้องการ
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
