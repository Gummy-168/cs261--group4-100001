import { THEME } from "../theme";
import { useEffect, useState } from "react";

function useAgendaCols() {
  const get = () =>
    window.matchMedia("(min-width:1024px)").matches ? 3 :
    window.matchMedia("(min-width:768px)").matches  ? 2 : 1;
  const [cols, setCols] = useState(get);
  useEffect(() => {
    const on = () => setCols(get());
    addEventListener("resize", on);
    return () => removeEventListener("resize", on);
  }, []);
  return cols;
}

function AgendaCard({ day, index, cols }) {
  const firstId = day.items?.[0]?.id;
  const onOpen = () => { if (firstId) window.open(`/events/${firstId}`, "_blank"); };
  const row = Math.floor(index / cols);
  const col = index % cols;
  const isYellow = (row + col) % 2 === 0;
  const bg = isYellow ? THEME.agendaVariant.yellow : THEME.agendaVariant.white;

  return (
    <div
      className="rounded-2xl border border-black/10 p-4 cursor-pointer hover:shadow-sm transition"
      style={{ background: bg, minHeight: 132 }}
      onClick={onOpen}
    >
      <div className="mb-2 text-sm text-gray-600">
        {new Date(day.date).toLocaleDateString(undefined, { day: "numeric", month: "long" })}
      </div>
      <ul className="space-y-2">
        {(day.items ?? []).map(it => (<li key={it.id} className="text-sm">• {it.title}</li>))}
      </ul>
    </div>
  );
}

export default function AgendaGrid({ days = [], forwardRef }) {
  const cols = useAgendaCols();
  return (
    <section ref={forwardRef} className="mx-auto max-w-6xl mt-10">
      <h3 className="text-sm text-gray-700 px-1">ช่วงนี้มีกิจกรรมอะไรบ้าง ?</h3>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map((d, i) => (<AgendaCard key={i} day={d} index={i} cols={cols} />))}
      </div>
    </section>
  );
}
