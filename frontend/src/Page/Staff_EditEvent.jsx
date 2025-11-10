// src/Page/Staff_EditEvent.jsx
import { useMemo, useState } from "react";
import StaffHeader, { HeaderSpacer } from "../components/Staff_Header";
import Footer from "../components/Footer";
import { THEME } from "../theme";

// --- helpers -------------------------------------------------

function combineEventSources(data, eventId) {
  if (!data) return null;
  const targetId = eventId?.toString();
  if (!targetId) return null;

  const pool = [...(data.events ?? []), ...(data.favoriteEvents ?? [])];

  return (
    pool.find(
      (item) =>
        item &&
        item.id != null &&
        item.id.toString() === targetId
    ) ?? null
  );
}

// label pill ทางซ้าย
function PillLabel({ children }) {
  if (!children) return null;
  return (
    <span className="inline-flex min-w-[120px] justify-center rounded-full border border-gray-800 px-4 py-1.5 text-xs font-medium text-gray-900">
      {children}
    </span>
  );
}

// กล่อง value ทางขวา (ห่อ input/textarea ด้านใน)
function PillField({ children }) {
  return (
    <div className="inline-flex flex-1 items-center rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs md:text-sm text-gray-800">
      {children}
    </div>
  );
}

// --- main page -------------------------------------------------

