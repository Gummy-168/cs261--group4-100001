// src/Page/Staff_EditEvent.jsx (refactored + jump)
import React, { useMemo, useState } from "react";
import StaffHeader, { HeaderSpacer } from "../components/Staff_Header";
import Footer from "../components/Footer";
import { THEME, FLAGS } from "../theme";
import StaffConfirmPopup from "../components/Staff_ConfirmPopup";
import { navigateAndJump } from "../lib/jump"; // ✅ ใช้ jump util
import { updateEvent } from "../services/eventService"; // ✅ เพิ่ม import

// --- helpers -------------------------------------------------

function combineEventSources(data, eventId) {
  if (!data) return null;
  const targetId = eventId?.toString();
  if (!targetId) return null;
  const pool = [...(data.events ?? []), ...(data.favoriteEvents ?? [])];
  return (
    pool.find((item) => item && item.id != null && item.id.toString() === targetId) ?? null
  );
}

// Unified pill row (label + field)
function PillRow({ label, children }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
      <span className="inline-flex min-w-[120px] justify-center rounded-full border border-gray-800 px-4 py-1.5 text-xs font-medium text-gray-900">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 items-center rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs md:text-sm text-gray-800">
        {children}
      </div>
    </div>
  );
}

// Image uploader (keeps exact UI/behavior)
function ImageUploader({ preview, onPick, onRemove, alt }) {
  return (
    <div className="relative group rounded-2xl bg-gray-100 overflow-hidden aspect-[5/3] flex items-center justify-center">
      {preview ? (
        <img src={preview} alt={alt} className="h-full w-full object-cover" />
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

      <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <label className="cursor-pointer">
          <span className="inline-flex items-center gap-2 bg-white text-[#e84c3d] px-4 py-2 rounded-full font-semibold text-sm shadow-md hover:bg-[#e84c3d] hover:text-white transition">
            แก้ไขรูปภาพ
          </span>
          <input type="file" accept="image/*" onChange={onPick} className="hidden" />
        </label>
        {preview && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center justify-center bg-white text-gray-700 hover:text-white hover:bg-red-600 rounded-full p-2 shadow-md transition"
            title="ลบรูปภาพ"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" />
              <path d="M8 6v14h8V6" />
              <path d="M10 10v6M14 10v6" />
              <path d="M5 6l1-2h12l1 2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function buildStartISO(startISO, dateStr, timeStr) {
  if (!dateStr && !timeStr) return startISO || null;
  const t = timeStr || "00:00";
  return new Date(`${dateStr}T${t}:00`).toISOString();
}

// --- main page -------------------------------------------------

export default function StaffEditEventPage({ navigate, auth, data, eventId, requireLogin }) {
  const event = useMemo(() => combineEventSources(data, eventId), [data, eventId]);

  const [confirmType, setConfirmType] = useState(null); // "save" | "cancel" | null

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

  if (!event) {
    return (
      <div style={{ background: THEME.page, color: THEME.text, minHeight: "100vh" }}>
        <StaffHeader
          auth={auth}
          navigate={navigate}
          notifications={data?.notifications || []}
          onAddActivityJump={handleAddActivityJump}
          onActivities={() => navigate("/staff/myActivities")}
          onRequireLogin={requireLogin}
        />
        <HeaderSpacer />
        <main className="pb-20">
          <div className="mx-auto w-full max-w-7/10 px-4 pt-10">
            <button
              type="button"
              onClick={onBack}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#e84c3d] hover:text-[#c03428]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m15 6-6 6 6 6" />
              </svg>
              กลับ
            </button>

            <div className="rounded-[24px] border border-black/10 bg-white px-6 py-12 text-center text-sm text-gray-600 shadow-sm">
              ไม่พบกิจกรรมนี้ หรืออาจถูกลบออกแล้ว
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- prepare initial form values ---------------------------
  const startISO = event.startTime || event.date || "";
  const d = startISO ? new Date(startISO) : null;
  const initialDate = d ? d.toISOString().slice(0, 10) : ""; // yyyy-mm-dd
  const initialTime = d ? d.toTimeString().slice(0, 5) : ""; // hh:mm

  const [form, setForm] = useState({
    title: event.title || "",
    category: event.category || event.type || "",
    date: initialDate,
    time: initialTime,
    capacity: event.maxCapacity != null ? String(event.maxCapacity) : "",
    location: event.location || "",
    contact: event.contact || event.contactInfo || event.phone || event.email || "",
    description: event.description || "",
    website: event.website || event.registerLink || "",
    isPublic: event.isPublic || false,
  });

  // รูปภาพ
  const [previewImage, setPreviewImage] = useState(event.coverUrl || null);
  const [imageFile, setImageFile] = useState(null);

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewImage(null);
  };

  // --- submit (now saves to backend) -------------------------
  const doSave = async () => {
    try {
      const payload = {
        ...event,
        title: form.title.trim(),
        category: form.category.trim(),
        startTime: buildStartISO(startISO, form.date, form.time),
        maxCapacity: form.capacity.trim() === "" ? null : Number(form.capacity.trim()),
        location: form.location.trim(),
        contact: form.contact.trim(),
        description: form.description.trim(),
        website: form.website.trim(),
        isPublic: form.isPublic,
        coverPreview: previewImage,
      };
      
      console.log("📌 Saving event:", payload);
      
      await updateEvent(event.id, payload);
      
      alert("✅ บันทึกการแก้ไขสำเร็จ!");
      navigate("/staff/myActivities");
      
    } catch (error) {
      console.error("❌ Error saving event:", error);
      alert("เกิดข้อผิดพลาด: " + (error.message || "ไม่สามารถบันทึกได้"));
    }
  };

  const handleClickCancel = () => setConfirmType("cancel");
  const handleClickSave = () => setConfirmType("save");

  const handleConfirmPopup = () => {
    if (confirmType === "save") doSave();
    else if (confirmType === "cancel") onBack();
    setConfirmType(null);
  };
  const handleCancelPopup = () => setConfirmType(null);

  const popupMessage =
    confirmType === "save"
      ? "คุณแน่ใจหรือไม่ที่จะบันทึกการแก้ไขกิจกรรมนี้"
      : "คุณแน่ใจหรือไม่ที่จะยกเลิกการแก้ไขกิจกรรมนี้";

  // Pre-build field configs to reduce repetitive JSX
  const fields = [
    [
      "ประเภท",
      <input
        key="category"
        type="text"
        value={form.category}
        onChange={set("category")}
        placeholder="เช่น วิชาการ, กิจกรรมกีฬา"
        className="w-full bg-transparent border-none outline-none focus:ring-0"
      />,
    ],
    [
      "สถานะ",
      <label key="isPublic" className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isPublic || false}
          onChange={(e) => setForm(f => ({ ...f, isPublic: e.target.checked }))}
          className="h-4 w-4 rounded border-gray-300 text-[#e84c3d] focus:ring-[#e84c3d]"
        />
        <span className="text-sm">
          {form.isPublic ? "เผยแพร่สาธารณะ (แสดงให้ User เห็น)" : "แบบร่าง (Draft - เห็นแค่ Staff)"}
        </span>
      </label>,
    ],
    [
      "วันเริ่มกิจกรรม",
      <input
        key="date"
        type="date"
        value={form.date}
        onChange={set("date")}
        className="w-full bg-transparent border-none outline-none focus:ring-0"
      />,
    ],
    [
      "เวลาที่เริ่ม",
      <input
        key="time"
        type="time"
        value={form.time}
        onChange={set("time")}
        className="w-full bg-transparent border-none outline-none focus:ring-0"
      />,
    ],
    [
      "จำนวนที่รับ",
      <input
        key="capacity"
        type="number"
        min="0"
        value={form.capacity}
        onChange={set("capacity")}
        placeholder="เว้นว่างหากไม่จำกัดจำนวน"
        className="w-full bg-transparent border-none outline-none focus:ring-0"
      />,
    ],
    [
      "สถานที่จัด",
      <input
        key="location"
        type="text"
        value={form.location}
        onChange={set("location")}
        placeholder="เช่น อาคารเรียนรวม ห้อง 101"
        className="w-full bg-transparent border-none outline-none focus:ring-0"
      />,
    ],
    [
      "ติดต่อสอบถาม",
      <input
        key="contact"
        type="text"
        value={form.contact}
        onChange={set("contact")}
        placeholder="เช่น Line @example หรือเบอร์โทร"
        className="w-full bg-transparent border-none outline-none focus:ring-0"
      />,
    ],
  ];

  return (
    <div style={{ background: THEME.page, color: THEME.text, minHeight: "100vh" }}>
      <StaffHeader
        auth={auth}
        navigate={navigate}
        notifications={data?.notifications || []}
        onAddActivityJump={handleAddActivityJump}
        onActivities={() => navigate("/staff/myActivities")}
        onRequireLogin={requireLogin}
      />
      <HeaderSpacer />

      <main className="pb-20">
        <div className="mx-auto flex w-full max-w-7/10 flex-col gap-6 px-4 md:px-6">
          {/* ปุ่มกลับ – ตอนนี้เปิด popup ยกเลิกการแก้ไข */}
          <button
            type="button"
            onClick={handleClickCancel}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#e84c3d] hover:text-[#c03428]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m15 6-6 6 6 6" />
            </svg>
            กลับ
          </button>

          {/* การ์ดหลักแบบใน figma */}
          <article className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
            <div className="grid gap-6 px-6 pb-8 pt-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1.3fr)] md:px-10">
              {/* ซ้าย: รูปกิจกรรม */}
              <div className="space-y-4">
                <ImageUploader
                  preview={previewImage}
                  onPick={handleImageChange}
                  onRemove={handleRemoveImage}
                  alt={form.title || event.title}
                />
              </div>

              {/* ขวา: ข้อมูลสรุป */}
              <div className="flex flex-col gap-4 rounded-[24px] border border-black/5 bg-white px-5 py-5">
                {/* ชื่อกิจกรรมในกรอบใหญ่ */}
                <div className="rounded-[24px] border border-black/10 bg-white px-5 py-3">
                  <input
                    type="text"
                    value={form.title}
                    onChange={set("title")}
                    placeholder="ชื่อกิจกรรม"
                    className="w-full border-none bg-transparent text-base md:text-lg font-semibold leading-snug text-gray-900 focus:outline-none focus:ring-0"
                  />
                </div>

                {/* แถวข้อมูลแบบ pill */}
                <div className="mt-1 flex flex-col gap-3 text-xs md:text-sm">
                  {fields.map(([label, field]) => (
                    <PillRow key={label} label={label}>{field}</PillRow>
                  ))}
                </div>
              </div>
            </div>

            {/* รายละเอียด + ช่องทางสมัคร */}
            <div className="space-y-4 px-6 pb-8 md:px-10">
              <section className="rounded-[24px] border border-black/10 bg-white px-5 py-4">
                <h2 className="mb-2 text-sm font-semibold text-gray-900">รายละเอียดเพิ่มเติม</h2>
                <textarea
                  value={form.description}
                  onChange={set("description")}
                  placeholder="อธิบายรายละเอียดกิจกรรม จุดประสงค์ รูปแบบ และข้อมูลอื่น ๆ"
                  className="w-full min-h-[140px] resize-none border-none bg-transparent text-sm leading-7 text-gray-700 focus:outline-none focus:ring-0"
                />
              </section>

              <section className="rounded-[24px] border border-black/10 bg-white px-5 py-4">
                <h2 className="mb-2 text-sm font-semibold text-gray-900">ช่องทางการสมัคร</h2>
                <input
                  type="text"
                  value={form.website}
                  onChange={set("website")}
                  placeholder="ลิงก์ฟอร์มสมัคร หรือช่องทางอื่น ๆ"
                  className="w-full border-none bg-transparent text-sm text-gray-700 break-words focus:outline-none focus:ring-0"
                />
              </section>

              {/* ปุ่มด้านล่างขวา */}
              <div className="mt-4 flex flex-col gap-3 border-t border-black/5 pt-4 pb-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-black/5"
                  onClick={handleClickCancel}
                >
                  ยกเลิกการแก้ไข
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-[#e84c3d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#c03428]"
                  onClick={handleClickSave}
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />

      {/* Popup ยืนยัน */}
      <StaffConfirmPopup
        open={!!confirmType}
        title="คุณแน่ใจหรือไม่?"
        message={popupMessage}
        confirmLabel="ยืนยัน"
        cancelLabel="ยกเลิก"
        onConfirm={handleConfirmPopup}
        onCancel={handleCancelPopup}
      />
    </div>
  );
}
