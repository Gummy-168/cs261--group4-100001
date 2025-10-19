import { useMemo } from "react";

export default function EventCard({ e, loggedIn, onToggle, onRequireLogin, onOpen }) {
  const href = `/events/${e.id}`;
  const liked = Boolean(loggedIn && e.liked);

  const formattedDate = useMemo(() => {
    if (!e.date) return "";
    try {
      return new Date(e.date).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (_) {
      return "";
    }
  }, [e.date]);

  const onHeart = (event) => {
    event.stopPropagation();
    if (!loggedIn) {
      onRequireLogin?.();
      return;
    }
    onToggle?.(e.id, !liked);
  };

  const onNavigate = () => {
    if (onOpen) {
      onOpen(e);
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      onClick={onNavigate}
      className="group flex h-full cursor-pointer flex-col gap-5 rounded-[24px] border border-black/5 bg-white p-5 shadow-[0_16px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_26px_38px_rgba(15,23,42,0.12)]"
    >
      <div className="relative overflow-hidden rounded-[20px] bg-gray-100">
        <div className="aspect-[4/3] w-full">
          {e.coverUrl ? (
            <img src={e.coverUrl} alt={e.title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11H3z" />
                <path d="M3 19h18M9 13l2.5-3 2.5 3l1.5-2l3.5 5" />
              </svg>
              <span className="text-sm font-medium">ภาพไฮไลท์กิจกรรม</span>
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label={liked ? "เลิกบันทึกกิจกรรม" : "บันทึกกิจกรรม"}
          className={`absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/95 text-red-500 transition hover:bg-white ${
            liked ? "border-red-200 text-red-600" : "border-black/10 text-gray-500"
          }`}
          onClick={onHeart}
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
            <path d="M12 21s-7-4.35-9.5-7.5C.5 10 2.5 6 6 6c2 0 3.5 1 4.5 2 1-1 2.5-2 4.5-2 3.5 0 5.5 4 3.5 7.5S12 21 12 21z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="text-lg font-semibold leading-tight text-gray-900 line-clamp-2">{e.title}</h3>
        {e.host ? <p className="mt-2 text-sm font-medium text-gray-600">{e.host}</p> : null}
        {formattedDate ? <p className="mt-1 text-sm text-gray-500">{formattedDate}</p> : null}
        {e.location ? <p className="mt-1 text-sm text-gray-500">สถานที่: {e.location}</p> : null}

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#e84c3d]">
            ดูรายละเอียด
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="m10 6 6 6-6 6" />
            </svg>
          </span>
          <span className="text-xs uppercase tracking-[0.4em] text-gray-300">
            EVENT
          </span>
        </div>
      </div>
    </article>
  );
}
