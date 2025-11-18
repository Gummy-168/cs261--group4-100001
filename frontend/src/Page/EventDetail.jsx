import { useEffect, useMemo, useState } from "react";
import Header, { HeaderSpacer } from "../components/Header";
import Footer from "../components/Footer";
import { THEME } from "../theme";
import { updateFavoriteEvent } from "../lib/api";
import EventReviews from "../components/EventReviews";
// import EventComment from "../components/EventComment";
import { getEventById } from "../services/eventService";

function combineEventSources(data, eventId) {
  if (!data) return null;
  const targetId = eventId?.toString();
  if (!targetId) return null;

  const pool = [
    ...(data.events ?? []),
    ...(data.favoriteEvents ?? []),
  ];
  return pool.find((item) => item && item.id !== undefined && item.id !== null && item.id.toString() === targetId) ?? null;
}

function formatDateTime(iso, options = {}) {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    return date.toLocaleString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    });
  } catch {
    return "";
  }
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function EventMetaChip({ label }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-gray-700">
      {label}
    </span>
  );
}

export default function EventDetailPage({ navigate, auth, data, eventId, requireLogin }) {
  const event = useMemo(() => combineEventSources(data, eventId), [data, eventId]);
  const [liked, setLiked] = useState(Boolean(event?.liked));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLiked(Boolean(event?.liked));
    setError(null);
  }, [event?.id, event?.liked]);

  useEffect(() => {
    if (!eventId) return;
    // เรียก backend ให้บันทึก viewCount (+1) ทุกครั้งที่เปิดหน้า
    getEventById(eventId).catch((err) => {
      console.error("Failed to record event view count:", err);
    });
  }, [eventId]);

  const onBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/activities");
    }
  };

  const onToggleFavorite = async () => {
    if (!event) return;

    if (!auth?.loggedIn) {
      requireLogin?.();
      return;
    }

    const userId = auth?.userId || auth?.profile?.id;
    if (!userId) {
      requireLogin?.();
      return;
    }

    const next = !liked;
    setLiked(next);
    setSaving(true);
    const result = await updateFavoriteEvent(event.id, next, auth?.token, userId);
    if (!result.ok) {
      setLiked(!next);
      setError("ไม่สามารถบันทึกรายการโปรดได้ กรุณาลองใหม่อีกครั้ง");
    } else {
      setError(null);
    }
    setSaving(false);
  };

  return (
    <div style={{ background: THEME.page, color: THEME.text, minHeight: "100vh" }}>
      <Header
        auth={auth}
        navigate={navigate}
        onCalendarJump={() => navigate("/")}
        onActivities={() => navigate("/activities")}
        onRequireLogin={requireLogin}
      />
      <HeaderSpacer />

      <main className="pb-20">
        <div className="mx-auto flex w-full max-w-7/10 flex-col gap-6 px-4 md:px-6">
          <button
            type="button"
            onClick={onBack}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#e84c3d] transition hover:text-[#c03428]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m15 6-6 6 6 6" />
            </svg>
            กลับ
          </button>

          {event ? (
            <article className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm ">
              <div className="relative bg-black/5">
                <div className="aspect-[4/2.5] w-full">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-gray-400">
                      <svg viewBox="0 0 24 24" className="h-14 w-14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11H3z" />
                        <path d="M3 19h18M9 13l2.5-3 2.5 3 1.5-2 3.5 5" />
                      </svg>
                      <span className="text-sm font-medium">ยังไม่มีภาพกิจกรรม</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onToggleFavorite}
                  disabled={saving}
                  className={`absolute right-6 top-6 inline-flex h-12 w-12 items-center justify-center rounded-full border bg-white/95 text-red-500 shadow-sm transition hover:bg-white ${
                    liked ? "border-red-200 text-red-600" : "border-black/10 text-gray-500"
                  } disabled:cursor-not-allowed disabled:opacity-80`}
                  aria-label={liked ? "นำออกจากกิจกรรมที่ถูกใจ" : "เพิ่มในกิจกรรมที่ถูกใจ"}
                >
                  <svg viewBox="0 0 24 24" className="h-[20px] w-[20px]" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 21s-7-4.35-9.5-7.5C.5 10 2.5 6 6 6c2 0 3.5 1 4.5 2 1-1 2.5-2 4.5-2 3.5 0 5.5 4 3.5 7.5S12 21 12 21z" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-8 px-6 py-8 md:px-10 md:py-12">
                <header className="flex flex-col gap-3">
                  <span className="text-sm font-medium text-gray-500">
                    {event.category || "กิจกรรม"} • โพสต์เมื่อ {formatDate(event.startTime)}
                  </span>
                  <h1 className="text-3xl font-semibold leading-tight text-gray-900">{event.title}</h1>
                  {event.host ? (
                    <p className="text-sm font-medium text-gray-600">
                      จัดโดย {event.host}
                    </p>
                  ) : null}
                </header>

                <section className="flex flex-wrap items-center gap-3">
                  <EventMetaChip label={event.type} />
                  <EventMetaChip label={event.unit} />
                  <EventMetaChip label={formatDateTime(event.startTime)} />
                  {event.location ? (
                    <EventMetaChip label={event.location} />
                  ) : null}
                  {event.maxCapacity ? (
                    <EventMetaChip label={`จำนวนรับ ${event.maxCapacity} คน`} />
                  ) : null}
                  {event.fee ? <EventMetaChip label={`ค่าลงทะเบียน ${event.fee}`} /> : null}
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-semibold text-gray-900">รายละเอียดเพิ่มเติม</h2>
                  <p className="whitespace-pre-line text-sm leading-7 text-gray-700">
                    {event.description?.trim() || "ยังไม่มีรายละเอียดกิจกรรม"}
                  </p>
                </section>

                {event.website ? (
                  <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900">ช่องทางการสมัคร</h2>
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center justify-between rounded-2xl border border-black/10 bg-black/5 px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-black/20 hover:bg-black/8"
                    >
                      <span className="truncate">{event.website}</span>
                      <svg viewBox="0 0 24 24" className="ml-3 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="m9 5 6 6-6 6" />
                      </svg>
                    </a>
                  </section>
                ) : null}

                <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-gray-500">
                    สนใจเข้าร่วมกิจกรรมหรือไม่? กดถูกใจไว้เพื่อรับการแจ้งเตือนก่อนเริ่มกิจกรรม
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full bg-[#e84c3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c03428]"
                    onClick={() => {
                      if (event.website) {
                        window.open(event.website, "_blank", "noopener,noreferrer");
                      } else {
                        requireLogin?.();
                      }
                    }}
                  >
                    สมัครเข้าร่วมกิจกรรม "ปรับปรุง" 
                  </button>
                </section>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}
                {/* <EventComment onSubmit={(data) => console.log(data)} /> */}
                {event && <EventReviews eventId={event.id} auth={auth} />}
              </div>
            </article>
          ) : (
            <div className="mt-10 rounded-[24px] border border-black/10 bg-white px-6 py-12 text-center text-sm text-gray-600">
              ไม่พบบันทึกกิจกรรมนี้ หรืออาจถูกลบออกแล้ว
            </div>
          )}
        </div>



      </main>

      <Footer />
    </div>
  );
}
