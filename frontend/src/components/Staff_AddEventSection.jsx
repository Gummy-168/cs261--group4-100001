// src/components/Staff_AddEventSection.jsx (แก้ไขแล้ว)

import React, { useState } from "react";
import { createEvent } from "../services/eventService";
import { uploadImage } from "../services/imageService"; // ⭐️ [FIX 1] Import service
import toast from "react-hot-toast";

function ImageUploader({ preview, onPick, onClear, alt }) {
  // ... (ส่วนนี้เหมือนเดิม ไม่ต้องแก้ไข) ...
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

export default function StaffAddEventSection({ onEventAdded }) {
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [seatCount, setSeatCount] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); // ⭐️ [FIX 2] เพิ่ม State เก็บ File
  const [submitting, setSubmitting] = useState(false);

  const inputClass =
    "w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e84c3d]/40";

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file); // ⭐️ [FIX 3] เก็บ File object

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result); // เก็บ Base64 ไว้โชว์
      e.target.value = ""; // allow re-select same file
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setPreviewImage(null);
    setImageFile(null); // ⭐️ [FIX 4] ล้าง File object ด้วย
  };

  const handleSeatChange = (e) => {
    const value = e.target.value;
    if (value === "") return setSeatCount("");
    setSeatCount(value.replace(/[^0-9]/g, ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    
    setSubmitting(true);

    const form = e.target;
    let finalRelativePath = null; // ⭐️ [FIX 5] เตรียมตัวแปรเก็บ Path รูปภาพ

    // ⭐️ [FIX 6] อัปโหลดรูปภาพก่อน (ถ้ามี)
    if (imageFile) {
      toast.loading('กำลังอัปโหลดรูปภาพ...');
      try {
        const uploadResponse = await uploadImage(imageFile);
        
        if (uploadResponse && uploadResponse.imageUrl) {
          let path = uploadResponse.imageUrl; // e.g., /api/images/new.png
          if (path.startsWith('/')) {
            path = path.substring(1); // e.g., api/images/new.png
          }
          finalRelativePath = path;
          toast.dismiss();
          toast.success('อัปโหลดรูปสำเร็จ!');
        } else {
          throw new Error('ไม่ได้รับ "imageUrl" รูปภาพจาก Server');
        }
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        toast.dismiss();
        toast.error(`อัปโหลดรูปไม่สำเร็จ: ${uploadError.message}`);
        setSubmitting(false); // หยุดการ submit
        return; 
      }
    }
    
    // ดึง admin email จาก localStorage
    const adminEmail = localStorage.getItem('adminEmail');
    if (!adminEmail) {
      toast.error('ไม่พบข้อมูล Admin กรุณา Login ใหม่');
      setSubmitting(false);
      return;
    }
    
    // แปลง datetime-local เป็น ISO format
    const eventDateTime = form.eventDateTime.value;
    if (!eventDateTime) {
      toast.error('กรุณาระบุวันเวลากิจกรรม');
      setSubmitting(false);
      return;
    }
    
    // ⭐️ [FIX 7] สร้าง payload พร้อม imageUrl ที่ได้จากการอัปโหลด
    const payload = {
      title: form.title.value,
      description: form.description.value,
      location: form.location.value,
      startTime: eventDateTime, // Backend รับ LocalDateTime format
      endTime: eventDateTime, // ใช้เวลาเดียวกันก่อน
      category: form.category.value,
      organizer: form.contact.value, // ใช้ contact เป็น organizer
      maxCapacity: isUnlimited ? 999999 : (seatCount ? Number(seatCount) : 0),
      currentParticipants: 0,
      status: 'OPEN',
      fee: 0.0,
      isPublic: false, // ตั้งเป็น Draft ก่อน
      imageUrl: finalRelativePath, // ⭐️ ส่ง Path ที่ถูกต้อง (หรือ null ถ้าไม่มี)
    };
    
    try {
      await createEvent(payload);
      toast.success('เพิ่มกิจกรรมสำเร็จ! (สถานะ: Draft)');
      
      // Reset form
      form.reset();
      setPreviewImage(null);
      setImageFile(null); // ⭐️ [FIX 8] Reset File object
      setSeatCount("");
      setIsUnlimited(false);
      
      if (onEventAdded) {
        onEventAdded();
      } else {
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.dismiss(); // เผื่อ toast loading ค้าง
      if (!String(error.message).includes('อัปโหลดรูปไม่สำเร็จ')) {
          toast.error(error.message || 'ไม่สามารถเพิ่มกิจกรรมได้');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="staff-add-event" className="rounded-[28px] border border-black/5 bg-white px-8 py-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <h2 className="text-2xl font.semibold text-gray-900 mb-4">เพิ่มกิจกรรม</h2>

      <form onSubmit={handleSubmit} className="mt-2 grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] items-start">
        {/* Left: image + inputs */}
        <div className="space-y-4">
          <ImageUploader 
            preview={previewImage} 
            onPick={handleImageChange} 
            onClear={handleClearImage} // ⭐️ [FIX 9] ใช้ onClear ที่แก้ไขแล้ว
            alt="ภาพกิจกรรม" 
          />

          {/* ... (ส่วน input ที่เหลือเหมือนเดิม) ... */}
          <div className="space-y-3">
            <input type="datetime-local" name="eventDateTime" id="eventDateTime" className={inputClass} placeholder="วันเวลากิจกรรม" required />
            <input type="text" name="location" placeholder="สถานที่จัดกิจกรรม" className={inputClass} required />

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
            <input type="text" name="title" placeholder="ชื่อกิจกรรม" className={inputClass + " flex-1"} required />
            <input type="text" name="category" placeholder="ประเภทกิจกรรม" className={inputClass + " flex-1"} required />
          </div>

          <textarea name="description" placeholder="คำบรรยายรายละเอียดกิจกรรม" className="mt-4 flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm resize-none min-h-[220px] focus:outline-none focus:ring-2 focus:ring-[#e84c3d]/40" required />

          <div className="mt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#e84c3d] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#d63a2b] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              {submitting ? 'กำลังบันทึก...' : 'เพิ่มกิจกรรม'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