export default function StaffEditEventPage({
  navigate,
  auth,
  data,
  eventId,
}) {
  const event = useMemo(
    () => combineEventSources(data, eventId),
    [data, eventId]
  );

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
        <StaffHeader auth={auth} navigate={navigate} />
        <HeaderSpacer />
        <main className="pb-20">
          <div className="mx-auto w-full max-w-7/10 px-4 pt-10">
            <button
              type="button"
              onClick={onBack}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#e84c3d] hover:text-[#c03428]"
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

            <div className="rounded-[24px] border border-black/10 bg-white px-6 py-12 text-center text-sm text-gray-600 shadow-sm">
              ไม่พบกิจกรรมนี้ หรืออาจถูกลบออกแล้ว
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- เตรียมค่าเริ่มต้นสำหรับฟอร์ม -------------------------

  const startISO = event.startTime || event.date || null;
  let initialDate = "";
  let initialTime = "";
  if (startISO) {
    const d = new Date(startISO);
    // yyyy-mm-dd
    initialDate = d.toISOString().slice(0, 10);
    // hh:mm
    initialTime = d.toTimeString().slice(0, 5);
  }

  const [title, setTitle] = useState(event.title || "");
  const [category, setCategory] = useState(event.category || event.type || "");
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [capacity, setCapacity] = useState(
    event.maxCapacity != null ? String(event.maxCapacity) : ""
  );
  const [location, setLocation] = useState(event.location || "");
  const [contact, setContact] = useState(
    event.contact ||
      event.contactInfo ||
      event.phone ||
      event.email ||
      ""
  );
  const [description, setDescription] = useState(
    event.description || ""
  );
  const [website, setWebsite] = useState(
    event.website || event.registerLink || ""
  );

  // รูปภาพ
  const [previewImage, setPreviewImage] = useState(event.coverUrl || null);
  const [imageFile, setImageFile] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewImage(null);
  };

  // --- submit (ตอนนี้ log payload ไว้ดูก่อน) -------------------

  const handleSave = () => {
    let updatedStartTime = event.startTime || event.date || null;
    if (date) {
      // ถ้ามี date ให้ใช้ date + time เป็น ISO ใหม่
      const timePart = time || "00:00";
      updatedStartTime = new Date(`${date}T${timePart}:00`).toISOString();
    }

    const payload = {
      ...event,
      title: title.trim(),
      category: category.trim(),
      startTime: updatedStartTime,
      maxCapacity:
        capacity.trim() === "" ? null : Number(capacity.trim()),
      location: location.trim(),
      contact: contact.trim(),
      description: description.trim(),
      website: website.trim(),
      // ถ้ามีอัปโหลดใหม่จริง ๆ ควรส่ง imageFile ไปกับ form-data
      // ตอนนี้ลองเก็บ previewImage ให้ดูเฉย ๆ
      coverPreview: previewImage,
    };

    console.log("📌 payload สำหรับส่งแก้ไขกิจกรรม:", payload);
    alert("ตอนนี้ยังไม่ต่อ API จริง ๆ นะ แค่ log payload ให้ดูก่อน 😊");
  };

  return (
    <div
      style={{
        background: THEME.page,
        color: THEME.text,
        minHeight: "100vh",
      }}
    >
      <StaffHeader auth={auth} navigate={navigate} />
      <HeaderSpacer />

      <main className="pb-20">
        <div className="mx-auto flex w-full max-w-7/10 flex-col gap-6 px-4 md:px-6">
          {/* ปุ่มกลับ */}
          <button
            type="button"
            onClick={onBack}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#e84c3d] hover:text-[#c03428]"
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

          {/* การ์ดหลักแบบใน figma */}
          <article className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
            <div className="grid gap-6 px-6 pb-8 pt-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1.3fr)] md:px-10">
              {/* ซ้าย: รูปกิจกรรม */}
              <div className="space-y-4">
                <div className="relative group flex aspect-[5/3] items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={title || event.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-10 w-10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="4" width="18" height="14" rx="2" />
                        <path d="M7 13l3-3 3 4 2-2 3 4" />
                        <circle cx="9" cy="8" r="1" />
                      </svg>
                      <p className="text-sm">ภาพโปรโมตกิจกรรม</p>
                      <p className="text-xs text-gray-400">ขนาด 5:3</p>
                    </div>
                  )}

                  {/* overlay ปุ่มอัปโหลด / ลบรูป แสดงตอน hover */}
                  <label className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#e84c3d] shadow-md hover:bg-[#e84c3d] hover:text-white transition">
                      แก้ไขรูปภาพ
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {previewImage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-medium text-red-600 shadow-sm hover:bg-white"
                      >
                        <span>ลบรูปภาพ</span>
                      </button>
                    )}
                  </label>
                </div>
              </div>

              {/* ขวา: ข้อมูลสรุป */}
              <div className="flex flex-col gap-4 rounded-[24px] border border-black/5 bg-white px-5 py-5">
                {/* ชื่อกิจกรรมในกรอบใหญ่ */}
                <div className="rounded-[24px] border border-black/10 bg-white px-5 py-3">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ชื่อกิจกรรม"
                    className="w-full border-none bg-transparent text-base md:text-lg font-semibold leading-snug text-gray-900 focus:outline-none focus:ring-0"
                  />
                </div>

                {/* แถวข้อมูลแบบ pill */}
                <div className="mt-1 flex flex-col gap-3 text-xs md:text-sm">
                  {/* ประเภท */}
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <PillLabel>ประเภท</PillLabel>
                    <PillField>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="เช่น วิชาการ, กิจกรรมกีฬา"
                        className="w-full bg-transparent outline-none focus:ring-0"
                      />
                    </PillField>
                  </div>

                  {/* วันเริ่ม + เวลาเริ่ม */}
                  <div className="flex flex-col gap-2 md:flex-row md:gap-3">
                    <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-3">
                      <PillLabel>วันเริ่มกิจกรรม</PillLabel>
                      <PillField>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full bg-transparent outline-none focus:ring-0"
                        />
                      </PillField>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-3">
                      <PillLabel>เวลาที่เริ่ม</PillLabel>
                      <PillField>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full bg-transparent outline-none focus:ring-0"
                        />
                      </PillField>
                    </div>
                  </div>

                  {/* จำนวนที่รับ */}
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <PillLabel>จำนวนที่รับ</PillLabel>
                    <PillField>
                      <input
                        type="number"
                        min="0"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        placeholder="เว้นว่างหากไม่จำกัดจำนวน"
                        className="w-full bg-transparent outline-none focus:ring-0"
                      />
                    </PillField>
                  </div>

                  {/* สถานที่จัด */}
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <PillLabel>สถานที่จัด</PillLabel>
                    <PillField>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="เช่น อาคารเรียนรวม ห้อง 101"
                        className="w-full bg-transparent outline-none focus:ring-0"
                      />
                    </PillField>
                  </div>

                  {/* ติดต่อสอบถาม */}
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <PillLabel>ติดต่อสอบถาม</PillLabel>
                    <PillField>
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="เช่น Line @example หรือเบอร์โทร"
                        className="w-full bg-transparent outline-none focus:ring-0"
                      />
                    </PillField>
                  </div>
                </div>
              </div>
            </div>

            {/* รายละเอียด + ช่องทางสมัคร */}
            <div className="space-y-4 px-6 pb-8 md:px-10">
              <section className="rounded-[24px] border border-black/10 bg-white px-5 py-4">
                <h2 className="mb-2 text-sm font-semibold text-gray-900">
                  รายละเอียดเพิ่มเติม
                </h2>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="อธิบายรายละเอียดกิจกรรม จุดประสงค์ รูปแบบ และข้อมูลอื่น ๆ"
                  className="w-full min-h-[140px] resize-none border-none bg-transparent text-sm leading-7 text-gray-700 focus:outline-none focus:ring-0"
                />
              </section>

              <section className="rounded-[24px] border border-black/10 bg-white px-5 py-4">
                <h2 className="mb-2 text-sm font-semibold text-gray-900">
                  ช่องทางการสมัคร
                </h2>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="ลิงก์ฟอร์มสมัคร หรือช่องทางอื่น ๆ"
                  className="w-full border-none bg-transparent text-sm text-gray-700 break-words focus:outline-none focus:ring-0"
                />
              </section>

              {/* ปุ่มด้านล่างขวา */}
              <div className="mt-4 flex flex-col gap-3 border-t border-black/5 pt-4 pb-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-black/5"
                  onClick={onBack}
                >
                  ยกเลิกการแก้ไข
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-[#e84c3d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#c03428]"
                  onClick={handleSave}
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
