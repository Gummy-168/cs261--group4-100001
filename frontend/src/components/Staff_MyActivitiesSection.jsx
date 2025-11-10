import StaffEventCard from "./Staff_EventCard";

export default function StaffMyActivitiesSection({
  list = [],
  loggedIn,
  onToggle,
  onSeeAllLink,
  onRequireLogin,
  onOpenEvent,
  maxVisible = 6,
}) {
  const visibleEvents = list.slice(0, maxVisible);

  return (
    <section className="rounded-[28px] border border-black/5 bg-white px-8 py-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      {/* หัวข้อ + ดูทั้งหมด */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          กิจกรรมของฉัน
        </h2>

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

      {/* การ์ดกิจกรรม */}
      <div className="
        mt-8 
        grid 
        grid-cols-1 
        gap-6 
        sm:grid-cols-2 
        lg:grid-cols-3
      ">
        {visibleEvents.map((event) => (
          <StaffEventCard
            key={event.id}
            e={event}
            loggedIn={loggedIn}
            onToggle={onToggle}
            onRequireLogin={onRequireLogin}
            onOpen={onOpenEvent}
          />
        ))}
      </div>

      {/* ถ้าไม่มีรายการเลย */}
      {visibleEvents.length === 0 && (
        <div className="flex h-40 items-center justify-center">
          <p className="text-lg text-gray-500">
            ยังไม่มีกิจกรรมที่คุณสร้าง
          </p>
        </div>
)}
    </section>
  );
}
