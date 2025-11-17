// src/Page/Staff_EventDetail.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import StaffHeader, { HeaderSpacer } from "../components/Staff_Header";
import Footer from "../components/Footer";
import { THEME, FLAGS } from "../theme";
import StaffConfirmPopup from "../components/Staff_ConfirmPopup";
import { navigateAndJump } from "../lib/jump"; // ✅ ใช้ jump util
import { uploadParticipantsList } from "../services/participantService";
import { deleteEvent } from "../services/eventService"; // 👈 เพิ่มบรรทัดนี้

// --- helpers -------------------------------------------------
function combineEventSources(data, eventId) {
  if (!data) return null;
  const targetId = eventId?.toString();
  if (!targetId) return null;
  const pool = [...(data.events ?? []), ...(data.favoriteEvents ?? [])];
  return pool.find((item) => item && item.id != null && item.id.toString() === targetId) ?? null;
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    return date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}
function formatTime(iso) {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// --- อัปโหลด: ค่าคงที่ + helpers ---------------------------
// จำกัดขนาดไฟล์สูงสุด (ปรับได้ตามต้องการ)
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0, n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

// ระบบ backend อ่านไฟล์ CSV จริง ๆ แม้จะอนุญาต .xlsx ในการตรวจสอบ
const isCsvFile = (file) => {
  if (!file) return false;
  const lower = (file.name || "").toLowerCase();
  return lower.endsWith(".csv") || file.type === "text/csv";
};

// Unified pill row (label + read-only value)
function PillRow({ label, children }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
      <span className="inline-flex min-w-[120px] justify-center rounded-full border border-gray-800 px-4 py-1.5 text-xs font-medium text-gray-900">
        {label}
      </span>
      <div className="inline-flex flex-1 items-center px-1.5 text-xs md:text-sm text-gray-800">{children || "-"}</div>
    </div>
  );
}

