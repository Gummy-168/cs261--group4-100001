function AgendaCard({ day }) {
  const firstId = day.items?.[0]?.id;
  const clickable = Boolean(firstId);
  const onOpen = () => {
    if (clickable) window.open(`/events/${firstId}`, "_blank", "noopener,noreferrer");
  };

  const formatted = (() => {
    if (!day.date) return "";
    try {
      return new Date(day.date).toLocaleDateString("th-TH", {
        weekday: "short",
        day: "numeric",
        month: "long",
      });
    } catch (_) {
      return "";
    }
  })();

  const highlight = Boolean(day.highlight);

  const hoverClass = clickable ? "hover:-translate-y-[2px] hover:shadow-lg" : "";
  return (
    <div
      className={`flex h-full flex-col rounded-[24px] border px-5 py-6 shadow-sm transition ${hoverClass} ${
        highlight
          ? "border-[#f0b429] bg-[#ffe082]"
          : "border-black/10 bg-white"
      }`}
      style={clickable ? { cursor: "pointer" } : undefined}
      onClick={onOpen}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400">
        DAY
      </div>
      <h3 className="mt-2 text-lg font-semibold text-gray-900">{formatted || "ไม่มีกำหนด"}</h3>

      <ul className="mt-4 space-y-2 text-sm text-gray-700">
        {(day.items ?? []).map((item) => (
          <li key={item.id} className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-500" />
            <span className="leading-snug">{item.title}</span>
          </li>
        ))}
        {(!day.items || day.items.length === 0) && (
          <li className="text-gray-500">ยังไม่มีกิจกรรมที่บันทึกไว้</li>
        )}
      </ul>
    </div>
  );
}

export default function AgendaGrid({ days = [], forwardRef }) {
  return (
    <section ref={forwardRef} className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-gray-500">ช่วงนี้มีกิจกรรมอะไรบ้าง?</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
          ปฏิทินกิจกรรมประจำสัปดาห์
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {days.map((day, index) => (
          <AgendaCard key={day.date ?? index} day={day} />
        ))}
      </div>
    </section>
  );
}
