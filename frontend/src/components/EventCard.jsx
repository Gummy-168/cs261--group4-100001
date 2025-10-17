import { FLAGS } from "../theme";
import { useState } from "react";

export default function EventCard({ e, loggedIn, onToggle }) {
  const href = `/events/${e.id}`;
  const [vanish, setVanish] = useState(false);

  const onHeart = (ev) => {
    ev.stopPropagation();
    if (!loggedIn) { window.location.href = "/login"; return; }
    if (e.liked && onToggle) {
      setVanish(true);
      setTimeout(() => onToggle(e.id, false), 180);
    } else {
      onToggle?.(e.id, !e.liked);
    }
  };
  const isFilled = loggedIn && e.liked;

  return (
    <article
      onClick={() => window.open(href, "_blank")}
      className="rounded-2xl border border-black/10 shadow-sm hover:shadow-md transition cursor-pointer bg-white"
      style={vanish ? { transition:"all .18s ease", opacity:0, transform:"translateY(-8px)", height:0, margin:0, overflow:"hidden" } : {}}
    >
      <div className={`relative ${FLAGS.CARD_ASPECT} overflow-hidden rounded-t-2xl bg-neutral-800`}>
        {/* <img src={e.coverUrl} alt={e.title} className="w-full h-full object-cover" /> */}
        <button onClick={onHeart} className="absolute right-3 top-3 rounded-full p-2 bg-white/90 hover:bg-white shadow" aria-label="favorite">
          <svg viewBox="0 0 24 24" className={`w-5 h-5 ${isFilled ? "fill-red-500" : "fill-none"}`} stroke="currentColor" strokeWidth="1.5">
            <path d="M12 21s-7-4.35-9.5-7.5C.5 10 2.5 6 6 6c2 0 3.5 1 4.5 2 1-1 2.5-2 4.5-2 3.5 0 5.5 4 3.5 7.5S12 21 12 21z" />
          </svg>
        </button>
      </div>
      <div className="p-4 text-sm">
        <h3 className="font-semibold line-clamp-2 min-h-[2.4em]">{e.title}</h3>
        {e.host && <p className="text-gray-600 mt-1">{e.host}</p>}
        {e.date && <p className="text-gray-500 mt-1 text-xs">{new Date(e.date).toLocaleDateString()}</p>}
      </div>
    </article>
  );
}
