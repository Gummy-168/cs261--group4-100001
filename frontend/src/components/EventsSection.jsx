import EventCard from "./EventCard";

export default function EventsSection({ list = [], loggedIn, onToggle, onSeeAllLink }) {
  return (
    <section className="mx-auto max-w-6xl mt-6">
      <div className="flex items-center justify-between px-1">
        <a className="flex items-center gap-1 text-sm hover:underline cursor-pointer" onClick={onSeeAllLink}>
          <span>รายการกิจกรรม</span><span>→</span>
        </a>
        <span />
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((e) => (
          <EventCard key={e.id} e={e} loggedIn={loggedIn} onToggle={onToggle} />
        ))}
      </div>
    </section>
  );
}
