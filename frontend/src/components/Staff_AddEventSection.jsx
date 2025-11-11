// src/Page/Staff_AddEventSection.jsx (refactored)
import React, { useState } from "react";

function ImageUploader({ preview, onPick, onClear, alt }) {
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
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            เพิ่มรูปภาพ
          </span>
          <input type="file" accept="image/*" onChange={onPick} className="hidden" />
        </label>
        {preview && (
          <button type="button" onClick={onClear} className="inline-flex items-center justify-center bg-white text-gray-700 hover:text-white hover:bg-red-600 rounded-full p-2 shadow-md transition" title="ลบรูปภาพ">
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

export default function StaffAddEventSection() {
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [seatCount, setSeatCount] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const inputClass =
    "w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e84c3d]/40";

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      e.target.value = ""; // allow re-select same file
    };
    reader.readAsDataURL(file);
  };

  const handleSeatChange = (e) => {
    const value = e.target.value;
    if (value === "") return setSeatCount("");
    setSeatCount(value.replace(/[^0-9]/g, ""));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      dateTime: form.eventDateTime.value,
      title: form.title.value,
      category: form.category.value,
      description: form.description.value,
      location: form.location.value,
      seats: isUnlimited ? null : seatCount ? Number(seatCount) : 0,
      isUnlimited,
      registerLink: form.registerLink.value,
      contact: form.contact.value,
      coverPreview: previewImage,
    };
    console.log("payload to submit:", payload);
    // TODO: ต่อ API ที่นี่
  };

  return (
    <section id="staff-add-event" className="rounded-[28px] border border-black/5 bg-white px-8 py-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">เพิ่มกิจกรรม</h2>

      <form onSubmit={handleSubmit} className="mt-2 grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] items-start">
        {/* Left: image + inputs */}
        <div className="space-y-4">
          <ImageUploader preview={previewImage} onPick={handleImageChange} onClear={() => setPreviewImage(null)} alt="ภาพกิจกรรม" />

          <div className="space-y-3">
            <input type="datetime-local" name="eventDateTime" id="eventDateTime" className={inputClass} placeholder="วันเวลากิจกรรม" />
            <input type="text" name="location" placeholder="สถานที่จัดกิจกรรม" className={inputClass} />

            <div className="flex items-center gap-3">
              <input type="number" min="0" name="seats" value={seatCount} onChange={handleSeatChange} placeholder="จำนวนที่นั่ง" disabled={isUnlimited} className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-400`} />
              <label className="flex items-center gap-2 text-xs md:text-sm text-gray-600 whitespace-nowrap">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" checked={isUnlimited} onChange={(e) => setIsUnlimited(e.target.checked)} />
                ไม่จำกัดที่นั่ง
              </label>
            </div>

            <input type="text" name="registerLink" placeholder="ช่องทางการสมัคร เช่น ลิงก์ Google Form" className={inputClass} />
            <input type="text" name="contact" placeholder="ช่องทางการติดต่อ เช่น Line @example หรือ Email" className={inputClass} />
          </div>
        </div>

        {/* Right: title + category + description + submit */}
        <div className="flex flex-col h-full">
          <div className="flex flex-col gap-3 md:flex-row">
            <input type="text" name="title" placeholder="ชื่อกิจกรรม" className={inputClass + " flex-1"} />
            <input type="text" name="category" placeholder="ประเภทกิจกรรม" className={inputClass + " flex-1"} />
          </div>

          <textarea name="description" placeholder="คำบรรยายรายละเอียดกิจกรรม" className="mt-4 flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm resize-none min-h-[220px] focus:outline-none focus:ring-2 focus:ring-[#e84c3d]/40" />

          <div className="mt-4 flex justify-end">
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-[#e84c3d] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#d63a2b] transition">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              เพิ่มกิจกรรม
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
