// src/Page/Staff_EventDetail.jsx
import { useEffect, useMemo, useState } from "react";
import StaffHeader, { HeaderSpacer } from "../components/Staff_Header";
import Footer from "../components/Footer";
import { THEME } from "../theme";

// รวม event จากหลาย source (events, favoriteEvents ฯลฯ)
function combineEventSources(data, eventId) {
  if (!data) return null;
  const targetId = eventId?.toString();
  if (!targetId) return null;

  const pool = [
    ...(data.events ?? []),
    ...(data.favoriteEvents ?? []),
  ];

  return (
    pool.find(
      (item) =>
        item &&
        item.id !== undefined &&
        item.id !== null &&
        item.id.toString() === targetId
    ) ?? null
  );
}

// แถว meta แบบใน Figma: pill ด้านซ้าย + ข้อความด้านขวา
function EventMetaRow({ label, value }) {
  if (!label && !value) return null;
  return (
    <div className="flex items-center gap-4 text-sm leading-relaxed">
      {label && (
        <span className="inline-flex w-[150px] justify-center rounded-full border border-gray-800 px-4 py-1 text-xs font-medium text-center">
          {label}
        </span>
      )}
      <span className="text-sm text-gray-800 break-words">
        {value || "-"}
      </span>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function formatTime(iso) {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function StaffEventDetailPage({
  navigate,
  auth,
  data,
  eventId,
  requireLogin,
}) {
  const event = useMemo(
    () => combineEventSources(data, eventId),
    [data, eventId]
  );

  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
  }, [event?.id]);

  const onBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/staff/myActivities");
    }
  };

  if (!event) {
    return (
      <div
        style={{
          background: THEME.page,
          color: THEME.text,
          minHeight: "100vh",
        }}
      >
        <StaffHeader
          auth={auth}
          navigate={navigate}
          notifications={data?.notifications ?? []}
          onSearch={() => navigate("/staff/myActivities")}
          onActivities={() => navigate("/staff/myActivities")}
          onRequireLogin={requireLogin}
        />
        <HeaderSpacer />
        <main className="pb-20">
          <div className="mx-auto w-full max-w-7/10 px-4 md:px-6">
            <button
              type="button"
              onClick={onBack}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#e84c3d] transition hover:text-[#c03428]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m15 6-6 6 6 6" />
              </svg>
              กลับ
            </button>

            <div className="mt-8 rounded-[24px] border border-black/10 bg-white px-6 py-12 text-center text-sm text-gray-600 shadow-sm">
              ไม่พบข้อมูลกิจกรรมนี้ หรืออาจถูกลบออกแล้ว
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const dateLabel = formatDate(event.startTime ?? event.date);
  const timeLabel = formatTime(event.startTime ?? event.date);
  const capacityLabel = event.maxCapacity
    ? `${event.maxCapacity} ท่าน`
    : null;
  const contactLabel =
    event.contactInfo || event.contact || event.phone || event.email || null;

  const website = event.website || event.registerLink || null;

  const handleReaderView = () => {
    // มุมมองผู้อ่านฝั่ง user ปกติ จะเปิดหน้า /events/:id
    const href = `/events/${encodeURIComponent(event.id)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const handleEdit = () => {
    // ไว้ทีหลังค่อยทำหน้าแก้ไขจริง ๆ
    navigate(`/staff/events/${encodeURIComponent(event.id)}/edit`);
  };

  const handleDelete = () => {
    const ok = window.confirm(
      "คุณต้องการลบกิจกรรมนี้ใช่หรือไม่? การลบจะไม่สามารถย้อนกลับได้"
    );
    if (!ok) return;

    // TODO: เรียก API ลบกิจกรรมจริง ๆ
    console.log("TODO: delete event id =", event.id);
    setError("ฟังก์ชันลบกิจกรรมยังไม่ถูกเชื่อมต่อกับระบบจริง");
  };

  return (
    <div
      style={{
        background: THEME.page,
        color: THEME.text,
        minHeight: "100vh",
      }}
    >
      <StaffHeader
        auth={auth}
        navigate={navigate}
        notifications={data?.notifications ?? []}
        onSearch={() => navigate("/staff/myActivities")}
        onActivities={() => navigate("/staff/myActivities")}
        onRequireLogin={requireLogin}
      />
      <HeaderSpacer />

      <main className="pb-20">
        <div className="mx-auto flex w-full max-w-7/10 flex-col gap-6 px-4 md:px-6">
          {/* ปุ่มกลับ */}
          <button
            type="button"
            onClick={onBack}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#e84c3d] transition hover:text-[#c03428]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="m15 6-6 6 6 6" />
            </svg>
            กลับ
          </button>

          {/* การ์ดหลัก */}
          <article className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
            <div className="grid gap-6 px-6 py-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)] md:px-10 md:py-10">
              {/* รูปภาพซ้าย */}
              <div className="flex flex-col">
                <div className="rounded-[24px] bg-gray-100 overflow-hidden">
                  <div className="aspect-[5/3] w-full flex items-center justify-center">
                    {event.coverUrl ? (
                      <img
                        src={event.coverUrl}
                        alt={event.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-gray-500 text-sm">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-gray-400">
                          <svg
                            viewBox="0 0 24 24"
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <rect x="3" y="4" width="18" height="14" rx="2" />
                            <path d="M7 13l3-3 3 4 2-2 3 4" />
                            <circle cx="9" cy="8" r="1" />
                          </svg>
                        </div>
                        <p>ภาพกิจกรรม</p>
                        <p className="text-xs mt-1 text-gray-400">
                          ขนาดแนะนำ 5 : 3
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ข้อมูลขวา */}
              <div className="flex flex-col gap-4">
                <h1 className="text-xl md:text-2xl font-semibold leading-snug text-gray-900">
                  {event.title}
                </h1>

                {/* แถวข้อมูลแบบ pill ตาม figma */}
                <div className="mt-2 flex flex-col gap-2">
                  <EventMetaRow
                    label="ประเภท"
                    value={
                      event.category ||
                      event.activityType ||
                      event.type ||
                      "-"
                    }
                  />
                  <EventMetaRow
                    label="วันเวลากิจกรรม"
                    value={
                      dateLabel
                        ? timeLabel
                          ? `${dateLabel}   ${timeLabel} น.`
                          : dateLabel
                        : "-"
                    }
                  />
                  <EventMetaRow
                    label="จำนวนที่รับ"
                    value={capacityLabel || "-"}
                  />
                  <EventMetaRow
                    label="สถานที่จัด"
                    value={event.location || "-"}
                  />
                  <EventMetaRow
                    label="ติดต่อสอบถาม"
                    value={contactLabel || "-"}
                  />
                </div>
              </div>
            </div>

            {/* เส้นคั่น + ส่วนล่าง */}
            <div className="border-t border-black/10 px-6 py-8 md:px-10 md:py-10 space-y-8">
              {/* รายละเอียดเพิ่มเติม */}
              <section className="space-y-3">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                  รายละเอียดเพิ่มเติม
                </h2>
                <p className="whitespace-pre-line text-sm leading-7 text-gray-700">
                  {event.description?.trim() || "ยังไม่มีรายละเอียดกิจกรรม"}
                </p>
              </section>

              {/* ช่องทางการสมัคร */}
              <section className="space-y-3">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                  ช่องทางการสมัคร
                </h2>
                {website ? (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center justify-between rounded-2xl border border-black/10 bg-black/5 px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-black/20 hover:bg-black/10"
                  >
                    <span className="truncate">{website}</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="ml-3 h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="m9 5 6 6-6 6" />
                    </svg>
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">
                    ยังไม่มีข้อมูลช่องทางการสมัคร
                  </p>
                )}
              </section>

              {/* ปุ่มล่าง 3 ปุ่ม */}
              <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                <button
                  type="button"
                  onClick={handleReaderView}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm border border-black/10 hover:bg-gray-100 transition"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z" />
                    </svg>
                  </span>
                  มุมมองผู้อ่าน
                </button>

                <button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm border border-black/10 hover:bg-gray-100 transition"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M4 20h4L20 8l-4-4L4 16v4z" />
                    </svg>
                  </span>
                  แก้ไขกิจกรรม
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e84c3d] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#d63a2b] transition"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6v14h8V6" />
                      <path d="M10 10v6M14 10v6" />
                      <path d="M5 6l1-2h12l1 2" />
                    </svg>
                  </span>
                  ลบกิจกรรม
                </button>
              </section>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