// --- main page -------------------------------------------------
export default function StaffEventDetailPage({ navigate, auth, data, eventId, requireLogin }) {
  const event = useMemo(() => combineEventSources(data, eventId), [data, eventId]);

  const [error, setError] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ✅ สเตต/รีเฟอเรนซ์สำหรับการอัปโหลด
  const [uploading, setUploading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState(null); // { name, size, serverRef? }
  const fileInputRef = useRef(null);

  useEffect(() => { setError(null); }, [event?.id]);

  const onBack = () => {
    if (window.history.length > 1) window.history.back();
    else navigate("/staff/myActivities");
  };

  const handleAddActivityJump = () => {
    // ✅ แนบ hash และรอ DOM แล้วค่อยเลื่อน (ชดเชย header)
    navigateAndJump(navigate, "/staff", "staff-add-event", {
      offsetPx: FLAGS?.HEADER_HEIGHT_PX || 0,
      highlightMs: 900,
    });
  };

  // ✅ จัดการล้างไฟล์ที่เลือก
  const handleClearUpload = () => {
    setUploadInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ✅ อัปโหลดไฟล์: ตรวจชนิด + ขนาด + เชื่อม API จริง
  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isCsvFile(file)) {
      setError("ระบบรองรับเฉพาะไฟล์ .csv (Comma Separated Values) เท่านั้น");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`ขนาดไฟล์เกินกำหนด (สูงสุด ${formatBytes(MAX_UPLOAD_BYTES)}). ไฟล์ที่เลือกมีขนาด ${formatBytes(file.size)}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const response = await uploadParticipantsList(event.id, file);
      const addedCount =
        typeof response?.count === "number"
          ? response.count
          : response?.participants?.length ?? 0;
      setUploadInfo({
        name: file.name,
        size: file.size,
        count: addedCount,
      });
      
      setError(null);
      alert(`✅ อัปโหลดสำเร็จ! เพิ่มผู้เข้าร่วม ${addedCount} คน`);
    } catch (err) {
      console.error(err);
      setError(err.message || "อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setUploading(false);
      // ล้างค่าเพื่อให้เลือกไฟล์เดิมซ้ำได้
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!event) {
    return (
      <div style={{ background: THEME.page, color: THEME.text, minHeight: "100vh" }}>
        <StaffHeader
          auth={auth}
          navigate={navigate}
          notifications={data?.notifications ?? []}
          onSearch={() => navigate("/staff/myActivities")}
          onActivities={() => navigate("/staff/myActivities")}
          onAddActivityJump={handleAddActivityJump}
          onRequireLogin={requireLogin}
        />
        <HeaderSpacer />
        <main className="pb-20">
          <div className="mx-auto w-full max-w-7/10 px-4 md:px-6">
            <button type="button" onClick={onBack} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#e84c3d] transition hover:text-[#c03428]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m15 6-6 6 6 6" /></svg>
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

  const start = event.startTime ?? event.date;
  const dateLabel = formatDate(start);
  const timeLabel = formatTime(start);
  const capacityLabel = event.maxCapacity ? `${event.maxCapacity} ท่าน` : null;
  const contactLabel = event.contactInfo || event.contact || event.phone || event.email || null;
  const website = event.website || event.registerLink || null;

  const readerHref = `/staff/events/${encodeURIComponent(event.id)}/reader`;
  const editHref = `/staff/events/${encodeURIComponent(event.id)}/edit`;

  const handleConfirmDelete = async () => {
    setDeleteOpen(false); // ปิด popup ก่อน เพื่อให้ UI ตอบสนองทันที
    try {
      // 1. เรียก API เพื่อลบกิจกรรมโดยใช้ ID จาก event object
      await deleteEvent(event.id); 
      console.log("Event deleted successfully, id =", event.id);
      
      // 2. ล้างค่า error หากการลบสำเร็จ
      setError(null); 
      
      // 3. นำทางผู้ใช้กลับไปหน้ารายการกิจกรรมของ staff
      //    (ใช้ /staff/myActivities ตาม logic ของปุ่ม "กลับ" และ "Activities" ใน Header)
      navigate("/staff/myActivities"); 

    } catch (err) {
      // 4. หากเกิดข้อผิดพลาด
      console.error("Failed to delete event:", err);
      //    แสดงข้อความ error ให้ผู้ใช้เห็น
      setError(err.message || "ลบกิจกรรมไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const rows = [
    ["ประเภท", event.category || event.activityType || event.type || "-"],
    ["วันเริ่มกิจกรรม", <>{dateLabel || "-"}</>],
    ["เวลาที่เริ่ม", <>{timeLabel ? `${timeLabel} น.` : "-"}</>],
    ["จำนวนที่รับ", capacityLabel || "ไม่จำกัดจำนวน"],
    ["สถานที่จัด", event.location || "-"],
    ["ติดต่อสอบถาม", contactLabel || "-"],
  ];

  return (
    <div style={{ background: THEME.page, color: THEME.text, minHeight: "100vh" }}>
      <StaffHeader
        auth={auth}
        navigate={navigate}
        notifications={data?.notifications ?? []}
        onSearch={() => navigate("/staff/myActivities")}
        onActivities={() => navigate("/staff/myActivities")}
        onAddActivityJump={handleAddActivityJump}
        onRequireLogin={requireLogin}
      />
      <HeaderSpacer />

      <main className="pb-20">
        <div className="mx-auto flex w-full max-w-7/10 flex-col gap-6 px-4 md:px-6">
          {/* ปุ่มกลับ */}
          <button type="button" onClick={onBack} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#e84c3d] transition hover:text-[#c03428]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m15 6-6 6 6 6" /></svg>
            กลับ
          </button>

          {/* การ์ดหลัก */}
          <article className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
            <div className="grid gap-6 px-6 py-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1.3fr)] md:px-10 md:py-10">
              {/* ซ้าย: รูปกิจกรรม */}
              <div className="space-y-4">
                <div className="rounded-2xl bg-gray-100 overflow-hidden aspect-[5/3] flex items-center justify-center">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="text-center text-gray-500 text-sm">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-gray-400">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="4" width="18" height="14" rx="2" />
                          <path d="M7 13l3-3 3 4 2-2 3 4" />
                          <circle cx="9" cy="8" r="1" />
                        </svg>
                      </div>
                      <p>ภาพโปรโมตกิจกรรม</p>
                      <p className="text-xs mt-1 text-gray-400">อัตราส่วน 5:3</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ขวา: ข้อมูลสรุป */}
              <div className="flex flex-col gap-5 bg-white px-2 md:px-5 py-3 md:py-5">
                <h1 className="text-xl md:text-2xl font-semibold leading-snug text-gray-900">{event.title}</h1>
                <div className="mt-1 flex flex-col gap-3 text-xs md:text-sm">
                  {rows.map(([label, value]) => (
                    <PillRow key={label} label={label}>{value}</PillRow>
                  ))}
                </div>
              </div>
            </div>

            {/* เส้นคั่น + ส่วนล่าง */}
            <div className="border-t border-black/10 px-6 py-8 md:px-10 md:py-10 space-y-8">
              {/* รายละเอียดเพิ่มเติม */}
              <section className="space-y-3">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">รายละเอียดเพิ่มเติม</h2>
                <p className="whitespace-pre-line text-sm leading-7 text-gray-700">
                  {event.description?.trim() || "ยังไม่มีรายละเอียดกิจกรรม"}
                </p>
              </section>

              {/* ช่องทางการสมัคร */}
              <section className="space-y-3">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">ช่องทางการสมัคร</h2>
                {website ? (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center justify-between rounded-2xl border border-black/10 bg-black/5 px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-black/20 hover:bg:black/10"
                  >
                    <span className="truncate">{website}</span>
                    <svg viewBox="0 0 24 24" className="ml-3 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="m9 5 6 6-6 6" />
                    </svg>
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">ยังไม่มีข้อมูลช่องทางการสมัคร</p>
                )}
              </section>

              {/* แถวปุ่มล่าง: ซ้าย=อัปโหลดไฟล์, ขว=ปุ่มเดิม */}
              <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* ซ้าย: ปุ่มอัปโหลดไฟล์ */}
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="upload-spreadsheet"
                    className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-100 ${
                      uploading ? "opacity-60 pointer-events-none" : ""
                    }`}
                    title={`อัปโหลดไฟล์ CSV (สูงสุด ${formatBytes(MAX_UPLOAD_BYTES)})`}
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 16V4" />
                        <path d="M8 8l4-4 4 4" />
                        <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
                      </svg>
                    </span>
                    {uploading ? "กำลังอัปโหลด..." : "อัปโหลดไฟล์รายชื่อผู้เข้าร่วม (.csv)"}
                  </label>

                  <input
                    ref={fileInputRef}
                    id="upload-spreadsheet"
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleUploadFile}
                  />

                  {/* ชื่อไฟล์ + ปุ่มลบตัวอักษรสีแดง */}
                  {uploadInfo?.name && (
                    <span className="text-xs text-gray-700 flex items-center gap-2">
                      <span
                        className="truncate max-w-[240px]"
                        title={`${uploadInfo.name} • ${formatBytes(uploadInfo.size)}`}
                      >
                        เลือกไฟล์: {uploadInfo.name}
                        <span className="text-gray-400"> ({formatBytes(uploadInfo.size)})</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleClearUpload}
                        className="text-xs font-medium text-red-600 hover:text-red-700 underline underline-offset-2"
                        title="ลบไฟล์ที่เลือก"
                      >
                        ลบ
                      </button>
                    </span>
                  )}
                </div>

                {/* ขวา: ปุ่มเดิม */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <a
                    href={readerHref}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm border border-black/10 hover:bg-gray-100 transition"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z" />
                      </svg>
                    </span>
                    มุมมองผู้อ่าน
                  </a>

                  <a
                    href={editHref}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm border border-black/10 hover:bg-gray-100 transition"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M4 20h4L20 8l-4-4L4 16v4z" />
                      </svg>
                    </span>
                    แก้ไขกิจกรรม
                  </a>

                  <button
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e84c3d] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#d63a2b] transition"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 6h18" />
                        <path d="M8 6v14h8V6" />
                        <path d="M10 10v6M14 10v6" />
                        <path d="M5 6l1-2h12l1 2" />
                      </svg>
                    </span>
                    ลบกิจกรรม
                  </button>
                </div>
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

      {/* popup ยืนยันลบ */}
      <StaffConfirmPopup
        open={deleteOpen}
        title="คุณแน่ใจหรือไม่ที่จะลบกิจกรรมนี้"
        message="หากยืนยัน กิจกรรมและข้อมูลที่เกี่ยวข้องจะถูกลบออกจากระบบ และไม่สามารถกู้คืนได้"
        confirmLabel="ยืนยัน"
        cancelLabel="ยกเลิก"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
