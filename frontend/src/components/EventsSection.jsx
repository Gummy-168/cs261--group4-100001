import EventCard from "./EventCard";

export default function EventsSection({
  list = [],
  loggedIn,
  onToggle,
  onSeeAllLink,
  onRequireLogin,
  onOpenEvent,
}) {
  return (
    <section className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">รายการกิจกรรม</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
            อัปเดตกิจกรรมล่าสุดของมหาวิทยาลัย
          </h2>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2 text-sm font-semibold text-gray-800 transition hover:border-black/30 hover:bg-black/5"
          onClick={onSeeAllLink}
        >
          ดูทั้งหมด
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m10 6 6 6-6 6" />
          </svg>
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((event) => (
          <EventCard
            key={event.id}
            e={event}
            loggedIn={loggedIn}
            onToggle={onToggle}
            onRequireLogin={onRequireLogin}
            onOpen={onOpenEvent}
          />
        ))}
      </div>
    </section>
  );
}
