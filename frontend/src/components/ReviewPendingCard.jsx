import { useMemo } from "react";

/**
 * Special card for events that have ended and need user review
 * Shows "ให้คะแนนกิจกรรม" badge overlay
 */
export default function ReviewPendingCard({ e, loggedIn, onOpen }) {
  const hasEnded = useMemo(() => {
    if (!e.endTime) return false;
    try {
      return new Date(e.endTime).getTime() < Date.now();
    } catch {
      return false;
    }
  }, [e.endTime]);

  const formattedDate = useMemo(() => {
    if (!e.date) return "";
    try {
      return new Date(e.date).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }, [e.date]);

  const onNavigate = () => {
    if (!e?.id) return;
    if (onOpen) {
      onOpen(e);
      return;
    }
    const href = `/events/${e.id}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  if (!hasEnded) return null;

  return (
    <article
      onClick={onNavigate}
      className="group relative flex h-full cursor-pointer flex-col gap-5 rounded-[24px] border border-black/5 bg-white p-5 shadow-[0_16px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_26px_38px_rgba(15,23,42,0.12)]"
    >
      {/* Review Pending Badge Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-[24px] backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f4b400] px-5 py-2.5 shadow-lg">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .587l3.668 7.431 8.198 1.182-5.938 5.797 1.404 8.186L12 18.896l-7.332 3.861 1.404-8.186-5.938-5.797 8.198-1.182z" />
            </svg>
            <span className="text-sm font-bold text-white">
              ให้คะแนนกิจกรรม
            </span>
          </div>
          <p className="text-xs font-medium text-white/90">
            คุณเข้าร่วมกิจกรรมนี้แล้ว
            <br />
            กิจกรรมรอการรีวิวจากคุณอยู่
          </p>
        </div>
      </div>

      {/* Original Card Content (dimmed) */}
      <div className="relative overflow-hidden rounded-[20px] bg-gray-100">
        <div className="aspect-[4/3] w-full">
          {e.coverUrl ? (
            <img
              src={e.coverUrl}
              alt={e.title}
              className="h-full w-full object-cover opacity-60"
              loading="lazy"
            />
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
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="text-lg font-semibold leading-tight text-gray-900 line-clamp-2">
          {e.title}
        </h3>
        {e.host ? (
          <p className="mt-2 text-sm font-medium text-gray-600">{e.host}</p>
        ) : null}
        {formattedDate ? (
          <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
        ) : null}
        {e.location ? (
          <p className="mt-1 text-sm text-gray-500">สถานที่: {e.location}</p>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#f4b400]">
            รีวิวเลย
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="m10 6 6 6-6 6" />
            </svg>
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            รอรีวิว
          </span>
        </div>
      </div>
    </article>
  );
}