import { useRef, useState } from "react";
import Header, { HeaderSpacer } from "../components/Header";
import Hero from "../components/Hero";
import EventsSection from "../components/EventsSection";
import AgendaGrid from "../components/AgendaGrid";
import { THEME } from "../theme";

export default function Home({ navigate, auth, data }) {
  const [events, setEvents] = useState(data.events ?? []);
  const liked = events.filter(e => e.liked);
  const refAgenda = useRef(null);

  const onToggleLike = (id, state) =>
    setEvents(prev => prev.map(e => e.id === id ? { ...e, liked: state } : e));

  return (
    <div style={{ background: THEME.page, color: THEME.text, minHeight: "100vh" }}>
      <Header
        auth={auth}
        navigate={navigate}
        onCalendarJump={() => refAgenda.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        notifications={data.notifications}
      />
      <HeaderSpacer />

      <main>
        <Hero images={data.hero?.images} fallbackSrc={data.hero?.fallbackSrc} />

        {auth.loggedIn && liked.length > 0 && (
          <section className="mx-auto max-w-6xl mt-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm text-gray-700">กิจกรรมที่คุณถูกใจ</h3>
              <span />
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liked.map((e) => (
                // reuse EventCard via EventsSection if you prefer
                <div key={e.id} className="contents" />
              ))}
            </div>
          </section>
        )}

        <EventsSection
          list={events}
          loggedIn={auth.loggedIn}
          onToggle={onToggleLike}
          onSeeAllLink={() => navigate("/events-all")}
        />

        <AgendaGrid forwardRef={refAgenda} days={data.agendaDays} />

        <footer className="mt-16 border-t border-black/10">
          <div className="bg-yellow-400">
            <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 opacity-80">
                <div className="w-5 h-5 bg-yellow-600" /><span>MeetMeet</span>
              </div>
              <div className="opacity-60">© 2025 Company Name, Inc. All rights reserved.</div>
              <div className="flex gap-4 opacity-80"><a href="#">Terms</a><a href="#">Privacy</a><a href="#">Support</a></div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
